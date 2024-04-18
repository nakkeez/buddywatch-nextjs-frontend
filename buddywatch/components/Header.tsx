'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Icon } from '@iconify/react';
import ThemeSwitch from '@/components/ThemeSwitch';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full bg-sky-500 p-6 text-white transition-colors duration-700 dark:bg-indigo-950">
      <section className="mx-auto flex max-w-7xl items-center">
        <div className="w-full">
          <h1 className="text-4xl font-extrabold">BuddyWatch</h1>
        </div>
        <nav className="flex items-center">
          <ThemeSwitch />
          <Link
            href="/"
            className="mx-3 w-24 rounded-lg bg-white py-2 text-center shadow hover:bg-gray-300 dark:bg-indigo-700 dark:hover:bg-gray-300"
          >
            <p className="font-bold text-indigo-800 dark:text-slate-200 dark:hover:text-black">
              Webcam
            </p>
          </Link>
          <Link
            href="/videos"
            className="mx-3 w-24 rounded-lg bg-white py-2 text-center shadow hover:bg-gray-300 dark:bg-indigo-700 dark:hover:bg-gray-300"
          >
            <p className="font-bold text-indigo-800 dark:text-slate-200 dark:hover:text-black">
              Videos
            </p>
          </Link>
          <Link
            href={session?.user.access ? '/api/auth/signout' : '/login'}
            className={`mx-3 rounded-lg bg-white px-2 shadow hover:bg-gray-300 dark:bg-indigo-700 dark:hover:bg-gray-300 ${session?.user.access ? 'text-red-600' : 'text-indigo-800'} shadow`}
          >
            <Icon
              icon={session?.user.access ? 'tabler:logout' : 'tabler:login'}
              width="40"
              height="40"
            />
          </Link>
        </nav>
      </section>
    </header>
  );
}
