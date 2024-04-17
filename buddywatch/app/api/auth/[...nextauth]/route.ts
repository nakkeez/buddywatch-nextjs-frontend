import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode, JwtPayload } from 'jwt-decode';

async function refreshAccessToken(token: any) {
  try {
    const tokenResponse: Response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + '/api/token/refresh/',
      {
        // @ts-ignore
        refresh: token.refresh,
      }
    );

    const accessToken = await tokenResponse.json();
    console.log('Refreshed: ' + accessToken);
    return {
      ...token,
      access: accessToken.access,
      refresh: token.refresh,
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
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

          if (user) {
            if (!user.access) return null;
            return user;
          } else {
            return null;
          }
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
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
          token = await refreshAccessToken(decodedAccessToken);
          console.log('Refreshed: ' + token);
        } else if (
          accessTokenExpiration &&
          refreshTokenExpiration &&
          accessTokenExpiration < now &&
          refreshTokenExpiration < now
        ) {
          token = null;
          console.log('Nulled: ' + token);
        }
      }

      return { ...token, ...user };
    },
    async session({ session, token, user }: any) {
      session.user = token as any;
      return session;
    },
  },
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
