// pages/api/orders/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { status, total_amount, vendor_id } = req.body;
    await connection.execute('UPDATE orders SET status = ?, total_amount = ?, vendor_id = ? WHERE id = ?', [status, total_amount, vendor_id, id]);
    res.status(200).json({ success: true });
  }
}