import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

// Update these with your XAMPP MySQL credentials
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jeca_kings',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    if (req.method === 'GET') {
      // Optional: filter by customerId
      const { customerId } = req.query;
      let [rows] = await connection.execute(
        `SELECT o.*, c.name as customer_name, c.email as customer_email
         FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.id
         ORDER BY o.created_at DESC`
      );
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
      } = req.body;

      if (!customerId || !order_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        const [result] = await connection.execute(
          `INSERT INTO orders 
            (customer_id, status, order_type, description, appointment_date, measurements, image_urls, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            customerId,
            status || 'pending',
            order_type,
            description !== undefined ? description : '',
            appointment_date_time || null,
            measurements ? JSON.stringify(measurements) : null,
            image_urls ? JSON.stringify(image_urls) : null,
          ]
        );
        return res.status(201).json({ success: true, orderId: (result as any).insertId });
      } catch (error: any) {
        console.error('Insert Error:', error); // Add this for debugging
        return res.status(500).json({ error: error.message });
      }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}