import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import ToastProvider from '@/lib/ToastProvider';
import Header from '@/components/Header';
import AuthProvider from '@/lib/AuthProvider';
import DarkModeProvider from '@/lib/ThemeProvider';

const nunito = Nunito({
  weight: ['500', '700', '800'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BuddyWatch',

  description: 'Keeps you save!',
};

/**
 * The root layout of the application.
 *
 * @param children The children of the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.className} bg-white transition-colors duration-700 dark:bg-slate-700`}
      >
        <AuthProvider>
          <DarkModeProvider>
            <Header />
            <ToastProvider>
              <main className="mx-auto max-w-7xl">{children}</main>
            </ToastProvider>
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
