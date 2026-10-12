'use client';

import type { Session } from '@/app/lib/session-actions';
import type { Student } from '@/app/lib/student-actions';
import type { Tutor } from '@/app/lib/tutor-actions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateSession, SessionFormState } from '@/app/lib/session-actions';
import { useActionState } from 'react';

export default function EditSessionForm({
  session,
  students,
}: {
  session: Session;
  students: Student[];
  tutors: Tutor[];
}) {
  const initialState: SessionFormState = { message: null, errors: {} };
  const updateWithId = updateSession.bind(null, session.id);
  const [state, formAction] = useActionState(updateWithId, initialState);

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
            defaultValue={session.student_id}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
            required
          >
            <option value="">Select a student</option>
            {students?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email || 'no email'})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="subject" className="mb-2 block text-sm font-medium">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            defaultValue={session.subject}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
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
            defaultValue={session.date}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={session.status}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-show</option>
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
            defaultValue={session.notes || ''}
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
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
          Cancel
        </Link>
        <Button type="submit">Update Session</Button>
      </div>
    </form>
  );
}
