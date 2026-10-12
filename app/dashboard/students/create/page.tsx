import { fetchTutors } from '@/app/lib/tutor-actions';
import Form from '@/app/ui/students/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Student',
};

export default async function Page() {
  const { data: tutors } = await fetchTutors();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Students', href: '/dashboard/students' },
          {
            label: 'Create Student',
            href: '/dashboard/students/create',
            active: true,
          },
        ]}
      />
      <Form tutors={tutors || []} />
    </main>
  );
}