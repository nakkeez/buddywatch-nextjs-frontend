'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex w-full justify-center bg-sky-500 p-6 text-white">
      <h1 className="text-3xl font-bold">BuddyWatch</h1>
      <Link href="/">Webcam</Link>
      <Link href="/videos">Videos</Link>
      <button className="text-red-500" onClick={() => signOut()}>
        Sign Out
      </button>
    </header>
  );
}
