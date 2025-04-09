import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development and avoid instantiation in the browser
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
	});

// Only save to global object in development and on server
if (process.env.NODE_ENV !== "production" && typeof window === "undefined") {
	globalForPrisma.prisma = prisma;
}
