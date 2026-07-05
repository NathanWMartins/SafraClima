import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import { prisma } from "./lib/prisma"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth} = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        session({ session, user}) {
            session.user.id = user.id;
            return session;
        },
    },
});