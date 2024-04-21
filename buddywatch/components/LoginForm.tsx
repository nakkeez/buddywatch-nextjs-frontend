'use client';

import { signIn, SignInResponse } from 'next-auth/react';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

/**
 * Component that displays a login form.
 *
 * @returns {React.JSX.Element} The login form
 */
export default function LoginForm(): React.JSX.Element {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { push } = useRouter();

  /**
   * Logs the user in using the provided credentials.
   * If the login attempt is successful, the user is redirected to the home page.
   * If the login attempt fails, the user is prompted to re-enter their credentials.
   */
  const logUserIn = async () => {
    if (!username || !password) {
      toast.error('Please fill in all fields');
      setPassword('');
      return;
    }
    const loginAttempt: SignInResponse | undefined = await signIn(
      'credentials',
      {
        username: username,
        password: password,
        redirect: false,
      }
    );
    if (loginAttempt?.ok) {
      push('/');
    } else {
      setPassword('');
      toast.error('Wrong credentials');
    }
  };

  return (
    <div className="w-full max-w-lg rounded-lg border p-12 shadow-xl dark:border-gray-500 dark:bg-indigo-700">
      <div className="mx-auto max-w-md space-y-6">
        <h3 className="text-lg font-semibold">Login to BuddyWatch</h3>
        <div>
          <label className="block py-1">Username</label>
          <input
            type="text"
            name="username"
            value={username}
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
            value={password}
            placeholder="password"
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2 font-mono shadow ring-1 ring-inset ring-gray-300 hover:border-indigo-600 dark:border-gray-500 dark:ring-gray-700 dark:hover:border-slate-200"
          />
        </div>
        <div className="flex items-center justify-between gap-3 pt-3">
          <button
            onClick={logUserIn}
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
