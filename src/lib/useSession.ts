import { useSession as useNextAuthSession } from 'next-auth/react';

export default function useSession() {
  const { data: session, ...rest } = useNextAuthSession();

  const typedSession = session as
    | {
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
    | null;

  return { data: typedSession, ...rest };
}