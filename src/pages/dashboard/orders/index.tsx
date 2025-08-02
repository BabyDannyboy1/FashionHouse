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
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: 'customer' | 'staff' | 'superadmin';
  staff_type?: string;
}

interface Order {
  id: string;
  customer_id: string;
  staff_id?: string;
  vendor_id?: string;
  status: string;
  description: string;
  total_amount?: number;
  paid_amount?: number;
  commission_rate?: number;
  created_at: string;
  updated_at?: string;
  priority?: 'low' | 'medium' | 'high';
  order_type?: 'appointment' | 'description' | 'image_upload';
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  staff_name?: string;
  vendor_name?: string;
  notes?: string;
  appointment_date?: string;
  measurements?: string;
  image_urls?: string;
  ready_date?: string;
  fitting_date?: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  staff_type?: string;
}

const Orders: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'total_amount' | 'priority'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const user = session?.user as User | undefined;
  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'superadmin';
  const isStaff = user?.role === 'staff';

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders();
      if (isAdmin || isStaff) {
        fetchStaff();
      }
    }
  }, [status, isCustomer, isAdmin, isStaff]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = '/api/orders';
      if (isCustomer) {
        url += `?customerId=${user?.id}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    }
  };

  const updateOrder = async (orderId: string, data: any) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to update order: ${res.status}`);
      }
      await fetchOrders();
      return { success: true };
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to cancel order');
      }
      await fetchOrders();
      alert('Order cancelled successfully');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning'; label: string }> = {
      pending: { variant: 'warning', label: 'Pending Review' },
      accepted: { variant: 'default', label: 'Accepted' },
      priced: { variant: 'default', label: 'Awaiting Payment' },
      paid: { variant: 'success', label: 'Payment Received' },
      assigned_to_vendor: { variant: 'default', label: 'In Production' },
      in_progress: { variant: 'default', label: 'In Production' },
      ready_for_fitting: { variant: 'default', label: 'Ready for Fitting' },
      fitting_scheduled: { variant: 'default', label: 'Fitting Scheduled' },
      completed: { variant: 'success', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const { variant, label } = statusMap[status] || { variant: 'secondary', label: status };
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
      pending: <Clock size={16} className="text-yellow-500" />,
      accepted: <CheckCircle size={16} className="text-green-500" />,
      priced: <DollarSign size={16} className="text-blue-500" />,
      paid: <CheckCircle size={16} className="text-green-600" />,
      assigned_to_vendor: <Package size={16} className="text-blue-500" />,
      in_progress: <Package size={16} className="text-blue-500" />,
      ready_for_fitting: <CheckCircle size={16} className="text-green-500" />,
      fitting_scheduled: <Calendar size={16} className="text-green-500" />,
      completed: <CheckCircle size={16} className="text-green-600" />,
      cancelled: <AlertCircle size={16} className="text-red-500" />,
    };
    return icons[status] || <AlertCircle size={16} />;
  };

  const filteredAndSortedOrders = [...orders]
    .filter(order => {
      const matchesSearch = searchTerm === '' ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || order.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'total_amount':
          aValue = a.total_amount || 0;
          bValue = b.total_amount || 0;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <div className="text-center py-12">Please log in.</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-12">{error}</div>;
  }

  // Determine dashboard path based on user role
  let dashboardPath = '/dashboard';
  if (isCustomer) dashboardPath = '/dashboard/customer';
  else if (isAdmin) dashboardPath = '/dashboard/admin';
  else if (isStaff) dashboardPath = '/dashboard/staff';

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
      {router.query.new === 'true' && (
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
              <option value="paid">Payment Received</option>
              <option value="assigned_to_vendor">In Production</option>
              <option value="in_progress">In Production</option>
              <option value="ready_for_fitting">Ready for Fitting</option>
              <option value="fitting_scheduled">Fitting Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'created_at' | 'total_amount' | 'priority')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at">Date</option>
              <option value="total_amount">Amount</option>
              <option value="priority">Priority</option>
            </select>
            <Button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              variant="outline"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isCustomer ? 'My Orders' : 'Orders'} ({filteredAndSortedOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  {!isCustomer && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>}
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
                    <td colSpan={isCustomer ? 6 : 7} className="text-center py-8 text-gray-400">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPriorityIndicator(order.priority || 'medium')}
                          <span className="ml-2 text-sm font-medium text-gray-900">#{order.id}</span>
                        </div>
                      </td>
                      {!isCustomer && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customer_name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{order.customer_email}</div>
                        </td>
                      )}
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
                          {order.paid_amount && order.paid_amount > 0 && (
                            <div className="text-xs text-green-600">Paid: ₦{order.paid_amount.toLocaleString()}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedOrder(order)} 
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="outline" 
                              onClick={() => deleteOrder(order.id)}
                              className="text-red-600 hover:text-red-800 border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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
          staff={staff}
          onClose={() => setSelectedOrder(null)}
          isAdmin={isAdmin}
          isStaff={isStaff}
          onUpdate={async (orderId, data) => {
            try {
              await updateOrder(orderId, data);
              setSelectedOrder(null);
              alert('Order updated successfully!');
            } catch (err: any) {
              alert(`Error: ${err.message}`);
            }
          }}
        />
      )}
    </div>
  );
};

