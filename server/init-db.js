import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const CREATE_USERS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login_name VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const CREATE_DEV_USERS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS dev_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query(CREATE_USERS_TABLE_SQL);
    await client.query(CREATE_DEV_USERS_TABLE_SQL);

    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    await client.query(
      `
        INSERT INTO users (login_name, password_hash, role, is_active)
        VALUES ($1, $2, 'admin', TRUE)
        ON CONFLICT (login_name)
        DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          role = 'admin',
          is_active = TRUE,
          updated_at = NOW()
      `,
      ['admin', adminPasswordHash]
    );

    // Seed the developer account
    const devPasswordHash = await bcrypt.hash('Decode2006@', 10);

    await client.query(
      `
        INSERT INTO dev_users (username, password_hash, display_name, is_active)
        VALUES ($1, $2, 'Shokhrukh', TRUE)
        ON CONFLICT (username)
        DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          display_name  = EXCLUDED.display_name,
          is_active     = TRUE,
          updated_at    = NOW()
      `,
      ['Shokhrukh', devPasswordHash]
    );

    console.log('Database initialized: users & dev_users tables ready. Developer account seeded.');
  } finally {
    client.release();
  }
};
