import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { pool } from './db.js';
import { crmPool } from './crm-db.js';
import { ensureDatabaseExists } from './bootstrap-db.js';
import { initializeDatabase } from './init-db.js';

// ── Prevent the process from crashing on unhandled errors ──
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection (server kept running):', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception (server kept running):', error);
});

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());

const signAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.superuser_id,
      login: user.username,
      role: user.role,
      centerId: user.center_id,
    },
    config.jwtSecret,
    { expiresIn: '8h' }
  );
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'Missing access token.' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const superuserId = Number(payload.sub);

    // Validate session against crm_db.superusers (admin-only auth)
    const result = await crmPool.query(
      `
        SELECT superuser_id, username, role, status, is_locked
        FROM superusers
        WHERE superuser_id = $1
        LIMIT 1
      `,
      [superuserId]
    );

    const user = result.rows[0];
    if (!user || user.status !== 'Active' || user.is_locked) {
      res.status(401).json({ message: 'Invalid session.' });
      return;
    }

    req.user = {
      id: user.superuser_id,
      login: user.username,
      role: user.role,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Database connection failed.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const login = typeof req.body?.login === 'string' ? req.body.login.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!login || !password) {
    res.status(400).json({ message: 'Login and password are required.' });
    return;
  }

  try {
    // Auth is handled exclusively through crm_db.superusers
    const result = await crmPool.query(
      `
        SELECT superuser_id, center_id, username, password_hash, role,
               status, is_locked, locked_until, login_attempts,
               first_name, last_name
        FROM superusers
        WHERE username = $1
        LIMIT 1
      `,
      [login]
    );

    const user = result.rows[0];

    // Account not found
    if (!user) {
      res.status(401).json({ message: 'Invalid login or password.' });
      return;
    }

    // Account locked
    if (user.is_locked) {
      const lockedUntil = user.locked_until ? new Date(user.locked_until) : null;
      if (!lockedUntil || lockedUntil > new Date()) {
        res.status(403).json({ message: 'Account is locked. Please contact your administrator.' });
        return;
      }
      // Lock has expired – clear it
      await crmPool.query(
        `UPDATE superusers SET is_locked = FALSE, locked_until = NULL, login_attempts = 0 WHERE superuser_id = $1`,
        [user.superuser_id]
      );
    }

    // Account not active
    if (user.status !== 'Active') {
      res.status(401).json({ message: 'Invalid login or password.' });
      return;
    }

    // CRM hashes passwords with plain SHA-256 (hex)
    const sha256 = crypto.createHash('sha256').update(password).digest('hex');
    const passwordMatches = sha256 === user.password_hash;

    if (!passwordMatches) {
      // Increment failed attempt counter
      await crmPool.query(
        `UPDATE superusers SET login_attempts = login_attempts + 1, updated_at = NOW() WHERE superuser_id = $1`,
        [user.superuser_id]
      );
      res.status(401).json({ message: 'Invalid login or password.' });
      return;
    }

    // Successful login – reset attempt counter and persist last_login
    await crmPool.query(
      `UPDATE superusers SET login_attempts = 0, last_login = NOW(), updated_at = NOW() WHERE superuser_id = $1`,
      [user.superuser_id]
    );

    const token = signAccessToken(user);
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;

    res.json({
      token,
      user: {
        id: user.superuser_id,
        login: user.username,
        role: user.role,
        displayName,
        centerId: user.center_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (_req, res) => {
  res.status(204).end();
});

/* ──────────────────────────────────────────────────────────────────────────── */
/* Dashboard endpoints – all data sourced from crm_db                          */
/* ──────────────────────────────────────────────────────────────────────────── */

/**
 * GET /api/dashboard/stats
 * Returns the four KPI stat cards.
 */
app.get('/api/dashboard/stats', authMiddleware, async (_req, res) => {
  try {
    const [studentsRes, classesRes, revenueRes, debtRes] = await Promise.all([
      crmPool.query(`SELECT COUNT(*) AS count FROM students WHERE status = 'Active'`),
      crmPool.query(`SELECT COUNT(*) AS count FROM classes`),
      crmPool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM payments
         WHERE payment_status = 'Completed'
           AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)`
      ),
      crmPool.query(
        `SELECT COALESCE(SUM(balance), 0) AS total FROM debts WHERE balance > 0`
      ),
    ]);

    res.json({
      totalStudents: Number(studentsRes.rows[0].count),
      activeClasses: Number(classesRes.rows[0].count),
      monthlyRevenue: Number(revenueRes.rows[0].total),
      outstandingDebt: Number(debtRes.rows[0].total),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
});

/**
 * GET /api/dashboard/enrollment-trend
 * Monthly new student registrations for the last 6 months.
 */
app.get('/api/dashboard/enrollment-trend', authMiddleware, async (_req, res) => {
  try {
    const result = await crmPool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
        DATE_TRUNC('month', created_at) AS month_start,
        COUNT(*) AS students
      FROM students
      WHERE created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);
    res.json(result.rows.map((r) => ({ month: r.month, students: Number(r.students) })));
  } catch (error) {
    console.error('Enrollment trend error:', error);
    res.status(500).json({ message: 'Failed to fetch enrollment trend.' });
  }
});

/**
 * GET /api/dashboard/payments-trend
 * Monthly completed payment totals for the last 8 months.
 */
app.get('/api/dashboard/payments-trend', authMiddleware, async (_req, res) => {
  try {
    const result = await crmPool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', payment_date), 'Mon') AS month,
        DATE_TRUNC('month', payment_date) AS month_start,
        ROUND(SUM(amount)::numeric, 2) AS total
      FROM payments
      WHERE payment_status = 'Completed'
        AND payment_date >= DATE_TRUNC('month', NOW()) - INTERVAL '7 months'
      GROUP BY DATE_TRUNC('month', payment_date)
      ORDER BY DATE_TRUNC('month', payment_date)
    `);
    res.json(result.rows.map((r) => ({ month: r.month, total: Number(r.total) })));
  } catch (error) {
    console.error('Payments trend error:', error);
    res.status(500).json({ message: 'Failed to fetch payments trend.' });
  }
});

/**
 * GET /api/dashboard/student-status
 * Student count grouped by enrollment status (Active, Inactive, Graduated, Removed).
 */
app.get('/api/dashboard/student-status', authMiddleware, async (_req, res) => {
  try {
    const result = await crmPool.query(`
      SELECT status, COUNT(*) AS value
      FROM students
      GROUP BY status
      ORDER BY status
    `);
    const COLORS = { Active: '#00F0FF', Inactive: '#eab308', Graduated: '#3b82f6', Removed: '#6b7280' };
    const data = result.rows.map((r) => ({
      name: r.status,
      value: Number(r.value),
      color: COLORS[r.status] ?? '#94a3b8',
    }));
    res.json(data);
  } catch (error) {
    console.error('Student status error:', error);
    res.status(500).json({ message: 'Failed to fetch student status distribution.' });
  }
});

/**
 * GET /api/dashboard/student-overview
 * Funnel-style breakdown: Total → Active → With completed payments → With open debts.
 */
app.get('/api/dashboard/student-overview', authMiddleware, async (_req, res) => {
  try {
    const [totalRes, activeRes, paidRes, debtRes] = await Promise.all([
      crmPool.query(`SELECT COUNT(*) AS count FROM students`),
      crmPool.query(`SELECT COUNT(*) AS count FROM students WHERE status = 'Active'`),
      crmPool.query(
        `SELECT COUNT(DISTINCT student_id) AS count FROM payments WHERE payment_status = 'Completed'`
      ),
      crmPool.query(
        `SELECT COUNT(DISTINCT student_id) AS count FROM debts WHERE balance > 0`
      ),
    ]);
    res.json([
      { label: 'Total Students', value: Number(totalRes.rows[0].count) },
      { label: 'Active', value: Number(activeRes.rows[0].count) },
      { label: 'Paid Fees', value: Number(paidRes.rows[0].count) },
      { label: 'With Debts', value: Number(debtRes.rows[0].count) },
    ]);
  } catch (error) {
    console.error('Student overview error:', error);
    res.status(500).json({ message: 'Failed to fetch student overview.' });
  }
});

/**
 * GET /api/dashboard/upcoming
 * Up to 4 upcoming active tests ordered by start_date.
 * Falls back to upcoming assignments if no tests are scheduled.
 */
app.get('/api/dashboard/upcoming', authMiddleware, async (_req, res) => {
  try {
    const testsRes = await crmPool.query(`
      SELECT
        test_name AS title,
        test_type AS subtitle,
        start_date,
        end_date,
        duration_minutes
      FROM tests
      WHERE is_active = TRUE AND start_date >= NOW()
      ORDER BY start_date
      LIMIT 4
    `);

    if (testsRes.rows.length > 0) {
      res.json(testsRes.rows.map((r, i) => ({
        id: i + 1,
        title: r.title,
        subtitle: r.subtitle,
        time: new Date(r.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: (() => {
          const d = new Date(r.start_date);
          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(today.getDate() + 1);
          if (d.toDateString() === today.toDateString()) return 'Today';
          if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        })(),
        durationMin: r.duration_minutes,
      })));
      return;
    }

    // Fallback: upcoming assignments
    const assignRes = await crmPool.query(`
      SELECT
        a.assignment_title AS title,
        a.due_date,
        c.class_name AS subtitle,
        (SELECT COUNT(*) FROM students s WHERE s.class_id = a.class_id AND s.status = 'Active') AS students
      FROM assignments a
      LEFT JOIN classes c ON c.class_id = a.class_id
      WHERE a.due_date >= NOW() AND a.status = 'Pending'
      ORDER BY a.due_date
      LIMIT 4
    `);

    res.json(assignRes.rows.map((r, i) => ({
      id: i + 1,
      title: r.title,
      subtitle: r.subtitle || 'Assignment',
      time: new Date(r.due_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: (() => {
        const d = new Date(r.due_date);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      })(),
      students: Number(r.students ?? 0),
    })));
  } catch (error) {
    console.error('Upcoming events error:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming events.' });
  }
});

/**
 * GET /api/dashboard/recent-activity
 * Latest 5 events: newest student registrations + newest payments, merged and sorted.
 */
app.get('/api/dashboard/recent-activity', authMiddleware, async (_req, res) => {
  try {
    const result = await crmPool.query(`
      SELECT type, name, ref, amount, created_at FROM (
        SELECT
          'enrollment' AS type,
          s.first_name || ' ' || s.last_name AS name,
          s.enrollment_number AS ref,
          NULL::numeric AS amount,
          s.created_at
        FROM students s
        ORDER BY s.created_at DESC
        LIMIT 5
      ) enrollments
      UNION ALL
      SELECT type, name, ref, amount, created_at FROM (
        SELECT
          'payment' AS type,
          st.first_name || ' ' || st.last_name AS name,
          p.receipt_number AS ref,
          p.amount,
          p.created_at
        FROM payments p
        JOIN students st ON st.student_id = p.student_id
        WHERE p.payment_status = 'Completed'
        ORDER BY p.created_at DESC
        LIMIT 5
      ) payments_data
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json(result.rows.map((r) => ({
      type: r.type,
      name: r.name,
      ref: r.ref,
      amount: r.amount ? Number(r.amount) : null,
      time: (() => {
        const diff = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
        return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) !== 1 ? 's' : ''} ago`;
      })(),
    })));
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Failed to fetch recent activity.' });
  }
});

