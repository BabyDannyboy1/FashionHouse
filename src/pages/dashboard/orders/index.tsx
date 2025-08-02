// src/pages/dashboard/orders/index.tsx
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
  DollarSign,
  Eye,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: 'customer' | 'staff' | 'superadmin';
  department?: string;
}

interface Order {
  id: string;
  customer_id: string;
  staff_id?: string;
  status: string;
  description: string;
  price?: number;
  commission_rate?: number;
  created_at: string;
  total_amount?: number;
  vendor_id?: string;
  paid_amount?: number | null;
  priority?: 'low' | 'medium' | 'high';
  order_type?: 'appointment' | 'description' | 'image_upload';
  customer?: { name: string };
  notes?: string;
  appointment_date?: string;
  measurement?: string;
  sample_image?: string;
}

const Orders: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'total_amount'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const user = session?.user as User | undefined;
  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'superadmin';
  const isVendor = user?.role === 'staff' && user?.department === 'vendor';
  const isCustomerService = user?.role === 'staff' && user?.department === 'customer_service';
  const isManager = user?.role === 'superadmin';

  useEffect(() => {
    if (status === 'authenticated') {
      if (isCustomer) {
        fetchOrders();
      } else if (isAdmin) {
        fetchOrders();
      } else if (isVendor) {
        router.push('/dashboard/staff');
      }
    }
  }, [status, isCustomer, isAdmin, isVendor, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = '/api/orders';
      if (isCustomer) {
        const userId = user?.id;
        if (!userId) throw new Error('User ID is not available');
        url += `?customerId=${userId}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
        setError('Unexpected data format from API: expected an array');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId: string, data: any) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Failed to update order: ${res.status} ${res.statusText}`);
      fetchOrders();
      alert(`Order ${Object.keys(data)[0]} successful!`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      pending: { variant: 'default', label: 'Pending Review' },
      accepted: { variant: 'default', label: 'Accepted' },
      priced: { variant: 'default', label: 'Awaiting Payment' },
      assigned_to_vendor: { variant: 'default', label: 'In Production' },
      in_progress: { variant: 'default', label: 'In Production' },
      ready_for_fitting: { variant: 'default', label: 'Ready for Fitting' },
      fitting_scheduled: { variant: 'default', label: 'Fitting Scheduled' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const { variant, label } = statusMap[status] || { variant: 'default', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPriorityIndicator = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-red-500',
    };
    return <span className={`inline-block w-2 h-2 rounded-full ${colors[priority || 'medium'] || 'bg-gray-500'}`} />;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock size={16} className="text-gray-500" />,
      accepted: <CheckCircle size={16} className="text-green-500" />,
      priced: <DollarSign size={16} className="text-yellow-500" />,
      assigned_to_vendor: <Package size={16} className="text-blue-500" />,
      in_progress: <Package size={16} className="text-blue-500" />,
      ready_for_fitting: <CheckCircle size={16} className="text-green-500" />,
      fitting_scheduled: <Calendar size={16} className="text-green-500" />,
      completed: <CheckCircle size={16} className="text-green-500" />,
      cancelled: <AlertCircle size={16} className="text-red-500" />,
    };
    return icons[status] || <AlertCircle size={16} />;
  };

  const filteredAndSortedOrders = [...orders].filter(order =>
    (searchTerm === '' ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || order.status === filterStatus)
  ).sort((a, b) => {
    if (sortBy === 'created_at') {
      return sortOrder === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return sortOrder === 'asc'
        ? (a.total_amount || 0) - (b.total_amount || 0)
        : (b.total_amount || 0) - (a.total_amount || 0);
    }
  });

  const isNewOrder = router.query.new === 'true';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') return <div className="text-center py-12">Please log in.</div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  // Determine dashboard path based on user role
  let dashboardPath = '/dashboard';
  if (isCustomer) dashboardPath = '/dashboard/customer';
  else if (isAdmin) dashboardPath = '/dashboard/admin';
  else if (user?.role === 'staff') dashboardPath = '/dashboard/staff';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Back to Dashboard */}
      <div className="mb-6">
        <Link href={dashboardPath} className="inline-flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Success message */}
      {isNewOrder && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">Your order has been submitted successfully! Our team will review it shortly.</p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isCustomer ? 'My Orders' : isAdmin ? 'Order Management' : 'Orders'}
          </h1>
          <p className="mt-1 text-gray-500">
            {isCustomer
              ? 'Track and manage your fashion orders'
              : 'Manage customer orders through the workflow process'}
          </p>
        </div>
        {isCustomer && (
          <div className="mt-4 md:mt-0">
            <Link href="/dashboard/orders/new">
              <Button variant="outline" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> New Order
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="accepted">Accepted</option>
              <option value="priced">Awaiting Payment</option>
              <option value="assigned_to_vendor">In Production</option>
              <option value="in_progress">In Production</option>
              <option value="ready_for_fitting">Ready for Fitting</option>
              <option value="fitting_scheduled">Fitting Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'created_at' | 'total_amount')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at">Date</option>
              <option value="total_amount">Amount</option>
            </select>
            <Button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              variant="outline"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? 'Desc' : 'Asc'}
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isCustomer ? 'My Orders' : 'Orders'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPriorityIndicator(order.priority || 'medium')}
                          <span className="ml-2 text-sm font-medium text-gray-900">{order.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {order.order_type?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-2">{getStatusBadge(order.status)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          {order.total_amount ? (
                            <div className="text-sm font-medium text-gray-900">₦{order.total_amount.toLocaleString()}</div>
                          ) : (
                            <span className="text-sm text-gray-500">Pending pricing</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          isAdmin={isAdmin}
          onProcess={(action, data) => {
            updateOrder(selectedOrder.id, data);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

const OrderDetailsModal: React.FC<{
  order: Order;
  onClose: () => void;
  isAdmin?: boolean;
  onProcess?: (action: string, data?: any) => void;
}> = ({ order, onClose, isAdmin, onProcess }) => {
  // Parse measurements and images from JSON string to object/array
  const measurements = order.measurement ? JSON.parse(order.measurement) : null;
  const images = order.sample_image ? [order.sample_image] : [];

  const [priceInput, setPriceInput] = useState(order.total_amount || 0);
  const [commissionInput, setCommissionInput] = useState(order.commission_rate || 0);
  const [vendorId, setVendorId] = useState(order.vendor_id || '');
  const [readyDate, setReadyDate] = useState('');
  const [negotiationInput, setNegotiationInput] = useState(order.total_amount || 0);

  // Example: You'd fetch staff/vendors from your API
  const staffList = [
    { id: '1', name: 'Vendor A' },
    { id: '2', name: 'Vendor B' },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      pending: { variant: 'default', label: 'Pending Review' },
      accepted: { variant: 'default', label: 'Accepted' },
      priced: { variant: 'default', label: 'Awaiting Payment' },
      assigned_to_vendor: { variant: 'default', label: 'In Production' },
      in_progress: { variant: 'default', label: 'In Production' },
      ready_for_fitting: { variant: 'default', label: 'Ready for Fitting' },
      fitting_scheduled: { variant: 'default', label: 'Fitting Scheduled' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const { variant, label } = statusMap[status] || { variant: 'default', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Order Details - {order.id}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Customer</label>
              <p className="text-gray-900">{order.customer?.name || 'Unknown'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Order Type</label>
              <p className="text-gray-900 capitalize">{order.order_type?.replace('_', ' ') || 'Unknown'}</p>
            </div>
            {order.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{order.description}</p>
              </div>
            )}
            {order.measurement && (
              <div>
                <label className="text-sm font-medium text-gray-500">Measurement</label>
                <p className="text-gray-900">{order.measurement}</p>
              </div>
            )}
            {order.sample_image && (
              <div>
                <label className="text-sm font-medium text-gray-500">Sample Image</label>
                <img src={order.sample_image} alt="Sample" className="max-w-xs rounded border" />
              </div>
            )}
            {order.appointment_date && (
              <div>
                <label className="text-sm font-medium text-gray-500">Appointment Date</label>
                <p className="text-gray-900">{new Date(order.appointment_date).toLocaleString()}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Priority</label>
                <p className="text-gray-900 capitalize">{order.priority || 'Medium'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Amount</label>
                <p className="text-gray-900 font-semibold">₦{order.total_amount?.toLocaleString() || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Paid Amount</label>
                <p className="text-gray-900">₦{(order.paid_amount || 0).toLocaleString()}</p>
              </div>
            </div>
            {order.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-gray-900">{order.notes}</p>
              </div>
            )}
            {measurements && (
              <div>
                <label className="text-sm font-medium text-gray-500">Measurements</label>
                <ul className="text-gray-900">
                  {Object.entries(measurements).map(([key, value]) => (
                    <li key={key}>
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                      <span>{String(value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {images.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Reference Images</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((img: string, idx: number) => (
                    <img key={idx} src={img} alt={`Order Reference ${idx + 1}`} className="w-24 h-24 object-cover rounded border" />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 pt-6">
            {isAdmin && (
              <>
                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button onClick={() => onProcess?.('accept', { status: 'accepted' })}>Accept</Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-800 border-red-200"
                      onClick={() => onProcess?.('reject', { status: 'rejected' })}
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {(order.status === 'accepted' || order.status === 'pending') && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={priceInput}
                      onChange={e => setPriceInput(Number(e.target.value))}
                      className="border rounded px-2 py-1 w-32"
                      placeholder="Set Price"
                    />
                    <Button onClick={() => onProcess?.('set_price', { status: 'priced', total_amount: priceInput })}>
                      Set Price
                    </Button>
                  </div>
                )}
                {order.status === 'priced' && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Negotiation</label>
                    <input
                      type="number"
                      value={negotiationInput}
                      onChange={e => setNegotiationInput(Number(e.target.value))}
                      className="border rounded px-2 py-1 w-32"
                      placeholder="Customer Offer"
                    />
                    <Button onClick={() => onProcess?.('negotiate', { negotiation: negotiationInput })}>
                      Accept Negotiation
                    </Button>
                  </div>
                )}
                {(order.status === 'priced' || order.status === 'negotiated') && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={readyDate}
                      onChange={e => setReadyDate(e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                    <Button onClick={() => onProcess?.('set_ready_date', { ready_date: readyDate })}>
                      Set Ready Date
                    </Button>
                  </div>
                )}
                {(order.status === 'priced' || order.status === 'negotiated' || order.status === 'accepted') && (
                  <div className="flex gap-2 items-center">
                    <select
                      value={vendorId}
                      onChange={e => setVendorId(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Assign Vendor</option>
                      {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={commissionInput}
                      onChange={e => setCommissionInput(Number(e.target.value))}
                      className="border rounded px-2 py-1 w-32"
                      placeholder="Commission"
                    />
                    <Button onClick={() => onProcess?.('assign_vendor', { vendor_id: vendorId, commission_rate: commissionInput })}>
                      Assign Vendor
                    </Button>
                  </div>
                )}
              </>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;