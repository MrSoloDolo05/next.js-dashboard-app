import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchSessionsByMonth } from '@/app/lib/session-actions';

// Chart 1 (bar): "Are sessions growing? Completed sessions per month."
// Honesty: y-axis starts at zero, x labels are YYYY-MM, bars are raw counts
// from Supabase (RLS-scoped to the signed-in user).
export default async function SessionsGrowthChart() {
  const { data: months, error } = await fetchSessionsByMonth();

  if (error) {
    return <p className="mt-4 text-gray-400">Could not load chart.</p>;
  }

  const chartHeight = 250;
  const counts = (months ?? []).map((m: { month: string; count: number }) => m.count);
  const max = Math.max(1, ...counts);

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Are sessions growing? Completed sessions per month
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4">
          {(months ?? []).map((m: { month: string; count: number }) => (
            <div key={m.month} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-blue-500"
                style={{ height: `${(chartHeight / max) * m.count}px` }}
                title={`${m.month}: ${m.count} completed sessions`}
              />
              <p className="-rotate-90 text-xs text-gray-400 sm:rotate-0">
                {m.month.slice(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">
            Y-axis: completed sessions (starts at 0) · X-axis: month · Last 12
            months
          </h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          If the last three bars fall, the manager holds off on hiring a second
          tutor.
        </p>
      </div>
    </div>
  );
}
