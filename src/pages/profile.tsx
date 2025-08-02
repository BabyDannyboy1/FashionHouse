// src/pages/profile.tsx
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Settings } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
}

const Profile: React.FC = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    id: '', name: '', email: '', phone: '', address: '', profile_picture: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchUserData();
    }
  }, [status, session?.user?.id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users?userId=${session?.user?.id}`);
      if (!res.ok) throw new Error('Failed to fetch user data');
      const data = await res.json();
      setUserData(data);
      setFormData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const saveUserData = async () => {
    try {
      const res = await fetch(`/api/users?userId=${session?.user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update user data');
      setUserData(formData);
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update user data');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formDataToSend = new FormData();
      formDataToSend.append('profilePicture', file);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataToSend,
        });
        if (!res.ok) throw new Error('Image upload failed');
        const { url } = await res.json();
        setFormData((prev) => ({ ...prev, profile_picture: url })); // Correctly update state
      } catch (err: any) {
        setError(err.message || 'Image upload failed');
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!password || password !== confirmPassword) {
      setPasswordMsg('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session?.user?.id, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) setPasswordMsg('Password updated!');
      else setPasswordMsg(data.error || 'Error updating password');
    } catch (err: any) {
      setPasswordMsg(err.message || 'Error updating password');
    }
  };

  // Determine dashboard route based on user role
  const getDashboardRoute = () => {
    if (!session?.user?.role) return '/dashboard/customer';
    if (session.user.role === 'customer') return '/dashboard/customer';
    if (session.user.role === 'staff') return '/dashboard/staff';
    if (session.user.role === 'superadmin') return '/dashboard/admin';
    return '/dashboard/customer';
  };

  if (status === 'loading' || loading) return <div className="text-white text-center py-12">Loading...</div>;
  if (status === 'unauthenticated') return <div className="text-white text-center py-12">Please log in.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-gold-400 mb-6">Profile Settings</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {userData && (
        <Card className="bg-gray-800 border-gold-500 shadow-lg max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-gold-300 flex items-center gap-2">
              <User className="h-6 w-6" /> {userData.name}'s Profile
            </CardTitle>
            <Link href={getDashboardRoute()}>
              <Button className="ml-4 bg-gold-500 hover:bg-gold-600 text-black">
                ← Back to Dashboard
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {editMode ? (
              <>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gold-500 rounded-lg text-white"
                  placeholder="Name"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gold-500 rounded-lg text-white"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gold-500 rounded-lg text-white"
                  placeholder="Phone"
                />
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gold-500 rounded-lg text-white"
                  placeholder="Address"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 bg-gray-700 border border-gold-500 rounded-lg text-white"
                />
                <div className="flex gap-2">
                  <Button onClick={saveUserData} className="bg-gold-500 hover:bg-gold-600 text-black">
                    Save
                  </Button>
                  <Button onClick={() => setEditMode(false)} variant="outline" className="text-gold-400 border-gold-500 hover:bg-gold-500 hover:text-black">
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <img
                  src={userData.profile_picture || '/default-avatar.png'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gold-500"
                />
                <p className="text-center"><strong>Name:</strong> {userData.name}</p>
                <p className="text-center"><strong>Email:</strong> {userData.email}</p>
                <p className="text-center"><strong>Phone:</strong> {userData.phone || 'Not set'}</p>
                <Button onClick={() => setEditMode(true)} className="w-full bg-gold-500 hover:bg-gold-600 text-black mt-4">
                  <Settings className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              </>
            )}
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h2 className="text-lg font-semibold text-gold-300 mb-2">Reset Password</h2>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gold-500 rounded-lg text-white mb-2"
                placeholder="New Password"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gold-500 rounded-lg text-white mb-2"
                placeholder="Confirm New Password"
              />
              {passwordMsg && <p className="text-red-500 text-sm mb-2">{passwordMsg}</p>}
              <Button onClick={handlePasswordReset} className="w-full bg-gold-500 hover:bg-gold-600 text-black">
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;