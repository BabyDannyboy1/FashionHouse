// src/components/OrderModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { pool } from '@/lib/db';

type Order = {
  id: number;
  customer_name: string;
  description: string;
  status: string;
};

type User = {
  id: number;
  name: string;
  role: string;
};

type Props = {
  order: Order;
  onClose: () => void;
  onSubmit: (data: { staff_id: number; price: number; commission_rate: number; status: string }) => void;
};

export default function OrderModal({ order, onClose, onSubmit }: Props) {
  const [staffId, setStaffId] = useState('');
  const [price, setPrice] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [status, setStatus] = useState(order.status);
  const [staff, setStaff] = useState<User[]>([]);

  useEffect(() => {
    async function fetchStaff() {
      const [rows] = await pool.query('SELECT id, name, role FROM users WHERE role = "staff"');
      setStaff(rows as User[]);
    }
    fetchStaff();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId || !price || !commissionRate) return;
    onSubmit({
      staff_id: parseInt(staffId),
      price: parseFloat(price),
      commission_rate: parseFloat(commissionRate),
      status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl border border-amber-500/30 max-w-md w-full">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold text-amber-500">Assign Order #{order.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-amber-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-300 mb-4">Customer: {order.customer_name}</p>
        <p className="text-gray-300 mb-4">Description: {order.description}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-amber-500 text-sm font-bold mb-2">Assign to Staff</label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-amber-500/50 rounded-lg text-white"
            >
              <option value="">Select staff</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-amber-500 text-sm font-bold mb-2">Price (₦)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-amber-500/50 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-amber-500 text-sm font-bold mb-2">Commission Rate (%)</label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-amber-500/50 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-amber-500 text-sm font-bold mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-amber-500/50 rounded-lg text-white"
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 text-black py-3 rounded-lg font-bold hover:bg-amber-400"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}