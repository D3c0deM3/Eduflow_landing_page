import { Pool } from 'pg';
import { config } from './config.js';

/**
 * Separate connection pool for the CRM database (crm_db).
 * This pool is used for:
 *  - Admin authentication (crm_db.superusers)
 *  - Dashboard data (students, payments, classes, etc.)
 */
export const crmPool = new Pool({
  host: config.crmDb.host,
  port: config.crmDb.port,
  user: config.crmDb.user,
  password: config.crmDb.password,
  database: config.crmDb.database,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});

crmPool.on('error', (error) => {
  console.error('Unexpected CRM PostgreSQL pool error (non-fatal):', error.message);
});
