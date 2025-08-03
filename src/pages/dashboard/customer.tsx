import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSession from '@/lib/useSession';
import { signOut } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShoppingBag,
  Clock,
  DollarSign,
  Calendar,
  Palette,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const StatsCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({
  title,
  value,
  icon,
}) => (
  <Card className="bg-gray-800 border-gold-500">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-300">{title}</p>
          <p className="mt-1 text-xl font-semibold text-white">{value}</p>
        </div>
        <div className="p-2 bg-gray-700 rounded-full">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const CustomerDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState('');

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const res = await fetch(`/api/appointments?customerId=${session?.user?.id}`);
      const text = await res.text();
      if (text.trim().startsWith('<!DOCTYPE')) throw new Error('Session expired or unauthorized.');
      let data;
      try { data = JSON.parse(text); } catch { throw new Error('Invalid JSON'); }
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setAppointments(data);
    } catch (err: any) {
      setAppointmentsError(err.message);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const res = await fetch(`/api/payments?customerId=${session?.user?.id}`);
      const text = await res.text();
      if (text.trim().startsWith('<!DOCTYPE')) throw new Error('Session expired or unauthorized.');
      let data;
      try { data = JSON.parse(text); } catch { throw new Error('Invalid JSON'); }
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setPayments(data);
    } catch (err: any) {
      setPaymentsError(err.message);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!session?.user?.id || !session.user.accessToken) throw new Error('User ID or token is undefined');
      const res = await fetch(`/api/orders?customerId=${session.user.id}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch orders: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
        setError('Unexpected data format from API');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'customer') {
      fetchOrders();
      fetchAppointments();
      fetchPayments();
    } else if (status === 'authenticated' && session?.user) {
      router.push(`/dashboard/${session.user.role}`);
    }
  }, [status, session, router]);

  if (status === 'loading' || loading) return <div className="text-white text-center py-12">Loading...</div>;
  if (status === 'unauthenticated' || !session?.user) {
    router.push('/login');
    return null;
  }

  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length;
  const totalSpent = payments.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0);
  const upcomingAppointments = appointments.filter((a) => new Date(a.date_time) > new Date() && a.status !== 'cancelled').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex">
      <div
        className={`w-64 bg-gray-800 p-6 transition-all duration-300 shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:w-64 fixed md:static h-screen z-20`}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden absolute top-4 right-4 text-gold-400"
        >
          {sidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
        <nav className="mt-12 space-y-4">
          <a
            href="/dashboard/customer"
            className="flex items-center gap-3 text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <ShoppingBag size={20} /> Dashboard
          </a>
          <a
            href="/dashboard/orders"
            className="flex items-center gap-3 text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <Clock size={20} /> My Orders
          </a>
          <a
            href="/dashboard/designs"
            className="flex items-center gap-3 text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <Palette size={20} /> My Designs
          </a>
          <a
            href="/dashboard/appointments"
            className="flex items-center gap-3 text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <Calendar size={20} /> Appointments
          </a>
          <a
            href="/dashboard/payments"
            className="flex items-center gap-3 text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <DollarSign size={20} /> Payments
          </a>
          <a
            href="/dashboard/receipts"
            className="flex items-center gap-3 text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <DollarSign size={20} /> Receipts
          </a>
          <a
            href="/dashboard/order-history"
            className="flex items-center gap-3 text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <Clock size={20} /> Order History
          </a>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full text-left text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </nav>
      </div>

      <div className="flex-1 p-8">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gold-400">Welcome, {session.user.name}</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 text-gold-400 border-gold-500 hover:bg-gold-500 hover:text-black"
          >
            <User size={20} /> Profile
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <StatsCard
            title="Total Orders"
            value={orders.length}
            icon={<ShoppingBag className="h-6 w-6 text-gold-400" />}
          />
          <StatsCard
            title="Active Orders"
            value={activeOrders}
            icon={<Clock className="h-6 w-6 text-gold-400" />}
          />
          <StatsCard
            title="Total Spent"
            value={`₦${totalSpent.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6 text-gold-400" />}
          />
          <StatsCard
            title="Upcoming Appointments"
            value={upcomingAppointments}
            icon={<Calendar className="h-6 w-6 text-gold-400" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Card className="bg-gray-800 border-gold-500 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gold-300">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                    >
                      <div className="flex items-center">
                        <Palette className="h-5 w-5 text-gold-400 mr-3" />
                        <div>
                          <h4 className="font-medium text-white">Order #{order.id}</h4>
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          order.status === 'completed'
                            ? 'default'
                            : order.status === 'cancelled'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gold-500 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gold-300">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No appointments scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {appointments
                    .filter((a) => new Date(a.date_time) > new Date())
                    .slice(0, 3)
                    .map((appointment) => (
                      <div key={appointment.id} className="p-3 bg-gray-700 rounded-lg">
                        <p className="font-medium text-white">
                          {new Date(appointment.date_time).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">Status: {appointment.status}</p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gold-500 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gold-300">Payment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No payments recorded.</p>
              ) : (
                <div className="space-y-3">
                  {payments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="p-3 bg-gray-700 rounded-lg">
                      <p className="font-medium text-white">₦{payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Status: {payment.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;