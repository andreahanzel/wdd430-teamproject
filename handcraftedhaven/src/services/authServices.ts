import { prisma } from "../../prisma/client";
import bcrypt from "bcrypt";

export async function createUser(
	name: string,
	email: string,
	password: string
) {
	try {
		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return { error: "User already exists with this email" };
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user
		const newUser = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
		});

		return {
			success: true,
			user: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
			},
		};
	} catch (error) {
		console.error("Error creating user:", error);
		return { error: "Failed to create user" };
	}
}

export async function verifyCredentials(email: string, password: string) {
	try {
		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return { error: "No user found with this email" };
		}

		// Compare provided password with stored hash
		const passwordValid = await bcrypt.compare(password, user.password);

		if (!passwordValid) {
			return { error: "Invalid password" };
		}

		return {
			success: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		};
	} catch (error) {
		console.error("Error verifying credentials:", error);
		return { error: "Authentication error" };
	}
}
