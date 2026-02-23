import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.server'), override: true });

export const config = {
  port: Number(process.env.PORT || 4000),

  // EduFlow's own database (edu_flow) – used for app-level data if needed
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edu_flow',
  },

  // CRM database (crm_db) – source of truth for admin auth and dashboard data
  crmDb: {
    host: process.env.CRM_DB_HOST || 'localhost',
    port: Number(process.env.CRM_DB_PORT || 5432),
    user: process.env.CRM_DB_USER || 'crm_user',
    password: process.env.CRM_DB_PASSWORD || 'crm_password',
    database: process.env.CRM_DB_NAME || 'crm_db',
  },

  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
