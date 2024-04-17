'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Icon } from '@iconify/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex w-full items-center bg-sky-500 p-6 text-white">
      <div className="w-full">
        <h1 className="text-3xl font-bold">BuddyWatch</h1>
      </div>
      <nav className="flex items-center">
        <Link href="/" className="mx-4 rounded-lg bg-white px-4 py-2 shadow">
          <p className="font-bold text-indigo-800">Webcam</p>
        </Link>
        <Link href="/videos" className="rounded-lg bg-white px-4 py-2 shadow">
          <p className="mx-4 font-bold text-indigo-800">Videos</p>
        </Link>
        <Link
          href={session?.user.access ? '/api/auth/signout' : '/login'}
          className={`mx-4 rounded-lg bg-white px-2 ${session?.user.access ? 'text-red-600' : 'text-indigo-800'} shadow`}
        >
          <Icon
            icon={session?.user.access ? 'tabler:logout' : 'tabler:login'}
            width="40"
            height="40"
          />
        </Link>
      </nav>
    </header>
  );
}
