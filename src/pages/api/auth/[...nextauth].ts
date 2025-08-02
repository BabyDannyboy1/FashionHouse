import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';

// Define the database user interface to match XAMPP MySQL schema
interface DBUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'staff' | 'superadmin';
  staff_type?: 'customer_service' | 'vendor' | null;
  profile_picture?: string | null;
  created_at?: Date;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        let connection;
        try {
          connection = await pool.getConnection();
          const [users] = await connection.query(
            'SELECT id, name, email, password, role, staff_type, profile_picture FROM users WHERE email = ?',
            [credentials.email]
          ) as [DBUser[], unknown];
          if (!users.length) {
            return null;
          }
          const user = users[0];
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }
          const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '30d' }
          );
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            staff_type: user.staff_type || undefined,
            profile_picture: user.profile_picture || undefined,
            accessToken,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        } finally {
          if (connection) connection.release();
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.staff_type = user.staff_type;
        token.profile_picture = user.profile_picture;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        staff_type: token.staff_type,
        profile_picture: token.profile_picture,
        accessToken: token.accessToken,
      };
      session.expires = token.exp
        ? new Date(token.exp * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update every 24 hours
  },
};

export default NextAuth(authOptions);