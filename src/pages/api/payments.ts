// src/pages/api/payments.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { customerId } = req.query;
  if (!customerId) return res.status(400).json({ error: 'customerId is required' });

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [payments] = await connection.execute(
      'SELECT p.id, p.order_id, p.amount, p.status, p.payment_date, p.created_at, p.updated_at ' +
      'FROM payments p ' +
      'JOIN orders o ON p.order_id = o.id ' +
      'WHERE o.customer_id = ?',
      [customerId]
    );
    await connection.end();
    res.status(200).json(payments);
  } catch (error) {
    await connection.end();
    console.error('Payments fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}