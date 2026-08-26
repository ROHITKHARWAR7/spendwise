import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        const email = String(credentials.email)
          .trim()
          .toLowerCase();

        const password = String(
          credentials.password
        );

        const user = await prisma.user.findUnique({
  where: {
    email,
  },
});

console.log("AUTH DEBUG - user found:", !!user);
console.log(
  "AUTH DEBUG - password exists:",
  !!user?.password
);

if (!user || !user.password) {
  console.log("AUTH DEBUG - returning null: user/password missing");
  return null;
}

const passwordValid = await bcrypt.compare(
  password,
  user.password
);

console.log(
  "AUTH DEBUG - password valid:",
  passwordValid
);

if (!passwordValid) {
  console.log("AUTH DEBUG - returning null: invalid password");
  return null;
}

console.log(
  "AUTH DEBUG - SUCCESS:",
  user.email,
  user.id
);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }

      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});