const OrderDetailsModal: React.FC<{
  order: Order;
  staff: Staff[];
  onClose: () => void;
  isAdmin?: boolean;
  isStaff?: boolean;
  onUpdate: (orderId: string, data: any) => Promise<void>;
}> = ({ order, staff, onClose, isAdmin, isStaff, onUpdate }) => {
  const [priceInput, setPriceInput] = useState(order.total_amount || 0);
  const [commissionInput, setCommissionInput] = useState(order.commission_rate || 0);
  const [vendorId, setVendorId] = useState(order.vendor_id || '');
  const [staffId, setStaffId] = useState(order.staff_id || '');
  const [readyDate, setReadyDate] = useState(order.ready_date || '');
  const [fittingDate, setFittingDate] = useState(order.fitting_date || '');
  const [notes, setNotes] = useState(order.notes || '');
  const [priority, setPriority] = useState(order.priority || 'medium');
  const [paidAmount, setPaidAmount] = useState(order.paid_amount || 0);

  const measurements = order.measurements ? JSON.parse(order.measurements) : null;
  const images = order.image_urls ? JSON.parse(order.image_urls) : [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning'; label: string }> = {
      pending: { variant: 'warning', label: 'Pending Review' },
      accepted: { variant: 'default', label: 'Accepted' },
      priced: { variant: 'default', label: 'Awaiting Payment' },
      paid: { variant: 'success', label: 'Payment Received' },
      assigned_to_vendor: { variant: 'default', label: 'In Production' },
      in_progress: { variant: 'default', label: 'In Production' },
      ready_for_fitting: { variant: 'default', label: 'Ready for Fitting' },
      fitting_scheduled: { variant: 'default', label: 'Fitting Scheduled' },
      completed: { variant: 'success', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const { variant, label } = statusMap[status] || { variant: 'secondary', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const vendors = staff.filter(s => s.staff_type === 'vendor');
  const customerService = staff.filter(s => s.staff_type === 'customer_service');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Order Details - #{order.id}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-900">{order.customer_name || 'Unknown'}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-900">{order.customer_email || 'N/A'}</span>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-900">{order.customer_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Order Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order Type</label>
                  <p className="text-gray-900 capitalize">{order.order_type?.replace('_', ' ') || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <p className="text-gray-900 capitalize">{order.priority || 'Medium'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                {order.updated_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-gray-900">{new Date(order.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {order.description && (
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">{order.description}</p>
            </div>
          )}

          {/* Appointment Date */}
          {order.appointment_date && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500">Appointment Date</label>
              <p className="text-gray-900">{new Date(order.appointment_date).toLocaleString()}</p>
            </div>
          )}

          {/* Financial Information */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Total Amount</label>
              <p className="text-gray-900 font-semibold text-lg">₦{(order.total_amount || 0).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Paid Amount</label>
              <p className="text-gray-900 font-semibold text-lg text-green-600">₦{(order.paid_amount || 0).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Balance</label>
              <p className="text-gray-900 font-semibold text-lg text-red-600">
                ₦{((order.total_amount || 0) - (order.paid_amount || 0)).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Staff Assignment */}
          {(order.staff_name || order.vendor_name) && (
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              {order.staff_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned Staff</label>
                  <p className="text-gray-900">{order.staff_name}</p>
                </div>
              )}
              {order.vendor_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned Vendor</label>
                  <p className="text-gray-900">{order.vendor_name}</p>
                </div>
              )}
            </div>
          )}

          {/* Measurements */}
          {measurements && (
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-500">Measurements</label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {Object.entries(measurements).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-2 rounded">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-500">Reference Images</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((img: string, idx: number) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`Order Reference ${idx + 1}`} 
                    className="w-24 h-24 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => window.open(img, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">{order.notes}</p>
            </div>
          )}

          {/* Admin Actions */}
          {(isAdmin || isStaff) && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Actions</h3>
              <div className="space-y-6">
                
                {/* Status Management */}
                <div className="grid md:grid-cols-2 gap-4">
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button onClick={() => onUpdate(order.id, { status: 'accepted' })}>
                        Accept Order
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-800 border-red-200"
                        onClick={() => onUpdate(order.id, { status: 'cancelled' })}
                      >
                        Reject Order
                      </Button>
                    </div>
                  )}

                  {(order.status === 'accepted' || order.status === 'pending') && (
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={priceInput}
                        onChange={e => setPriceInput(Number(e.target.value))}
                        className="border rounded px-3 py-2 w-32"
                        placeholder="Set Price"
                      />
                      <Button onClick={() => onUpdate(order.id, { status: 'priced', total_amount: priceInput })}>
                        Set Price
                      </Button>
                    </div>
                  )}
                </div>

                {/* Payment Management */}
                {order.status === 'priced' && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={e => setPaidAmount(Number(e.target.value))}
                      className="border rounded px-3 py-2 w-32"
                      placeholder="Paid Amount"
                    />
                    <Button onClick={() => onUpdate(order.id, { 
                      status: paidAmount >= priceInput ? 'paid' : 'priced', 
                      paid_amount: paidAmount 
                    })}>
                      Record Payment
                    </Button>
                  </div>
                )}

                {/* Staff Assignment */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-2 items-center">
                    <select
                      value={staffId}
                      onChange={e => setStaffId(e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                    >
                      <option value="">Assign Staff</option>
                      {customerService.map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name} (CS)</option>
                      ))}
                    </select>
                    <Button onClick={() => onUpdate(order.id, { staff_id: staffId })}>
                      Assign
                    </Button>
                  </div>

                  <div className="flex gap-2 items-center">
                    <select
                      value={vendorId}
                      onChange={e => setVendorId(e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                    >
                      <option value="">Assign Vendor</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={commissionInput}
                      onChange={e => setCommissionInput(Number(e.target.value))}
                      className="border rounded px-3 py-2 w-20"
                      placeholder="%"
                    />
                    <Button onClick={() => onUpdate(order.id, { 
                      vendor_id: vendorId, 
                      commission_rate: commissionInput,
                      status: 'assigned_to_vendor'
                    })}>
                      Assign
                    </Button>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={readyDate}
                      onChange={e => setReadyDate(e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                    />
                    <Button onClick={() => onUpdate(order.id, { 
                      ready_date: readyDate,
                      status: 'ready_for_fitting'
                    })}>
                      Set Ready Date
                    </Button>
                  </div>

                  <div className="flex gap-2 items-center">
                    <input
                      type="datetime-local"
                      value={fittingDate}
                      onChange={e => setFittingDate(e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                    />
                    <Button onClick={() => onUpdate(order.id, { 
                      fitting_date: fittingDate,
                      status: 'fitting_scheduled'
                    })}>
                      Schedule Fitting
                    </Button>
                  </div>
                </div>

                {/* Priority and Notes */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-2 items-center">
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <Button onClick={() => onUpdate(order.id, { priority })}>
                      Update Priority
                    </Button>
                  </div>

                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                      placeholder="Add notes..."
                    />
                    <Button onClick={() => onUpdate(order.id, { notes })}>
                      Save Notes
                    </Button>
                  </div>
                </div>

                {/* Status Updates */}
                <div className="flex gap-2 flex-wrap">
                  {order.status === 'assigned_to_vendor' && (
                    <Button onClick={() => onUpdate(order.id, { status: 'in_progress' })}>
                      Mark In Progress
                    </Button>
                  )}
                  {order.status === 'in_progress' && (
                    <Button onClick={() => onUpdate(order.id, { status: 'ready_for_fitting' })}>
                      Mark Ready for Fitting
                    </Button>
                  )}
                  {order.status === 'fitting_scheduled' && (
                    <Button onClick={() => onUpdate(order.id, { status: 'completed' })}>
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-8 flex justify-end">
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