import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const LoginPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'customer') {
        router.push('/dashboard/customer');
      } else if (session.user.role === 'staff') {
        router.push('/dashboard/staff');
      } else if (session.user.role === 'superadmin') {
        router.push('/dashboard/admin');
      }
    }
  }, [status, session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (result?.error) setError(result.error);
    else if (session?.user) {
      if (session.user.role === 'customer') router.push('/dashboard/customer');
      else if (session.user.role === 'staff') router.push('/dashboard/staff');
      else if (session.user.role === 'superadmin') router.push('/dashboard/admin');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: newEmail, password: newPassword, role: 'customer' }),
    });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      await signIn('credentials', { email: newEmail, password: newPassword, redirect: false });
      if (session?.user && session.user.role === 'customer') router.push('/dashboard/customer');
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-black flex items-center justify-center p-4"><p className="text-white">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold text-gold-400">Jeca Kings Garment</h1>
          <CardTitle className="text-2xl text-white mt-2">{isSignup ? 'Create Account' : 'Login'}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm text-gray-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gold-500 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-300">Email</label>
              <input
                type="email"
                value={isSignup ? newEmail : email}
                onChange={(e) => isSignup ? setNewEmail(e.target.value) : setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gold-500 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Password</label>
              <input
                type="password"
                value={isSignup ? newPassword : password}
                onChange={(e) => isSignup ? setNewPassword(e.target.value) : setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gold-500 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-black py-2 rounded-md hover:from-gold-300 hover:to-gold-500"
            >
              {isSignup ? 'Sign Up' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-gray-400">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="ml-1 text-gold-400 hover:text-gold-500"
              >
                {isSignup ? 'Login' : 'Sign Up'}
              </button>
            </p>
            <Link
              href="/"
              className="mt-2 inline-block text-gold-400 hover:text-gold-500 underline"
            >
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;