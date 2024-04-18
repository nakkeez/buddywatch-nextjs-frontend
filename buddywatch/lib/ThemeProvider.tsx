import React, { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

interface DarkModeProviderProps {
  children: ReactNode;
}
export default function DarkModeProvider({ children }: DarkModeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
