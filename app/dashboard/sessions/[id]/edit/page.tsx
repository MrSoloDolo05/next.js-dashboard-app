import Form from '@/app/ui/sessions/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchSessionById } from '@/app/lib/session-actions';
import { fetchStudents } from '@/app/lib/student-actions';
import { fetchTutors } from '@/app/lib/tutor-actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Session',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  // RLS proof: fetching another user's session id returns no row → notFound().
  const [{ data: session }, { data: students }, { data: tutors }] =
    await Promise.all([
      fetchSessionById(id),
      fetchStudents(),
      fetchTutors(),
    ]);

  if (!session) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Sessions', href: '/dashboard/sessions' },
          {
            label: 'Edit Session',
            href: `/dashboard/sessions/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form session={session} students={students || []} tutors={tutors || []} />
    </main>
  );
}
