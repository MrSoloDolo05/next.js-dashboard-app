import SessionsGrowthChart from '@/app/ui/dashboard/sessions-growth-chart';
import SessionStatusDonut from '@/app/ui/dashboard/session-status-donut';
import LatestSessions from '@/app/ui/dashboard/latest-sessions';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import {
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
} from '@/app/ui/skeletons';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

// Server Component (async). Charts stream in behind Suspense boundaries.
// Cards/latest-invoices from the local-Postgres tutorial are out of the demo
// path: production charts read Supabase sessions (RLS-scoped).
export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <SessionsGrowthChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <SessionStatusDonut />
        </Suspense>
      </div>
      <div className="mt-6">
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestSessions />
        </Suspense>
      </div>
    </main>
  );
}

