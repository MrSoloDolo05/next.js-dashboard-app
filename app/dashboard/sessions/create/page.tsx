import { fetchStudents } from '@/app/lib/student-actions';
import { fetchTutors } from '@/app/lib/tutor-actions';
import Form from '@/app/ui/sessions/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Session',
};

export default async function Page() {
  // The student dropdown only shows students RLS allows this user to see —
  // the foreign-key link doubles as a live scoping proof in the demo.
  const [{ data: students }, { data: tutors }] = await Promise.all([
    fetchStudents(),
    fetchTutors(),
  ]);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Sessions', href: '/dashboard/sessions' },
          {
            label: 'Create Session',
            href: '/dashboard/sessions/create',
            active: true,
          },
        ]}
      />
      <Form students={students || []} tutors={tutors || []} />
    </main>
  );
}
