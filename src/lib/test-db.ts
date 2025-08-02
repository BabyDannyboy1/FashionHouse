import { pool } from './db';

async function testConnection() {
  try {
    if (!pool) {
      throw new Error('Pool is undefined. Check db.ts export.');
    }
    console.log('Pool imported successfully:', !!pool);
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Database connection successful:', rows);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();