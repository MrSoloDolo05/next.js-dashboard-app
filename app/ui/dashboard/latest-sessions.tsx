import { lusitana } from '@/app/ui/fonts';
import { fetchSessions } from '@/app/lib/session-actions';

// Latest sessions feed on the overview (replaces LatestInvoices, which reads
// the local-Postgres tutorial table unavailable in production).
export default async function LatestSessions() {
  const { data: sessions, error } = await fetchSessions();

  if (error) {
    return <p className="mt-4 text-gray-400">Could not load sessions.</p>;
  }

  const latest = (sessions ?? []).slice(0, 5);

  return (
    <div className="w-full">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest sessions
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="rounded-md bg-white px-6 py-4">
          {!latest.length && (
            <p className="py-4 text-sm text-gray-500">
              No sessions yet. Schedule the first one from Sessions.
            </p>
          )}
          {latest.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border-b py-3 last:border-none"
            >
              <div>
                <p className="font-medium">
                  {s.student?.name ?? 'Unknown student'}
                </p>
                <p className="text-sm text-gray-500">
                  {s.subject} · {s.date}
                </p>
              </div>
              <span className="text-sm capitalize text-gray-600">
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
