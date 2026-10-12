import Link from 'next/link';
import { deleteSession, fetchSessions, type Session } from '@/app/lib/session-actions';
import { CreateSession } from '@/app/ui/sessions/buttons';

function statusBadge(status: Session['status']) {
  const styles =
    status === 'completed'
      ? 'bg-green-100 text-green-800'
      : status === 'scheduled'
        ? 'bg-blue-100 text-blue-800'
        : status === 'no-show'
          ? 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-800';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  );
}

export default async function SessionsTable() {
  const { data: sessions, error } = await fetchSessions();

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <CreateSession />
      </div>
      <div className="inline-block min-w-full align-middle mt-4">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Student
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Subject
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Tutor
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sessions?.map((session: Session) => (
                <tr
                  key={session.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p className="font-medium">
                      {session.student?.name ?? '—'}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {session.subject}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {session.date}
                    {session.start_time ? ` · ${session.start_time}` : ''}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {session.tutor?.full_name ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {statusBadge(session.status)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/dashboard/sessions/${session.id}/edit`}
                        className="text-sm font-medium text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </Link>
                      <form
                        action={async () => {
                          'use server';
                          await deleteSession(session.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-sm font-medium text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!sessions?.length && (
            <p className="p-4 text-sm text-gray-500">
              No sessions yet. Schedule the first one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
