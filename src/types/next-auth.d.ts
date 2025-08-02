import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username?: string | null;
      name?: string | null;
      email?: string | null;
      role: 'superadmin' | 'staff' | 'vendor' | 'customer';
      staff_type?: 'customer_service' | 'vendor' | null;
      phone?: string | null;
      address?: string | null;
      created_at?: string;
      updated_at?: string | null;
      profile_picture?: string | null;
      accessToken: string;
    };
    expires: string;
  }

  interface User extends DefaultUser {
    id: string;
    username?: string | null;
    name?: string | null;
    email?: string | null;
    role: 'superadmin' | 'staff' | 'vendor' | 'customer';
    staff_type?: 'customer_service' | 'vendor' | null;
    phone?: string | null;
    address?: string | null;
    created_at?: string;
    updated_at?: string | null;
    profile_picture?: string | null;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    username?: string | null;
    name?: string | null;
    email?: string | null;
    role: 'superadmin' | 'staff' | 'vendor' | 'customer';
    staff_type?: 'customer_service' | 'vendor' | null;
    phone?: string | null;
    address?: string | null;
    created_at?: string;
    updated_at?: string | null;
    profile_picture?: string | null;
    accessToken: string;
    exp?: number;
  }
}