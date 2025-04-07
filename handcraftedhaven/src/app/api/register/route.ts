import { createUser } from "../../../services/authServices";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, email, password } = body;

		if (!email || !password || !name) {
			return NextResponse.json(
				{
					error: "Please provide your name, email, and password to register.",
				},
				{ status: 400 }
			);
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{
					error:
						"Please enter a valid email address (e.g., example@domain.com).",
				},
				{ status: 400 }
			);
		}

		// Password strength check
		if (password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters long." },
				{ status: 400 }
			);
		}

		const result = await createUser(name, email, password);

		if (result.error || !result.user) {
			return NextResponse.json(
				{ error: result.error || "User account could not be created." },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Your account has been created successfully!",
				user: {
					id: result.user.id,
					name: result.user.name,
					email: result.user.email,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Registration error:", error);
		return NextResponse.json(
			{
				error:
					"We couldn't process your registration at this time. Please try again later.",
			},
			{ status: 500 }
		);
	}
}
