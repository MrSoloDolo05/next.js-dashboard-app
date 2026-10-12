'use server';

import { createClient } from '@/app/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { JwtPayload } from '@supabase/supabase-js';

const StudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  grade_level: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  enrollment_date: z.string().optional(),
  status: z.enum(['active', 'paused', 'graduated']).default('active'),
  preferred_tutor_id: z.string().uuid().optional().or(z.literal('')),
});

export type StudentFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    grade_level?: string[];
    subjects?: string[];
    parent_name?: string[];
    parent_phone?: string[];
    enrollment_date?: string[];
    status?: string[];
    preferred_tutor_id?: string[];
  };
  message?: string | null;
};

export async function createStudent(
  prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const supabase = await createClient();

  // Get the current user's claims to determine centre_id
  const { data } = await supabase.auth.getClaims();
  const userClaims = data?.claims as JwtPayload | null;
  if (!userClaims) {
    return { message: 'Unauthorized' };
  }

  // Get user's profile to find centre_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('centre_id, role')
    .eq('id', userClaims.sub)
    .single();

  if (!profile) {
    return { message: 'Profile not found' };
  }

  // Parse and validate form data
  const rawSubjects = formData.get('subjects');
  let subjects: string[] = [];
  if (rawSubjects) {
    try {
      subjects = JSON.parse(rawSubjects as string);
    } catch {
      subjects = (rawSubjects as string).split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  const validatedFields = StudentSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
    grade_level: formData.get('grade_level') || undefined,
    subjects,
    parent_name: formData.get('parent_name') || undefined,
    parent_phone: formData.get('parent_phone') || undefined,
    enrollment_date: formData.get('enrollment_date') || undefined,
    status: formData.get('status') || 'active',
    preferred_tutor_id: formData.get('preferred_tutor_id') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields below.',
    };
  }

  const { preferred_tutor_id, ...studentData } = validatedFields.data;

  // Insert student with centre_id from user's profile
  const { error } = await supabase.from('students').insert({
    ...studentData,
    subjects: studentData.subjects || [],
    preferred_tutor_id: preferred_tutor_id || null,
    centre_id: profile.centre_id,
    created_by: claims.sub,
  });

  if (error) {
    console.error('Error creating student:', error);
    return { message: `Database Error: ${error.message}` };
  }

  revalidatePath('/dashboard/students');
  redirect('/dashboard/students');
}

export async function fetchStudents(): Promise<{
  data: Student[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getClaims();
  const userClaims = authData?.claims as JwtPayload | null;
  if (!userClaims) {
    return { data: null, error: 'Unauthorized' };
  }

  const { data: students, error } = await supabase
    .from('students')
    .select(`
      *,
      preferred_tutor:profiles!students_preferred_tutor_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: students as Student[], error: null };
}

export async function fetchStudentById(id: string): Promise<{
  data: Student | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const userClaims = data?.claims as JwtPayload | null;
  if (!userClaims) {
    return { data: null, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      preferred_tutor:profiles!students_preferred_tutor_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Student, error: null };
}

export async function updateStudent(
  id: string,
  prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const userClaims = data?.claims as JwtPayload | null;
  if (!userClaims) {
    return { message: 'Unauthorized' };
  }

  const rawSubjects = formData.get('subjects');
  let subjects: string[] = [];
  if (rawSubjects) {
    try {
      subjects = JSON.parse(rawSubjects as string);
    } catch {
      subjects = (rawSubjects as string).split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  const validatedFields = StudentSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
    grade_level: formData.get('grade_level') || undefined,
    subjects,
    parent_name: formData.get('parent_name') || undefined,
    parent_phone: formData.get('parent_phone') || undefined,
    enrollment_date: formData.get('enrollment_date') || undefined,
    status: formData.get('status') || 'active',
    preferred_tutor_id: formData.get('preferred_tutor_id') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields below.',
    };
  }

  const { preferred_tutor_id, ...studentData } = validatedFields.data;

  const { error } = await supabase
    .from('students')
    .update({
      ...studentData,
      subjects: studentData.subjects || [],
      preferred_tutor_id: preferred_tutor_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating student:', error);
    return { message: `Database Error: ${error.message}` };
  }

  revalidatePath('/dashboard/students');
  redirect('/dashboard/students');
}

export async function deleteStudent(id: string): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const userClaims = data?.claims as JwtPayload | null;
  if (!userClaims) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase.from('students').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/students');
  return { error: null };
}

export type Student = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  grade_level: string | null;
  subjects: string[];
  parent_name: string | null;
  parent_phone: string | null;
  enrollment_date: string | null;
  status: 'active' | 'paused' | 'graduated';
  preferred_tutor_id: string | null;
  centre_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  preferred_tutor?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
};