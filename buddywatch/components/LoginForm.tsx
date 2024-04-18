'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="w-full max-w-lg rounded-lg border p-12 shadow-xl dark:border-gray-500 dark:bg-indigo-700">
      <div className="mx-auto max-w-md space-y-6">
        <h3 className="text-lg font-semibold">Login to BuddyWatch</h3>
        <div>
          <label className="block py-1">Username</label>
          <input
            type="text"
            name="username"
            placeholder="username"
            required
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded border p-2 font-mono shadow ring-1 ring-inset ring-gray-300 hover:border-indigo-600 dark:border-gray-500 dark:ring-gray-700 dark:hover:border-slate-200"
          />
        </div>
        <div>
          <label className="block py-1">Password</label>
          <input
            type="password"
            name="password"
            placeholder="password"
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2 font-mono shadow ring-1 ring-inset ring-gray-300 hover:border-indigo-600 dark:border-gray-500 dark:ring-gray-700 dark:hover:border-slate-200"
          />
        </div>
        <div className="flex items-center justify-between gap-3 pt-3">
          <button
            onClick={() =>
              signIn('credentials', {
                username: username,
                password: password,
                callbackUrl: '/',
              })
            }
            className="rounded border px-4 py-2 shadow ring-1 ring-inset ring-gray-300 hover:border-indigo-600 dark:border-gray-500 dark:bg-slate-700 dark:ring-gray-700 dark:hover:border-slate-200"
          >
            Login
          </button>
          <Link href="/login/register" className="ml-4">
            <p className="font-bold text-indigo-800 dark:text-white">
              Register new account
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