app.use((error, _req, res, _next) => {
  console.error('Unhandled request error:', error);
  res.status(500).json({ message: 'Internal server error.' });
});

const start = async () => {
  try {
    await ensureDatabaseExists();
    await initializeDatabase();

    const server = app.listen(config.port, () => {
      console.log(`EduFlow backend is running on http://localhost:${config.port}`);
    });

    server.keepAliveTimeout = 65_000;
    server.headersTimeout = 66_000;

    // Periodic DB ping – keeps the pool warm AND the event loop alive
    const keepAlive = setInterval(async () => {
      try {
        await pool.query('SELECT 1');
      } catch (err) {
        console.error('Keep-alive ping failed:', err.message);
      }
    }, 30_000);
    keepAlive.unref(); // don't block exit if the server is actually closing

    // Log when the process is about to exit (debugging aid)
    process.on('exit', (code) => {
      console.log(`Process exiting with code ${code}`);
    });

    // On Windows, only honour a deliberate double Ctrl+C to shut down
    let shutdownRequested = false;
    process.on('SIGINT', () => {
      if (!shutdownRequested) {
        shutdownRequested = true;
        console.log('\nPress Ctrl+C again within 3 s to stop the server.');
        setTimeout(() => { shutdownRequested = false; }, 3_000).unref();
        return;
      }
      console.log('\nShutting down…');
      clearInterval(keepAlive);
      server.close(() => {
        pool.end().then(() => process.exit(0));
      });
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
};

start();
