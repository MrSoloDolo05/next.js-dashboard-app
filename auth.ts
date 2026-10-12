import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import { authConfig } from './auth.config';
import { sql } from './app/lib/db';

// This file is only ever imported in the Node.js runtime (Server Components,
// Server Actions, Route Handlers), so bcrypt and the Postgres driver are safe.
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

// `handlers` exposes the Auth.js REST endpoints (signin, csrf, session, callback)
// at /api/auth/*. Without this catch-all Route Handler, proxy.ts can still
// *read* the session, but `signIn()` from a Server Action has no endpoint to
// POST the credentials to and every /api/auth/* request 404s.
export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validate the credential input before touching the database.
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await getUser(email);
          if (!user) return null;

          // Compare the submitted password against the stored bcrypt hash.
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
