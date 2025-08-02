import React, { useState } from 'react';

const AdminUserManagement: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffType, setStaffType] = useState<'customer_service' | 'vendor'>('customer_service');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!username.trim()) {
      setMessage('Username is required');
      return;
    }
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password, role: 'staff', staff_type: staffType }),
    });
    const data = await res.json();
    if (res.ok) setMessage('Staff created!');
    else setMessage(data.error || 'Error creating staff');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <form onSubmit={handleCreateStaff} className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Staff Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Staff Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Staff Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <select
          value={staffType}
          onChange={e => setStaffType(e.target.value as 'customer_service' | 'vendor')}
          className="w-full p-2 border rounded"
          required
        >
          <option value="customer_service">Customer Service</option>
          <option value="vendor">Vendor</option>
        </select>
        <button type="submit" className="bg-gold-400 text-black px-4 py-2 rounded">Create Staff</button>
      </form>
      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
};

export default AdminUserManagement;