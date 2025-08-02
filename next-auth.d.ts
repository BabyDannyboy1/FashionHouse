import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'customer' | 'staff' | 'superadmin';
      staff_type?: 'customer_service' | 'vendor' | null;
      profile_picture?: string | null;
      accessToken: string;
    };
    expires: string;
  }

  interface User extends DefaultUser {
    role: 'customer' | 'staff' | 'superadmin';
    staff_type?: 'customer_service' | 'vendor' | null;
    profile_picture?: string | null;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    name?: string | null;
    email?: string | null;
    role: 'customer' | 'staff' | 'superadmin';
    staff_type?: 'customer_service' | 'vendor' | null;
    profile_picture?: string | null;
    accessToken: string;
    exp?: number; // Ensure exp is a number
  }
}