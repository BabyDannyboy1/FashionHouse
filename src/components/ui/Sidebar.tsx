import Link from 'next/link';

interface SidebarProps {
  user?: {
    role?: 'customer' | 'staff' | 'superadmin';
    name?: string;
    staff_type?: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  return (
    <aside className="w-64 bg-white shadow-lg h-full p-4 flex flex-col">
      <div className="mb-8">
        <div className="font-bold text-lg text-gray-800">{user?.name || 'User'}</div>
        <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
        {user?.staff_type && <div className="text-xs text-gray-400">{user.staff_type}</div>}
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {user?.role === 'customer' && (
            <>
              <li><Link href="/dashboard/orders" className="text-gray-600 hover:text-gray-800">My Orders</Link></li>
              <li><Link href="/dashboard/profile" className="text-gray-600 hover:text-gray-800">Profile</Link></li>
              <li><Link href="/dashboard/settings" className="text-gray-600 hover:text-gray-800">Settings</Link></li>
            </>
          )}
          {user?.role === 'superadmin' && (
            <>
              <li><Link href="/dashboard/admin" className="text-gray-600 hover:text-gray-800">Admin Dashboard</Link></li>
              <li><Link href="/dashboard/orders" className="text-gray-600 hover:text-gray-800">All Orders</Link></li>
              <li><Link href="/dashboard/users" className="text-gray-600 hover:text-gray-800">User Management</Link></li>
              <li><Link href="/dashboard/profile" className="text-gray-600 hover:text-gray-800">Profile</Link></li>
            </>
          )}
          {user?.role === 'staff' && (
            <>
              <li><Link href="/dashboard/staff" className="text-gray-600 hover:text-gray-800">Staff Dashboard</Link></li>
              <li><Link href="/dashboard/orders" className="text-gray-600 hover:text-gray-800">Assigned Orders</Link></li>
              <li><Link href="/dashboard/profile" className="text-gray-600 hover:text-gray-800">Profile</Link></li>
            </>
          )}
          <li><Link href="/logout" className="text-gray-600 hover:text-gray-800">Logout</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;