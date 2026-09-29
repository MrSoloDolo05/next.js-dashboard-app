import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// In Next.js 16 the request interceptor file is called `proxy.ts` (previously
// `middleware.ts`). `NextAuth(authConfig).auth` is Edge compatible and runs the
// `authorized` callback from auth.config.ts for every matched request.
export default NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
  // Skip API routes, static assets and images; match everything else.
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
