import { Client } from 'pg';
import { config } from './config.js';

const isSafeIdentifier = (value) => /^[A-Za-z0-9_]+$/.test(value);

export const ensureDatabaseExists = async () => {
  const dbName = config.db.database;

  if (!isSafeIdentifier(dbName)) {
    throw new Error(
      `Unsafe database name "${dbName}". Use only letters, numbers, and underscores.`
    );
  }

  const adminClient = new Client({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: 'postgres',
  });

  await adminClient.connect();

  try {
    const result = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1',
      [dbName]
    );

    if (result.rowCount && result.rowCount > 0) {
      return;
    }

    await adminClient.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Database created: ${dbName}`);
  } finally {
    await adminClient.end();
  }
};
