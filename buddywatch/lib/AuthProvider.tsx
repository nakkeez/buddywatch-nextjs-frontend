'use client';

import React, { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider that wraps the application and provides authentication state.
 * @param {AuthProviderProps} children The children of the provider
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
