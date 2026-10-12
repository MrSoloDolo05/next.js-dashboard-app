'use server';

import { createClient } from '@/app/lib/supabase/server';
import type { JwtPayload } from '@supabase/supabase-js';

export async function fetchTutors(): Promise<{
  data: Tutor[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const userClaims = data?.claims as JwtPayload | null;
  if (!userClaims) {
    return { data: null, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'tutor')
    .order('full_name', { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Tutor[], error: null };
}

export type Tutor = {
  id: string;
  full_name: string | null;
  email: string | null;
};