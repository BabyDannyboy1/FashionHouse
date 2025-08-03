// src/pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, username, email, password, role, staff_type } = req.body;

  if (!name || !username || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const connection = await db.getConnection();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.query(
      'INSERT INTO users (name, username, email, password, role, staff_type) VALUES (?, ?, ?, ?, ?, ?)',
      [name, username, email, hashedPassword, role, staff_type]
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    if ((error as any).code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  } finally {
    if (connection && connection.release) connection.release();
  }
}