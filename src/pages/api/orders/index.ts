import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jeca_kings_garment',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as any;
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    if (req.method === 'GET') {
      const { customerId, status, orderType } = req.query;
      
      let query = `
        SELECT 
          o.*,
          u.name as customer_name,
          u.email as customer_email,
          u.phone as customer_phone,
          s.name as staff_name,
          v.name as vendor_name
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.id
        LEFT JOIN users s ON o.staff_id = s.id
        LEFT JOIN users v ON o.vendor_id = v.id
      `;
      
      const conditions = [];
      const params = [];
      
      // Filter by customer if specified or if user is a customer
      if (customerId) {
        conditions.push('o.customer_id = ?');
        params.push(customerId);
      } else if (session?.user?.role === 'customer') {
        conditions.push('o.customer_id = ?');
        params.push(session.user.id);
      }
      
      // Filter by status if specified
      if (status) {
        conditions.push('o.status = ?');
        params.push(status);
      }
      
      // Filter by order type if specified
      if (orderType) {
        conditions.push('o.order_type = ?');
        params.push(orderType);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY o.created_at DESC';
      
      const [rows] = await connection.execute(query, params);
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const {
        customerId,
        status,
        order_type,
        description,
        appointment_date_time,
        measurements,
        image_urls,
        priority,
        notes
      } = req.body;

      if (!customerId || !order_type) {
        return res.status(400).json({ error: 'Missing required fields: customerId and order_type' });
      }

      const [result] = await connection.execute(
        `INSERT INTO orders 
          (customer_id, status, order_type, description, appointment_date, measurements, image_urls, priority, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          customerId,
          status || 'pending',
          order_type,
          description || null,
          appointment_date_time || null,
          measurements ? JSON.stringify(measurements) : null,
          image_urls ? JSON.stringify(image_urls) : null,
          priority || 'medium',
          notes || null,
        ]
      );
      
      return res.status(201).json({ 
        success: true, 
        orderId: (result as any).insertId,
        message: 'Order created successfully'
      });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error('Orders API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    if (connection) await connection.end();
  }
}