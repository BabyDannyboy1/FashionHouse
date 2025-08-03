// src/lib/db.ts
import mysql from 'mysql2/promise';

// In-memory fallback data for when MySQL is not available
const fallbackUsers = [
  {
    id: 1,
    name: 'Admin User',
    username: 'admin',
    email: 'admin@jecakings.com',
    password: '$2b$10$rQJ5qVJ5qVJ5qVJ5qVJ5qO', // hashed 'admin123'
    role: 'superadmin',
    staff_type: null,
    profile_picture: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: 'John Customer',
    username: 'customer',
    email: 'customer@example.com',
    password: '$2b$10$rQJ5qVJ5qVJ5qVJ5qVJ5qO', // hashed 'customer123'
    role: 'customer',
    staff_type: null,
    profile_picture: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    name: 'Staff Member',
    username: 'staff',
    email: 'staff@jecakings.com',
    password: '$2b$10$rQJ5qVJ5qVJ5qVJ5qVJ5qO', // hashed 'staff123'
    role: 'staff',
    staff_type: 'customer_service',
    profile_picture: null,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const fallbackOrders = [
  {
    id: 1,
    customer_id: 2,
    staff_id: null,
    vendor_id: null,
    status: 'pending',
    description: 'Custom traditional attire for wedding ceremony',
    total_amount: null,
    paid_amount: 0,
    commission_rate: null,
    created_at: new Date(),
    updated_at: new Date(),
    priority: 'high',
    order_type: 'description',
    notes: null,
    appointment_date: null,
    measurements: JSON.stringify({
      chest: '42',
      waist: '36',
      shoulder: '18',
      sleeveLength: '24'
    }),
    image_urls: null,
    ready_date: null,
    fitting_date: null
  }
];

const fallbackPayments = [];
const fallbackAppointments = [];

let useMySQL = true;
let pool: mysql.Pool | null = null;

// Try to create MySQL connection pool
try {
  if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'jeca_kings_garment',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  } else {
    // In development/demo environment, use fallback
    useMySQL = false;
    console.log('Using fallback in-memory database for demo purposes');
  }
} catch (error) {
  console.log('MySQL not available, using fallback data');
  useMySQL = false;
}

// Fallback database operations
class FallbackDB {
  static async query(sql: string, params: any[] = []): Promise<[any[], any]> {
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.includes('select') && sqlLower.includes('users')) {
      if (sqlLower.includes('where email')) {
        const email = params[0];
        const user = fallbackUsers.find(u => u.email === email);
        return [user ? [user] : [], null];
      }
      if (sqlLower.includes('where id')) {
        const id = params[0];
        const user = fallbackUsers.find(u => u.id.toString() === id.toString());
        return [user ? [user] : [], null];
      }
      if (sqlLower.includes('role in')) {
        const staff = fallbackUsers.filter(u => ['staff', 'superadmin'].includes(u.role));
        return [staff, null];
      }
      return [fallbackUsers, null];
    }
    
    if (sqlLower.includes('select') && sqlLower.includes('orders')) {
      let orders = [...fallbackOrders];
      
      // Add customer info to orders
      orders = orders.map(order => ({
        ...order,
        customer_name: fallbackUsers.find(u => u.id === order.customer_id)?.name || 'Unknown',
        customer_email: fallbackUsers.find(u => u.id === order.customer_id)?.email || 'unknown@example.com',
        customer_phone: null,
        staff_name: order.staff_id ? fallbackUsers.find(u => u.id === order.staff_id)?.name : null,
        vendor_name: order.vendor_id ? fallbackUsers.find(u => u.id === order.vendor_id)?.name : null
      }));
      
      if (sqlLower.includes('where') && sqlLower.includes('customer_id')) {
        const customerId = params[0];
        orders = orders.filter(o => o.customer_id.toString() === customerId.toString());
      }
      
      if (sqlLower.includes('where') && sqlLower.includes('id =')) {
        const orderId = params[0];
        orders = orders.filter(o => o.id.toString() === orderId.toString());
      }
      
      return [orders, null];
    }
    
    if (sqlLower.includes('select') && sqlLower.includes('payments')) {
      return [fallbackPayments, null];
    }
    
    if (sqlLower.includes('select') && sqlLower.includes('appointments')) {
      return [fallbackAppointments, null];
    }
    
    if (sqlLower.includes('insert')) {
      if (sqlLower.includes('users')) {
        const newUser = {
          id: fallbackUsers.length + 1,
          name: params[0],
          username: params[1],
          email: params[2],
          password: params[3],
          role: params[4],
          staff_type: params[5],
          profile_picture: null,
          created_at: new Date(),
          updated_at: new Date()
        };
        fallbackUsers.push(newUser);
        return [{ insertId: newUser.id, affectedRows: 1 }, null];
      }
      
      if (sqlLower.includes('orders')) {
        const newOrder = {
          id: fallbackOrders.length + 1,
          customer_id: params[0],
          status: params[1] || 'pending',
          order_type: params[2],
          description: params[3],
          appointment_date: params[4],
          measurements: params[5],
          image_urls: params[6],
          priority: params[7] || 'medium',
          notes: params[8],
          staff_id: null,
          vendor_id: null,
          total_amount: null,
          paid_amount: 0,
          commission_rate: null,
          created_at: new Date(),
          updated_at: new Date(),
          ready_date: null,
          fitting_date: null
        };
        fallbackOrders.push(newOrder);
        return [{ insertId: newOrder.id, affectedRows: 1 }, null];
      }
    }
    
    if (sqlLower.includes('update')) {
      if (sqlLower.includes('orders')) {
        const orderId = params[params.length - 1];
        const orderIndex = fallbackOrders.findIndex(o => o.id.toString() === orderId.toString());
        if (orderIndex !== -1) {
          // Update order with new values
          fallbackOrders[orderIndex] = { ...fallbackOrders[orderIndex], updated_at: new Date() };
          return [{ affectedRows: 1 }, null];
        }
      }
      
      if (sqlLower.includes('users')) {
        return [{ affectedRows: 1 }, null];
      }
    }
    
    return [[], null];
  }
  
  static async execute(sql: string, params: any[] = []) {
    return this.query(sql, params);
  }
  
  static async getConnection() {
    return {
      query: this.query.bind(this),
      execute: this.execute.bind(this),
      release: () => {},
      beginTransaction: () => Promise.resolve(),
      commit: () => Promise.resolve(),
      rollback: () => Promise.resolve(),
      end: () => Promise.resolve()
    };
  }
}

// Export unified interface
export const db = {
  async query(sql: string, params: any[] = []) {
    if (useMySQL && pool) {
      try {
        return await pool.execute(sql, params);
      } catch (error) {
        console.log('MySQL query failed, falling back to in-memory data');
        useMySQL = false;
        return await FallbackDB.query(sql, params);
      }
    }
    return await FallbackDB.query(sql, params);
  },
  
  async getConnection() {
    if (useMySQL && pool) {
      try {
        return await pool.getConnection();
      } catch (error) {
        console.log('MySQL connection failed, using fallback');
        useMySQL = false;
        return await FallbackDB.getConnection();
      }
    }
    return await FallbackDB.getConnection();
  }
};

// Keep the original pool export for backward compatibility
export { pool };