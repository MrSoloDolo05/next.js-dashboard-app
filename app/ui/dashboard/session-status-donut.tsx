import { lusitana } from '@/app/ui/fonts';
import { fetchSessionStatusBreakdown } from '@/app/lib/session-actions';

// Chart 2 (donut, different shape): "What share of this month's sessions
// are no-shows?" Labels show name + count.
const COLORS: Record<string, string> = {
  scheduled: 'bg-blue-400',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-400',
  'no-show': 'bg-red-500',
};

export default async function SessionStatusDonut() {
  const { data: breakdown, error } = await fetchSessionStatusBreakdown();

  if (error) {
    return <p className="mt-4 text-gray-400">Could not load chart.</p>;
  }

  const total = (breakdown ?? []).reduce(
    (sum: number, s: { status: string; count: number }) => sum + s.count,
    0,
  );

  if (!total) {
    return (
      <div className="w-full md:col-span-4">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          What share of this month&apos;s sessions are no-shows?
        </h2>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            No sessions this month yet. Schedule one to see the breakdown.
          </p>
        </div>
      </div>
    );
  }

  // Build a conic-gradient donut from the status shares.
  let acc = 0;
  const stops: string[] = [];
  const palette: Record<string, string> = {
    scheduled: '#60a5fa',
    completed: '#22c55e',
    cancelled: '#9ca3af',
    'no-show': '#ef4444',
  };
  for (const s of breakdown ?? []) {
    const start = (acc / total) * 360;
    acc += s.count;
    const end = (acc / total) * 360;
    stops.push(`${palette[s.status]} ${start}deg ${end}deg`);
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        What share of this month&apos;s sessions are no-shows?
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="flex items-center gap-6 rounded-md bg-white p-4">
          <div
            className="h-36 w-36 shrink-0 rounded-full"
            style={{
              background: `conic-gradient(${stops.join(', ')})`,
              mask: 'radial-gradient(circle, transparent 55%, black 56%)',
              WebkitMask:
                'radial-gradient(circle, transparent 55%, black 56%)',
            }}
            role="img"
            aria-label={`Session status breakdown, ${total} sessions this month`}
          />
          <ul className="space-y-2 text-sm">
            {(breakdown ?? []).map(
              (s: { status: string; count: number }) => (
                <li key={s.status} className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-sm ${COLORS[s.status] ?? 'bg-gray-300'}`}
                  />
                  <span className="font-medium capitalize">{s.status}</span>
                  <span className="text-gray-500">
                    {s.count} ({Math.round((s.count / total) * 100)}%)
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          If no-shows pass 1 in 5, the manager switches those slots to
          overbookable.
        </p>
      </div>
    </div>
  );
}
