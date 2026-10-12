import { handlers } from '@/auth';

// Mounts every Auth.js endpoint under /api/auth/* (csrf, signin, callback,
// session, signout) as App Router Route Handlers.
export const { GET, POST } = handlers;