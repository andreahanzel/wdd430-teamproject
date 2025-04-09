import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "../../../../../prisma/client";

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Please provide both email and password");
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				});

				if (!user) {
					throw new Error("No account found with this email address");
				}

				const passwordMatch = await bcrypt.compare(
					credentials.password,
					user.password
				);

				if (!passwordMatch) {
					throw new Error("Incorrect password");
				}

				return user;

			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/login",
	},
	callbacks: {
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.sub!;
				session.user.role = token.role;
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				const dbUser = await prisma.user.findUnique({
					where: { id: user.id },
					select: { role: true },
				});
				token.role = dbUser?.role ?? 'CUSTOMER'; // Store role in token
			}
			return token;
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
