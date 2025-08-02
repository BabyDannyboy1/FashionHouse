import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jeca_kings_garment',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as any;
  
  if (!session?.user || !['superadmin', 'staff'].includes(session.user.role)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    if (req.method === 'GET') {
      const { role, staff_type } = req.query;
      
      let query = 'SELECT id, name, email, role, staff_type FROM users WHERE role IN (?, ?)';
      const params = ['staff', 'superadmin'];
      
      if (role) {
        query += ' AND role = ?';
        params.push(role as string);
      }
      
      if (staff_type) {
        query += ' AND staff_type = ?';
        params.push(staff_type as string);
      }
      
      query += ' ORDER BY name ASC';
      
      const [rows] = await connection.execute(query, params);
      return res.status(200).json(rows);
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error('Staff API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    if (connection) await connection.end();
  }
}