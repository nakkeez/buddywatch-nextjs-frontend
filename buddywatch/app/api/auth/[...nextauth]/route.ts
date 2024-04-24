import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode, JwtPayload } from 'jwt-decode';

/**
 * Refreshes the access token from the server using the refresh token.
 * If the refresh token is invalid, the access token is set to null.
 * @param {any} token The token object containing the access and refresh tokens.
 */
async function refreshAccessToken(token: any) {
  try {
    const tokenResponse: Response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + '/api/token/refresh/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: token.refresh,
        }),
      }
    );

    const accessToken = await tokenResponse.json();

    return {
      // Return the new access token and the old refresh token
      ...token,
      access: accessToken.access,
      refresh: token.refresh,
    };
  } catch (error) {
    // Return null token if refresh token is invalid
    return {
      ...token,
      token: null,
      error: 'RefreshTokenError',
    };
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'your credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        // Return null if no credentials are provided
        if (!credentials?.username || !credentials?.password) return null;
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/token/`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: credentials?.username,
                password: credentials?.password,
              }),
            }
          );

          const user = await response.json();

          // Return null if user has no access, i.e., user is not authenticated
          // Otherwise, return the user object
          if (user) {
            if (!user.access) return null;
            return user;
          } else {
            return null;
          }
        } catch (error) {
          console.error('Error occurred while authenticating: ', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    // Set the custom sign in page
    signIn: '/login',
  },
  callbacks: {
    // Set callback to return the token and user object and refresh the access token if necessary
    async jwt({ token, user }: any) {
      if (token.access) {
        const decodedAccessToken: JwtPayload = jwtDecode(token.access);
        const accessTokenExpiration: number | undefined =
          decodedAccessToken.exp;

        const decodedRefreshToken: JwtPayload = jwtDecode(token.refresh);
        const refreshTokenExpiration: number | undefined =
          decodedRefreshToken.exp;

        const now: number = Date.now() / 1000;

        if (
          accessTokenExpiration &&
          refreshTokenExpiration &&
          accessTokenExpiration < now &&
          refreshTokenExpiration > now
        ) {
          token = await refreshAccessToken(token);
        } else if (
          accessTokenExpiration &&
          refreshTokenExpiration &&
          accessTokenExpiration < now &&
          refreshTokenExpiration < now
        ) {
          token = null;
        }
      }

      return { ...token, ...user };
    },
    // Set callback to add the user object to the session so its accessible in the app
    async session({ session, token, user }: any) {
      session.user = token as any;
      return session;
    },
  },
};

// Export the NextAuth handler
export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
