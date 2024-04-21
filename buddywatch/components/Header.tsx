'use client';

import React from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Icon } from '@iconify/react';
import ThemeSwitch from '@/components/ThemeSwitch';

/**
 * Header component that contains the navigation, theme switching, and log out functionality.
 * @returns {React.JSX.Element} Header component
 */
export default function Header(): React.JSX.Element {
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
          {session?.user.access ? (
            <button
              // Log user out using the signOut function from next-auth and redirect to the login page
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="mx-3 rounded-lg bg-white px-2 text-red-600 shadow hover:bg-gray-300 dark:bg-indigo-700 dark:hover:bg-gray-300"
            >
              <Icon icon="tabler:logout" width="40" height="40" />
            </button>
          ) : (
            <Link
              href="/login"
              className="${session?.user.access mx-3 rounded-lg bg-white px-2 text-indigo-800 shadow shadow hover:bg-gray-300 dark:bg-indigo-700 dark:hover:bg-gray-300"
            >
              <Icon
                icon={session?.user.access ? 'tabler:logout' : 'tabler:login'}
                width="40"
                height="40"
              />
            </Link>
          )}
        </nav>
      </section>
    </header>
  );
}
