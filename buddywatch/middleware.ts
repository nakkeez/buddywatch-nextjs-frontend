import { withAuth } from 'next-auth/middleware';

/**
 * Middleware that checks if the user is authorized to access the page.
 */
export default withAuth({
  callbacks: {
    // Set callback to check if the user has access token and is authorized to access the page
    authorized({ token }) {
      return !!token?.access;
    },
  },
});

export const config = { matcher: ['/', '/videos'] };
