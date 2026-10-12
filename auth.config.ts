import type { NextAuthConfig } from 'next-auth';

// RETIRED for production: Supabase Auth (proxy.ts) is the single gate for
// /dashboard. Keeping a NextAuth `authorized()` callback active alongside
// proxy.ts created a dual-gate login loop: signing in with NextAuth set a
// NextAuth cookie but no Supabase claims, so proxy.ts bounced every
// /dashboard visit back to /login. This file is kept only so legacy imports
// don't break the build; it no longer protects any route.
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible
    // with Node.js while this file is also used in non-Node.js environments
  ],
  callbacks: {
    // Allow every request through — proxy.ts (Supabase getClaims) enforces
    // /dashboard protection. See proxy.ts for the real gate.
    authorized() {
      return true;
    },
  },
} satisfies NextAuthConfig;
