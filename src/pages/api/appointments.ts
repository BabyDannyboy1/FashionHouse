import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const connection = await db.getConnection();

    if (req.method === 'GET') {
      const { customerId } = req.query;
      const [rows] = await connection.query(
        'SELECT * FROM appointments WHERE customer_id = ?',
        [customerId]
      );
      if (connection && connection.release) connection.release();
      return res.status(200).json(rows);
    }

    if (connection && connection.release) connection.release();
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}