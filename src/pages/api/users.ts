import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    if (req.method === 'GET') {
      const { userId } = req.query;
      const [rows] = await connection.execute(
        'SELECT id, name, email, role, staff_type, profile_picture FROM users WHERE id = ?',
        [userId]
      );
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { userId } = req.query;
      const { name, email, phone, address, profile_picture } = req.body;
      await connection.execute(
        'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, profile_picture = ? WHERE id = ?',
        [name, email, phone, address, profile_picture, userId]
      );
      return res.status(200).json({ message: 'Profile updated' });
    }

    if (req.method === 'POST') {
      // Password reset
      const { userId, newPassword } = req.body;
      if (!userId || !newPassword) return res.status(400).json({ error: 'Missing fields' });
      const hashed = await bcrypt.hash(newPassword, 10);
      await connection.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
      return res.status(200).json({ message: 'Password updated' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await connection.end();
  }
}