import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === "test@test.com" &&
          credentials?.password === "password"
        ) {
          return {
            id: "user-1",
            name: "Test User",
            email: "test@test.com",
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as any).id = token.id;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
