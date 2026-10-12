'use server';

import { createClient } from '@/app/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { JwtPayload } from '@supabase/supabase-js';

// Entity 2: sessions linked to students via student_id FK.
const SessionSchema = z.object({
  student_id: z.string().uuid('Please select a student'),
  tutor_id: z.string().uuid().optional().or(z.literal('')),
  subject: z.string().min(1, 'Subject is required'),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().optional().or(z.literal('')),
  end_time: z.string().optional().or(z.literal('')),
  status: z
    .enum(['scheduled', 'completed', 'cancelled', 'no-show'])
    .default('scheduled'),
  notes: z.string().optional(),
});

export type SessionFormState = {
  errors?: {
    student_id?: string[];
    tutor_id?: string[];
    subject?: string[];
    date?: string[];
    start_time?: string[];
    end_time?: string[];
    status?: string[];
    notes?: string[];
  };
  message?: string | null;
};

export type Session = {
  id: string;
  student_id: string;
  tutor_id: string | null;
  subject: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  centre_id: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  student?: { id: string; name: string; email: string | null } | null;
  tutor?: { id: string; full_name: string | null; email: string | null } | null;
};

function parseSessionForm(formData: FormData) {
  return SessionSchema.safeParse({
    student_id: formData.get('student_id'),
    tutor_id: formData.get('tutor_id') || undefined,
    subject: formData.get('subject'),
    date: formData.get('date'),
    start_time: formData.get('start_time') || undefined,
    end_time: formData.get('end_time') || undefined,
    status: formData.get('status') || 'scheduled',
    notes: formData.get('notes') || undefined,
  });
}

export async function createSession(
  prevState: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userClaims = data?.claims as JwtPayload | null;
  if (!userClaims?.sub) return { message: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('centre_id')
    .eq('id', userClaims.sub)
    .single();
  if (!profile) return { message: 'Profile not found' };

  const validatedFields = parseSessionForm(formData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields below.',
    };
  }

  const { tutor_id, start_time, end_time, ...sessionData } =
    validatedFields.data;

  const { error } = await supabase.from('sessions').insert({
    ...sessionData,
    tutor_id: tutor_id || null,
    start_time: start_time || null,
    end_time: end_time || null,
    centre_id: profile.centre_id,
    created_by: userClaims.sub,
  });

  if (error) {
    return { message: `Database Error: ${error.message}` };
  }

  revalidatePath('/dashboard/sessions');
  redirect('/dashboard/sessions');
}

export async function updateSession(
  id: string,
  prevState: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userClaims = data?.claims as JwtPayload | null;
  if (!userClaims) return { message: 'Unauthorized' };

  const validatedFields = parseSessionForm(formData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields below.',
    };
  }

  const { tutor_id, start_time, end_time, ...sessionData } =
    validatedFields.data;

  const { error } = await supabase
    .from('sessions')
    .update({
      ...sessionData,
      tutor_id: tutor_id || null,
      start_time: start_time || null,
      end_time: end_time || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { message: `Database Error: ${error.message}` };
  }

  revalidatePath('/dashboard/sessions');
  redirect('/dashboard/sessions');
}

export async function deleteSession(id: string): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userClaims = data?.claims as JwtPayload | null;
  if (!userClaims) return { error: 'Unauthorized' };

  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/sessions');
  return { error: null };
}

export async function fetchSessions(): Promise<{
  data: Session[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userClaims = authData?.claims as JwtPayload | null;
  if (!userClaims) return { data: null, error: 'Unauthorized' };

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select(
      `
      *,
      student:students!sessions_student_id_fkey (id, name, email),
      tutor:profiles!sessions_tutor_id_fkey (id, full_name, email)
    `,
    )
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: sessions as Session[], error: null };
}

export async function fetchSessionById(id: string): Promise<{
  data: Session | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userClaims = data?.claims as JwtPayload | null;
  if (!userClaims) return { data: null, error: 'Unauthorized' };

  const { data: session, error } = await supabase
    .from('sessions')
    .select(
      `
      *,
      student:students!sessions_student_id_fkey (id, name, email),
      tutor:profiles!sessions_tutor_id_fkey (id, full_name, email)
    `,
    )
    .eq('id', id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: session as Session, error: null };
}

// Monthly completed-session counts for Chart 1 (trailing 12 months).
export async function fetchSessionsByMonth(): Promise<{
  data: { month: string; count: number }[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userClaims = authData?.claims as JwtPayload | null;
  if (!userClaims) return { data: null, error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('sessions')
    .select('date, status')
    .order('date', { ascending: true })
    .limit(2000);

  if (error) return { data: null, error: error.message };

  const buckets = new Map<string, number>();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, 0);
  }
  for (const row of data ?? []) {
    if (row.status !== 'completed') continue;
    const key = String(row.date).slice(0, 7);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return {
    data: [...buckets.entries()].map(([month, count]) => ({ month, count })),
    error: null,
  };
}

// Current-month status breakdown for Chart 2 (donut).
export async function fetchSessionStatusBreakdown(): Promise<{
  data: { status: Session['status']; count: number }[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userClaims = authData?.claims as JwtPayload | null;
  if (!userClaims) return { data: null, error: 'Unauthorized' };

  const now = new Date();
  const first = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const lastStr = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('sessions')
    .select('status')
    .gte('date', first)
    .lte('date', lastStr);

  if (error) return { data: null, error: error.message };

  const counts = new Map<Session['status'], number>();
  for (const row of data ?? []) {
    const s = row.status as Session['status'];
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return {
    data: [...counts.entries()].map(([status, count]) => ({ status, count })),
    error: null,
  };
}
