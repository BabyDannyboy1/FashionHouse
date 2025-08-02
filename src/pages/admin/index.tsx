import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSession from '@/lib/useSession';
import { pool } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Order } from '@/types';

const AdminDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (!['superadmin', 'staff', 'vendor'].includes(session.user.role)) {
        router.push('/login');
        return;
      }
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const [ordersData] = await pool.query('SELECT * FROM orders') as [Order[], unknown];
          setOrders(JSON.parse(JSON.stringify(ordersData)));
        } catch (err) {
          console.error('Error fetching orders:', err);
          setError('Failed to fetch orders');
          setOrders([]);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  if (status === 'loading' || loading) {
    return <div className="text-white text-center py-12">Loading...</div>;
  }

  if (!session?.user || !['superadmin', 'staff', 'vendor'].includes(session.user.role)) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-gold-500/30 sticky top-0 z-50 shadow-lg shadow-gold-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="Jeca Kings Garment Logo" className="h-8 w-8 object-contain" />
            <span className="text-2xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent drop-shadow-lg">
              Admin Dashboard
            </span>
          </div>
          <Link href="/" className="text-gold-400 hover:text-gold-300 transition-all duration-300">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gold-400 mb-8">Manage Orders</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {orders.length === 0 ? (
          <p className="text-gray-300">No orders found.</p>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 rounded-xl border border-gold-500/20 shadow-lg hover:shadow-gold-500/20 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <h2 className="text-xl font-semibold text-gold-400">Order #{order.id}</h2>
                <p className="text-gray-300">Customer ID: {order.customer_id}</p>
                <p className="text-gray-300">Status: {order.status}</p>
                <p className="text-gray-300">Total: ₦{order.total_amount?.toLocaleString() || 'N/A'}</p>
                {order.order_type && <p className="text-gray-300">Type: {order.order_type}</p>}
                {order.priority && <p className="text-gray-300">Priority: {order.priority}</p>}
              </div>
            ))}
          </div>
        )}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-8 rounded-xl border border-gold-500/30 shadow-2xl max-w-lg w-full">
              <h2 className="text-2xl font-bold text-gold-400 mb-4">Order Details</h2>
              <p className="text-gray-300">Order ID: {selectedOrder.id}</p>
              <p className="text-gray-300">Customer ID: {selectedOrder.customer_id}</p>
              <p className="text-gray-300">Status: {selectedOrder.status}</p>
              <p className="text-gray-300">Total: ₦{selectedOrder.total_amount?.toLocaleString() || 'N/A'}</p>
              <p className="text-gray-300">Created: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
              {selectedOrder.description && <p className="text-gray-300">Description: {selectedOrder.description}</p>}
              {selectedOrder.order_type && <p className="text-gray-300">Type: {selectedOrder.order_type}</p>}
              {selectedOrder.priority && <p className="text-gray-300">Priority: {selectedOrder.priority}</p>}
              {selectedOrder.appointment_date && (
                <p className="text-gray-300">Appointment: {new Date(selectedOrder.appointment_date).toLocaleString()}</p>
              )}
              {selectedOrder.measurements && (
                <p className="text-gray-300">Measurements: {JSON.stringify(selectedOrder.measurements)}</p>
              )}
              {selectedOrder.image_urls && (
                <div className="text-gray-300">
                  Images:
                  {selectedOrder.image_urls.map((url, i) => (
                    <img key={i} src={url} alt={`Order image ${i + 1}`} className="w-20 h-20 object-cover mt-2" />
                  ))}
                </div>
              )}
              <button
                className="mt-6 bg-gradient-to-r from-gold-400 to-gold-600 text-black py-2 px-6 rounded-full font-bold hover:from-gold-300 hover:to-gold-500 transition-all duration-300"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;