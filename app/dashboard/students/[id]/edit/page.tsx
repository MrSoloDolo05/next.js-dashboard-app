import Form from '@/app/ui/students/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchStudentById } from '@/app/lib/student-actions';
import { fetchTutors } from '@/app/lib/tutor-actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Student',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const [{ data: student }, { data: tutors }] = await Promise.all([
    fetchStudentById(id),
    fetchTutors(),
  ]);

  if (!student) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Students', href: '/dashboard/students' },
          {
            label: 'Edit Student',
            href: `/dashboard/students/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form student={student} tutors={tutors || []} />
    </main>
  );
}