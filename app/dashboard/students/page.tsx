import { Metadata } from 'next';
import StudentsTable from '@/app/ui/students/table';

export const metadata: Metadata = {
  title: 'Students',
};

export default async function Page() {
  return (
    <main>
      <StudentsTable />
    </main>
  );
}