import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      username?: string;
      password?: string;
      access?: string;
      refresh?: string;
    };
  }
}
