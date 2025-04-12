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
            return {
                error:
                    "An account with this email already exists. Please use a different email or try logging in.",
            };
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
        // Check specific database errors
        if (error instanceof Error) {
            if (error.message.includes("Unique constraint")) {
                return { error: "An account with this email already exists." };
            }
        }
        return {
            error: "We couldn't create your account. Please try again later.",
        };
    }
}


export async function verifyCredentials(email: string, password: string) {
    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });


        if (!user) {
            return {
                error:
                    "No account found with this email. Please check your email address or create a new account.",
            };
        }


        // Compare provided password with stored hash
        const passwordValid = await bcrypt.compare(password, user.password);


        if (!passwordValid) {
            return {
                error: "Incorrect password. Please check your password and try again.",
            };
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
        return { error: "Authentication failed. Please try again later." };
    }
}


// Add these functions to authServices.ts:


export async function findUserByEmail(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
        } catch (error) {
        console.error("Error finding user by email:", error);
        return null;
        }
    }

    export async function validatePassword(password: string, hashedPassword: string) {
        try {
        return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
        console.error("Error validating password:", error);
        return false;
        }
    }

