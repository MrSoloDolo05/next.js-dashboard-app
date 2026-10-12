'use client';

import {
  HomeIcon,
  DocumentDuplicateIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Demo path: Home (charts) → Students (Entity 1) → Sessions (Entity 2).
// Legacy Invoices/Customers routes still exist but are out of the demo path
// (local-Postgres tutorial tables, not Supabase RLS data).
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Students', href: '/dashboard/students', icon: UserIcon },
  {
    name: 'Sessions',
    href: '/dashboard/sessions',
    icon: DocumentDuplicateIcon,
  },
];

export default function NavLinks() {
  // usePathname() is a Client Component hook, so this file needs 'use client'.
  // It re-renders the link list with the active styles on every navigation.
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
