import { Metadata } from 'next';
import SessionsTable from '@/app/ui/sessions/table';

export const metadata: Metadata = {
  title: 'Sessions',
};

export default async function Page() {
  return (
    <main>
      <SessionsTable />
    </main>
  );
}
