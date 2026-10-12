import Link from 'next/link';
import { formatDateToLocal } from '@/app/lib/utils';
import { fetchStudents } from '@/app/lib/student-actions';
import { CreateStudent } from '@/app/ui/students/buttons';
import { Metadata } from 'next';

export default async function StudentsTable() {
  const { data: students, error } = await fetchStudents();

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <CreateStudent />
      </div>
      <div className="inline-block min-w-full align-middle mt-4">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Phone
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Grade
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Enrolled
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {students?.map((student) => (
                <tr
                  key={student.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p className="font-medium">{student.name}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {student.email || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {student.phone || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {student.grade_level || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' :
                      student.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(student.created_at)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/dashboard/students/${student.id}/edit`}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}