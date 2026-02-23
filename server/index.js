import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { pool } from './db.js';
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
      sub: user.id,
      login: user.login_name,
      role: user.role,
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
    const userId = Number(payload.sub);

    const result = await pool.query(
      `
        SELECT id, login_name, role, is_active
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

    const user = result.rows[0];
    if (!user || !user.is_active) {
      res.status(401).json({ message: 'Invalid session.' });
      return;
    }

    req.user = {
      id: user.id,
      login: user.login_name,
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
    const result = await pool.query(
      `
        SELECT id, login_name, password_hash, role, is_active
        FROM users
        WHERE login_name = $1
        LIMIT 1
      `,
      [login]
    );

    const user = result.rows[0];
    if (!user || !user.is_active) {
      res.status(401).json({ message: 'Invalid login or password.' });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      res.status(401).json({ message: 'Invalid login or password.' });
      return;
    }

    const token = signAccessToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        login: user.login_name,
        role: user.role,
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
