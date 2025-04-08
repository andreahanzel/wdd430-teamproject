"use server";

import { SignupFormSchema, FormState, LoginFormSchema } from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { createUser, findUserByEmail, validatePassword } from "@/services/authServices";

export async function signup(state: FormState, formData: FormData) {

    // Validate form fields
    const validatedFields = SignupFormSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
    })
    
    // If any form fields are invalid, return early
    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    // Prepare data and create a new user
    const { name, email, password } = validatedFields.data;
    const user = await createUser(name, email, password);

    // If the user wasn't created successfully, return an error message
    if (!user) {
        return {
            message: "An error occurred while creating your account. Please try again.",
        }
    }

    // Create a session for the user
    await createSession(user.id);

    // Redirect the user to the login page
    redirect("/login");
}

export async function login(state: FormState, formData: FormData) {
    // Validate form fields
    const validatedFields = LoginFormSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    })

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    // Compare the password with the hashed password in the database
    const { email, password } = validatedFields.data;
    const user = await findUserByEmail(email);

    if (!user) {
        return {
            errors: {
                email: ["Invalid email or password."],
            },
        }
    }
    const isPasswordValid = await validatePassword(password, user.password);

    if (!isPasswordValid) {
        return {
            errors: {
                password: ["Invalid email or password."],
            },
        }
    }
    // Create a session for the user
    await createSession(user.id);

    // Redirect the user to the home page
    redirect("/");
}

export async function logout() {

    deleteSession();
    // Redirect the user to the home page
    redirect("/");
} 