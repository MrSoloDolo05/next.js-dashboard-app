'use client';

import type { Student } from '@/app/lib/student-actions';
import type { Tutor } from '@/app/lib/tutor-actions';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createSession, SessionFormState } from '@/app/lib/session-actions';
import { useActionState } from 'react';

export default function Form({
  students,
  tutors,
}: {
  students: Student[];
  tutors: Tutor[];
}) {
  const initialState: SessionFormState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createSession, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="student_id" className="mb-2 block text-sm font-medium">
            Select a student
          </label>
          <select
            id="student_id"
            name="student_id"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
            aria-describedby="student-error"
            required
          >
            <option value="">Select a student</option>
            {students?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email || 'no email'})
              </option>
            ))}
          </select>
          <div id="student-error" aria-live="polite" aria-atomic="true">
            {state.errors?.student_id?.map((e: string) => (
              <p className="mt-2 text-sm text-red-500" key={e}>
                {e}
              </p>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="subject" className="mb-2 block text-sm font-medium">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            placeholder="e.g., Algebra, Biology"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="mb-2 block text-sm font-medium">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
            required
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_time" className="mb-2 block text-sm font-medium">
              Start time
            </label>
            <input
              id="start_time"
              name="start_time"
              type="time"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
            />
          </div>
          <div>
            <label htmlFor="end_time" className="mb-2 block text-sm font-medium">
              End time
            </label>
            <input
              id="end_time"
              name="end_time"
              type="time"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            id="status"
            name="status"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-show</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="tutor_id" className="mb-2 block text-sm font-medium">
            Tutor
          </label>
          <select
            id="tutor_id"
            name="tutor_id"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
          >
            <option value="">Select a tutor</option>
            {tutors?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name} ({t.email})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="notes" className="mb-2 block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Session goals, materials, follow-ups…"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>
        <div aria-live="polite" aria-atomic="true">
          {state.message ? (
            <p className="my-2 text-sm text-red-500">{state.message}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/sessions"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          <ArrowLeftIcon className="mr-2 h-5 w-5" />
          Cancel
        </Link>
        <Button type="submit">Schedule Session</Button>
      </div>
    </form>
  );
}
