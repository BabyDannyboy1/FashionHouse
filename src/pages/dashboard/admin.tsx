import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronUp, ShoppingBag, DollarSign, Clock, Calendar, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const StatsCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({
  title,
  value,
  icon,
}) => (
  <Card className="bg-gray-800 border-gold-500">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className="p-3 bg-gray-700 rounded-full">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const [navOpen, setNavOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState('');
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');

  // Move fetchPayments outside useEffect
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

  // Move fetchAppointments outside useEffect
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

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'superadmin') {
      fetchOrders();
      fetchPayments();
      fetchAppointments();
    } else if (status === 'authenticated' && session?.user) {
      window.location.href = `/dashboard/${session.user.role}`;
    }
  }, [status, session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setSigningOut(true);
    signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading' || loading) return <div className="text-white text-center py-12">Loading...</div>;
  if (status === 'unauthenticated' || !session?.user) {
    window.location.href = '/login';
    return null;
  }
  if (session.user.role !== 'superadmin') {
    window.location.href = `/dashboard/${session.user.role}`;
    return null;
  }

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const todayAppointments = appointments.filter(a =>
    new Date(a.appointment_date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex">
      <div className={`w-64 bg-gray-800 p-4 transition-all duration-300 ${navOpen ? 'block' : 'hidden md:block'} shadow-lg`}>
        <button
          onClick={() => setNavOpen(!navOpen)}
          className="md:hidden w-full text-left text-gold-400 flex items-center justify-between"
        >
          Menu {navOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
        <nav className="mt-6 space-y-2">
          <Link href="/dashboard/admin" className="block text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition">
            Dashboard
          </Link>
          <Link href="/dashboard/users" className="block text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition">
            User Management
          </Link>
          <Link href="/dashboard/orders" className="block text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition">
            All Orders
          </Link>
          <Link href="/dashboard/designs" className="block text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition">
            Design Hub
          </Link>
          <Link href="/dashboard/payments" className="block text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition">
            Payments
          </Link>
          <Link href="/dashboard/appointments" className="block text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition">
            Appointments
          </Link>
          <Link href="/dashboard/financial" className="block text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition">
            Financial Reports
          </Link>
          <Link href="/dashboard/settings" className="block text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition">
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="block w-full text-left text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            {signingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </nav>
      </div>
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gold-400">
              {getGreeting()}, {session.user.name}
            </h1>
            <p className="mt-1 text-gray-300">
              Here's what's happening with Jeca Kings Garment today.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gold-500 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </button>
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-300 hover:text-gold-400 cursor-pointer" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-800"></span>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Orders"
              value={orders.length}
              icon={<ShoppingBag className="h-6 w-6 text-gold-400" />}
            />
            <StatsCard
              title="Revenue"
              value={`₦${totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="h-6 w-6 text-gold-400" />}
            />
            <StatsCard
              title="Pending Orders"
              value={pendingOrders}
              icon={<Clock className="h-6 w-6 text-gold-400" />}
            />
            <StatsCard
              title="Today's Appointments"
              value={todayAppointments}
              icon={<Calendar className="h-6 w-6 text-gold-400" />}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gray-800 border-gold-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gold-300">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-700">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gold-400">{order.customer?.name?.charAt(0) || String(order.customer_id).charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">{order.id}</p>
                          <p className="text-xs text-gray-400">{order.customer_id || 'Unknown'}</p>
                        </div>
                      </div>
                      <Badge
                        variant={order.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gold-500 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gold-300">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-700">
                      <div>
                        <p className="text-sm font-medium text-white">{payment.id}</p>
                        <p className="text-xs text-gray-400">{payment.customer_id || 'Unknown'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">₦{payment.amount.toLocaleString()}</p>
                        <Badge
                          variant={payment.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;