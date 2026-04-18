import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// ── Validate connection string exists ────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    '[nyay-mitra/database] DATABASE_URL is not set.\n' +
    'Add it to your .env file:\n' +
    '  DATABASE_URL=mysql://root:yourpassword@localhost:3306/nyay_mitra\n'
  );
}

// ── Singleton connection pool ─────────────────────────────────────────────────
const pool = mysql.createPool({
  uri: DATABASE_URL,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

export const db = drizzle(pool, { schema, mode: 'default', logger: process.env.DB_LOG === 'true' });

// Export everything for consuming services
export * from './schema';
export { schema };
