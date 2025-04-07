import { createUser } from "../../../services/authServices";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, email, password } = body;

		if (!email || !password || !name) {
			return NextResponse.json(
				{
					error:
						"Missing required fields. Please provide name, email, and password.",
				},
				{ status: 400 }
			);
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Please provide a valid email address." },
				{ status: 400 }
			);
		}

		// Password strength check (very basic)
		if (password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters long." },
				{ status: 400 }
			);
		}

		const result = await createUser(name, email, password);

		if (result.error || !result.user) {
			return NextResponse.json({ error: result.error || "User data not found" }, { status: 400 });
		}

		return NextResponse.json(
			{
				success: true,
				message: "User registered successfully",
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
				error: "Registration failed. Please try again later.",
			},
			{ status: 500 }
		);
	}
}
