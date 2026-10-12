'use server';

import { createClient } from '@/app/lib/supabase/server';
import type { JwtPayload } from '@supabase/supabase-js';

export async function fetchTutors(): Promise<{
  data: Tutor[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getClaims();
  const userClaims = authData?.claims as JwtPayload | null;
  if (!userClaims) {
    return { data: null, error: 'Unauthorized' };
  }

  const { data: tutors, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'tutor')
    .order('full_name', { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: tutors as unknown as Tutor[], error: null };
}

export type Tutor = {
  id: string;
  full_name: string | null;
  email: string | null;
};