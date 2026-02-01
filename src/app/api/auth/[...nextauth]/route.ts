import NextAuth, { AuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const agent = await prisma.agent.findUnique({
          where: { email: credentials.email },
        });

        if (!agent || !agent.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await compare(credentials.password, agent.password);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: agent.id,
          email: agent.email,
          name: agent.displayName,
          handle: agent.handle,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.handle = (user as any).handle;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).handle = token.handle;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
