"use client";

import { Button } from "./Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { User, Mail, Lock } from "lucide-react";

export default function RegisterForm() {
	const router = useRouter();
	const { showNotification } = useNotification();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(event.currentTarget);
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const response = await fetch("/api/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name, email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Registration failed");
			}

			// Instead of auto-login, redirect to login page with success message
			showNotification("Registration successful! Please log in.", "success");
			router.push("/login?registered=true");
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
				showNotification(error.message, "error");
			} else {
				setError("An unexpected error occurred");
				showNotification("An unexpected error occurred", "error");
			}
			setIsLoading(false);
		}
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-white rounded-xl shadow-lg overflow-hidden">
				<div className="bg-backgroundDark p-6 text-center">
					<h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
					<p className="text-gray-300 text-sm">Join Handcrafted Haven today</p>
				</div>

				<form onSubmit={handleSubmit} className="p-8 space-y-6">
					{error && (
						<div
							className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
							role="alert"
						>
							<p className="font-medium">Registration Error</p>
							<p>{error}</p>
						</div>
					)}

					<div className="space-y-5">
						<div className="relative">
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Full Name
							</label>
							<div className="relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<User className="h-5 w-5 text-gray-400" />
								</div>
								<input
									className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-backgroundDark focus:border-backgroundDark transition duration-150"
									id="name"
									type="text"
									name="name"
									placeholder="John Doe"
									required
								/>
							</div>
						</div>

						<div className="relative">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email Address
							</label>
							<div className="relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Mail className="h-5 w-5 text-gray-400" />
								</div>
								<input
									className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-backgroundDark focus:border-backgroundDark transition duration-150"
									id="email"
									type="email"
									name="email"
									placeholder="you@example.com"
									required
								/>
							</div>
						</div>

						<div className="relative">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Password
							</label>
							<div className="relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-backgroundDark focus:border-backgroundDark transition duration-150"
									id="password"
									type="password"
									name="password"
									placeholder="••••••••"
									minLength={6}
									required
								/>
							</div>
							<p className="mt-1 text-xs text-gray-500">
								Password must be at least 6 characters
							</p>
						</div>
					</div>

					<div>
						<Button
							variant="register"
							disabled={isLoading}
							className="w-full py-3 flex justify-center"
						>
							{isLoading ? "Creating Account..." : "Create Account"}
						</Button>
					</div>

					<div className="relative flex py-3 items-center">
						<div className="flex-grow border-t border-gray-200"></div>
						<span className="flex-shrink mx-3 text-gray-400 text-sm">or</span>
						<div className="flex-grow border-t border-gray-200"></div>
					</div>

					<div className="text-center">
						<p className="text-gray-600 mb-4">Already have an account?</p>
						<Link href="/login" className="w-full inline-block">
							<Button variant="login" className="w-full">
								Sign In
							</Button>
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
