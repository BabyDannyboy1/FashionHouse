import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as any;
  const { id } = req.query;

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  let connection;
  try {
    connection = await db.getConnection();

    if (req.method === 'GET') {
      const [orders] = await connection.query(
        `SELECT 
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
        WHERE o.id = ?`,
        [id]
      );

      if ((orders as any[]).length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.status(200).json((orders as any[])[0]);
    }

    if (req.method === 'PUT') {
      const {
        status,
        total_amount,
        vendor_id,
        staff_id,
        commission_rate,
        notes,
        priority,
        ready_date,
        fitting_date,
        paid_amount
      } = req.body;

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }
      if (total_amount !== undefined) {
        updateFields.push('total_amount = ?');
        updateValues.push(total_amount);
      }
      if (vendor_id !== undefined) {
        updateFields.push('vendor_id = ?');
        updateValues.push(vendor_id);
      }
      if (staff_id !== undefined) {
        updateFields.push('staff_id = ?');
        updateValues.push(staff_id);
      }
      if (commission_rate !== undefined) {
        updateFields.push('commission_rate = ?');
        updateValues.push(commission_rate);
      }
      if (notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(notes);
      }
      if (priority !== undefined) {
        updateFields.push('priority = ?');
        updateValues.push(priority);
      }
      if (ready_date !== undefined) {
        updateFields.push('ready_date = ?');
        updateValues.push(ready_date);
      }
      if (fitting_date !== undefined) {
        updateFields.push('fitting_date = ?');
        updateValues.push(fitting_date);
      }
      if (paid_amount !== undefined) {
        updateFields.push('paid_amount = ?');
        updateValues.push(paid_amount);
      }

      // Always update the updated_at timestamp
      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      if (updateFields.length === 1) { // Only updated_at was added
        return res.status(400).json({ error: 'No fields to update' });
      }

      const query = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;
      
      if (connection.beginTransaction) await connection.beginTransaction();
      
      const [result] = await connection.query(query, updateValues);
      
      if ((result as any).affectedRows === 0) {
        if (connection.rollback) await connection.rollback();
        return res.status(404).json({ error: 'Order not found' });
      }

      // Log the action for audit trail
      await connection.query(
        `INSERT INTO order_history (order_id, user_id, action, details, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [
          id,
          session.user.id,
          'order_updated',
          JSON.stringify({ updated_fields: Object.keys(req.body) })
        ]
      );

      if (connection.commit) await connection.commit();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Order updated successfully' 
      });
    }

    if (req.method === 'DELETE') {
      // Only superadmin can delete orders
      if (session.user.role !== 'superadmin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      if (connection.beginTransaction) await connection.beginTransaction();
      
      // Soft delete - update status to cancelled instead of actual deletion
      const [result] = await connection.query(
        'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
        ['cancelled', id]
      );
      
      if ((result as any).affectedRows === 0) {
        if (connection.rollback) await connection.rollback();
        return res.status(404).json({ error: 'Order not found' });
      }

      // Log the cancellation
      await connection.query(
        `INSERT INTO order_history (order_id, user_id, action, details, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [id, session.user.id, 'order_cancelled', JSON.stringify({ reason: 'Admin cancellation' })]
      );

      if (connection.commit) await connection.commit();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Order cancelled successfully' 
      });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    if (connection && connection.rollback) await connection.rollback();
    console.error('Order API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    if (connection && connection.release) connection.release();
  }
}