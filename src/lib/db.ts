import { Pool } from 'pg';

let globalPool: Pool | null = null;

export function getDbPool() {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }
    
    globalPool = new Pool({
      connectionString,
      max: 10,                 // Limit active connections to 10 per serverless container
      idleTimeoutMillis: 10000, // Close idle connections after 10 seconds to stay under Supabase limits
      connectionTimeoutMillis: 5000,
    });
  }
  return globalPool;
}
