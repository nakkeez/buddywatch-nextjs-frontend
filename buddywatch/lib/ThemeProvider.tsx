import React, { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

interface DarkModeProviderProps {
  children: ReactNode;
}

/**
 * Provider that wraps the application and provides dark mode state.
 * @param {DarkModeProviderProps} children The children of the provider
 * @returns The dark mode provider
 */
export default function DarkModeProvider({ children }: DarkModeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
