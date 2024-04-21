import React from 'react';
import LoginForm from '@/components/LoginForm';

/**
 * Login page that contains the login form.
 *
 * @returns {React.JSX.Element} The login page with LoginForm component
 */
export default function LoginPage(): React.JSX.Element {
  return (
    <div className="h-screen">
      <main className="mt-24 flex items-center justify-center">
        <LoginForm />
      </main>
    </div>
  );
}
