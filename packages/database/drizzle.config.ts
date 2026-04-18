import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/nyay_mitra';

export default {
  schema: './src/schema.ts',
  out: './migrations',
  driver: 'mysql2',
  dbCredentials: {
    uri: DATABASE_URL,
  },
  verbose: true,
  strict: false,
} satisfies Config;
