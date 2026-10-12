'use client';

import { Tutor } from '@/app/lib/tutor-actions';
import { Student } from '@/app/lib/student-actions';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { updateStudent, StudentFormState } from '@/app/lib/student-actions';
import { useActionState } from 'react';

export default function EditStudentForm({
  student,
  tutors,
}: {
  student: Student;
  tutors: Tutor[];
}) {
  const initialState: StudentFormState = { message: null, errors: {} };
  const updateStudentWithId = updateStudent.bind(null, student.id);
  const [state, formAction] = useActionState(updateStudentWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Student Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Student Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={student.name}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="name-error"
            required
          />
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={student.email || ''}
            placeholder="student@example.com"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="email-error"
          />
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={student.phone || ''}
            placeholder="+1 (555) 000-0000"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="phone-error"
          />
        </div>

        {/* Grade Level */}
        <div className="mb-4">
          <label htmlFor="grade_level" className="mb-2 block text-sm font-medium">
            Grade Level
          </label>
          <input
            id="grade_level"
            name="grade_level"
            type="text"
            defaultValue={student.grade_level || ''}
            placeholder="e.g., 10th Grade"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="grade-error"
          />
        </div>

        {/* Subjects */}
        <div className="mb-4">
          <label htmlFor="subjects" className="mb-2 block text-sm font-medium">
            Subjects (comma separated)
          </label>
          <input
            id="subjects"
            name="subjects"
            type="text"
            defaultValue={student.subjects?.join(', ') || ''}
            placeholder="Math, Science, English"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="subjects-error"
          />
        </div>

        {/* Parent Name */}
        <div className="mb-4">
          <label htmlFor="parent_name" className="mb-2 block text-sm font-medium">
            Parent/Guardian Name
          </label>
          <input
            id="parent_name"
            name="parent_name"
            type="text"
            defaultValue={student.parent_name || ''}
            placeholder="Parent name"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="parent-error"
          />
        </div>

        {/* Parent Phone */}
        <div className="mb-4">
          <label htmlFor="parent_phone" className="mb-2 block text-sm font-medium">
            Parent Phone
          </label>
          <input
            id="parent_phone"
            name="parent_phone"
            type="tel"
            defaultValue={student.parent_phone || ''}
            placeholder="+1 (555) 000-0000"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="parent-phone-error"
          />
        </div>

        {/* Enrollment Date */}
        <div className="mb-4">
          <label htmlFor="enrollment_date" className="mb-2 block text-sm font-medium">
            Enrollment Date
          </label>
          <input
            id="enrollment_date"
            name="enrollment_date"
            type="date"
            defaultValue={student.enrollment_date || ''}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="date-error"
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={student.status}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
            aria-describedby="status-error"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>

        {/* Preferred Tutor */}
        <div className="mb-4">
          <label htmlFor="preferred_tutor_id" className="mb-2 block text-sm font-medium">
            Preferred Tutor
          </label>
          <select
            id="preferred_tutor_id"
            name="preferred_tutor_id"
            defaultValue={student.preferred_tutor_id || ''}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
            aria-describedby="tutor-error"
          >
            <option value="">Select a tutor</option>
            {tutors?.map((tutor) => (
              <option key={tutor.id} value={tutor.id}>
                {tutor.full_name} ({tutor.email})
              </option>
            ))}
          </select>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {state.message ? (
            <p className="my-2 text-sm text-red-500">{state.message}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/students"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          <ArrowLeftIcon className="mr-2 h-5 w-5" />
          Cancel
        </Link>
        <Button type="submit">Update Student</Button>
      </div>
    </form>
  );
}