import type { NextAuthConfig } from 'next-auth';

// Edge-safe configuration. This file is imported by proxy.ts (which runs on the
// Edge runtime), so it must NOT import bcrypt, postgres or anything else that
// requires Node.js APIs.
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible
    // with Node.js while this file is also used in non-Node.js environments
  ],
  callbacks: {
    // Runs for every matched request: protects /dashboard and bounces
    // already-authenticated users away from the login page.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
