import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as any;
  if (
    !session ||
    !session.user ||
    (session.user.role !== 'customer' && session.user.role !== 'admin')
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jeca_kings_garment',
  });

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    await connection.end();
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    if (req.method === 'PUT') {
      const { status, total_amount, vendor_id } = req.body;
      if (!status || total_amount === undefined || vendor_id === undefined) {
        await connection.end();
        return res.status(400).json({ error: 'Missing required fields: status, total_amount, vendor_id' });
      }

      await connection.beginTransaction();
      const [result] = await connection.execute(
        'UPDATE orders SET status = ?, total_amount = ?, vendor_id = ? WHERE id = ? AND customer_id = ?',
        [status, total_amount, vendor_id, id, session.user.id]
      );
      if ((result as any).affectedRows === 0) {
        await connection.rollback();
        await connection.end();
        return res.status(404).json({ error: 'Order not found or unauthorized' });
      }

      await connection.commit();
      res.status(200).json({ success: true });
    } else {
      res.setHeader('Allow', ['PUT']);
      await connection.end();
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    await connection.rollback();
    console.error('Order update error:', error);
    await connection.end();
    return res.status(500).json({ error: 'Internal server error' });
  }
}