import React, { useState, useEffect } from 'react';
import useSession from '@/lib/useSession';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  BarChart3,
  ShoppingBag,
  Palette,
  TrendingUp,
  Calendar,
  Bell,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, icon, change, trend }) => {
  const trendColor =
    trend === 'up'
      ? 'text-success-600'
      : trend === 'down'
      ? 'text-error-600'
      : 'text-gray-500';
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <div className="mt-1 flex items-center">
                <TrendingUp className={`h-4 w-4 mr-1 ${trendColor}`} />
                <span className={`text-xs ${trendColor}`}>{change}</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const StaffDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/orders');
      const text = await res.text();
      if (text.trim().startsWith('<!DOCTYPE')) throw new Error('Session expired or unauthorized.');
      let data;
      try { data = JSON.parse(text); } catch { throw new Error('Invalid JSON'); }
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setOrders(data);
    } catch (err: any) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const res = await fetch('/api/payments');
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

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const res = await fetch('/api/appointments');
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
    if (status === 'authenticated' && session?.user?.role === 'staff') {
      fetchOrders();
      fetchPayments();
      fetchAppointments();
    }
  }, [status, session]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'staff') {
      router.push(`/dashboard/${session.user.role}`);
    }
    setLoading(false);
  }, [status, router, session?.user?.role]);

  if (loading || ordersLoading || paymentsLoading || appointmentsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session?.user || !['staff'].includes(session.user.role)) {
    return <div className="text-center py-12">Unauthorized</div>;
  }

  const user = session.user;
  const myTasks = orders.filter(o => o.status === 'pending' || o.status === 'accepted').length;
  const todayAppointments = appointments.filter(a =>
    new Date(a.appointment_date).toDateString() === new Date().toDateString()
  ).length;
  const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex">
      <div
        className={`w-64 bg-gray-800 p-6 transition-all duration-300 shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:w-64 fixed md:static h-screen z-20`}
      >
        <div className="flex flex-col items-center mb-8">
          <img
            src={user.profile_picture || '/default-avatar.png'}
            alt="Profile"
            className="w-16 h-16 rounded-full border mb-2"
          />
          <div className="font-bold text-white">{user.name}</div>
          <div className="text-xs text-gold-400">{user.role}</div>
          {user.staff_type && (
            <div className="text-xs text-gray-400">{user.staff_type}</div>
          )}
          <a
            href="/profile"
            className="mt-2 text-sm text-gold-400 hover:underline"
          >
            Edit Profile
          </a>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden absolute top-4 right-4 text-gold-400"
        >
          {sidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
        <nav className="mt-12 space-y-4">
          <a
            href="/dashboard/staff"
            className="flex items-center gap-3 text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <BarChart3 size={20} /> Dashboard
          </a>
          <a
            href="/dashboard/orders"
            className="flex items-center gap-3 text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <ShoppingBag size={20} /> Orders
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
            <CreditCard size={20} /> Payments
          </a>
          <a
            href="/dashboard/designs"
            className="flex items-center gap-3 text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <Palette size={20} /> Designs
          </a>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full text-left text-white hover:text-gold-400 font-medium py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </nav>
      </div>

      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user.name}
            </h1>
            <p className="mt-1 text-gray-500">
              Here's what's happening with your fashion house today.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </button>
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="My Tasks"
              value={myTasks}
              icon={<Calendar className="h-6 w-6 text-primary-600" />}
            />
            <StatsCard
              title="Today's Appointments"
              value={todayAppointments}
              icon={<Calendar className="h-6 w-6 text-warning-600" />}
            />
            <StatsCard
              title="Pending Payments"
              value={`₦${pendingPayments.toLocaleString()}`}
              icon={<CreditCard className="h-6 w-6 text-success-600" />}
            />
            <StatsCard
              title="Total Orders"
              value={orders.length}
              icon={<ShoppingBag className="h-6 w-6 text-accent-600" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="font-medium text-gray-900">{order.id}</h4>
                      <p className="text-sm text-gray-500 mt-1">Customer: {order.customer?.name || 'Unknown'}</p>
                    </div>
                    <Badge variant={order.status === 'completed' ? 'success' : 'warning'}>
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;