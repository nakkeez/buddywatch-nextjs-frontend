import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'your credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
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
          console.log(user.access);
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // @ts-ignore
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    // @ts-ignore
    async session({ session, token, user }) {
      session.user = token as any;
      return session;
    },
  },
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
