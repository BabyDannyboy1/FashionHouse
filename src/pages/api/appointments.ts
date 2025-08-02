import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    if (req.method === 'GET') {
      const { customerId } = req.query;
      const [rows] = await connection.execute(
        'SELECT * FROM appointments WHERE customer_id = ?',
        [customerId]
      );
      return res.status(200).json(rows);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}