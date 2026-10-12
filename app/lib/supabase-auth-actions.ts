'use server';

import { createClient } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';

export type SupabaseAuthState = {
  message?: string | null;
};

// Single production auth path: Supabase Auth only. The proxy.ts gate reads the
// Supabase session cookie (getClaims), so sign-in MUST create a Supabase
// session — NextAuth credentials cannot satisfy RLS (auth.uid()) and caused a
// login loop (NextAuth cookie present, Supabase claims absent).
export async function loginWithSupabase(
  prevState: SupabaseAuthState | undefined,
  formData: FormData,
): Promise<SupabaseAuthState> {
  const supabase = await createClient();

  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';
  const redirectTo =
    (formData.get('redirectTo') as string | null) || '/dashboard';

  if (!email || !password) {
    return { message: 'Please enter your email and password.' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: 'Invalid credentials.' };
  }

  // redirect() throws NEXT_REDIRECT — must be outside try/catch.
  redirect(redirectTo);
}

export async function signOutSupabase() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
