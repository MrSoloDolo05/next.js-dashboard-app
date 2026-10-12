'use client';

import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export function CreateSession() {
  return (
    <Link
      href="/dashboard/sessions/create"
      className="flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400"
    >
      <PlusIcon className="mr-2 h-5 w-5" />
      Schedule Session
    </Link>
  );
}
