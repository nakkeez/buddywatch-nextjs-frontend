import React from 'react';
import RegisterForm from '@/components/RegisterForm';

/**
 * Register page that contains the registration form.
 *
 * @returns {React.JSX.Element} The register page containing the RegisterForm component
 */
export default function RegisterPage(): React.JSX.Element {
  return (
    <div className="h-screen">
      <main className="mt-24 flex items-center justify-center">
        <RegisterForm />
      </main>
    </div>
  );
}
