import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ token }) {
      return !!token?.access;
    },
  },
});

export const config = { matcher: ['/', '/videos'] };
