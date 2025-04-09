import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
		interface Session {
			user: {
				id: string;
				name?: string | null;
				email?: string | null;
				image?: string | null;
				role?: "CUSTOMER" | "SELLER";	
			};
		}

		interface User {
			id: string;
			role: "CUSTOMER" | "SELLER";
		}
}
		declare module "next-auth/jwt" {
		interface JWT {
			role?: "CUSTOMER" | "SELLER";
			id?: string;
		}
}
