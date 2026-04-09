import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// This file initializes a singleton Database connection pool for the Monorepo

const connectionString = process.env.DATABASE_URL || "postgres://postgres:nyaymitrapass@localhost:5432/nyay_mitra";

// Disable prefetch to support serverless / fastify environments efficiently
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

// Export everything from schema so consuming microservices can define fields and queries
export * from './schema';
