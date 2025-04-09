"use client";

import { Button } from "./Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import { User, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";


export default function RegisterForm() {
	const router = useRouter();
	const { showNotification } = useNotification();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

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
				// Format and handle specific error messages
				let errorMessage = data.error || "Registration failed";

				// Check for specific error messages
				if (errorMessage.includes("already exists")) {
					throw new Error(
						`An account with this email already exists. Please sign in instead.`
					);
				}

				throw new Error(errorMessage);
			}

			// Success
			showNotification(
				"Registration successful! Please log in with your new account.",
				"success"
			);
			router.push("/login?registered=true");
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
				showNotification(error.message, "error");

				// Set loading to false only if we're not redirecting
				setIsLoading(false);
			} else {
				setError("An unexpected error occurred during registration");
				showNotification(
					"An unexpected error occurred during registration",
					"error"
				);
				setIsLoading(false);
			}
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6 text-white">
			{error && (
				<div className="bg-pink-600/40 border border-pink-300 text-white p-4 rounded-lg flex items-start space-x-2">
					<AlertCircle className="h-5 w-5 mt-0.5" />
					<div>
						<p className="font-medium">Registration Error</p>
						<p>{error}</p>
						{error.includes("already exists") && (
							<p className="mt-1 text-sm">
								Already have an account?{" "}
								<Link href="/login" className="text-white underline hover:text-pink-200">
									Sign in
								</Link>
							</p>
						)}
					</div>
				</div>
			)}

			<div className="space-y-5">
				<div>
					<label htmlFor="name" className="block text-sm font-medium text-pink-200 mb-1">
						Full Name
					</label>
					<div className="relative">
						<User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-300" />
						<input
							id="name"
							name="name"
							type="text"
							required
							placeholder="John Doe"
							className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
						/>
					</div>
				</div>

				<div>
					<label htmlFor="email" className="block text-sm font-medium text-pink-200 mb-1">
						Email Address
					</label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-300" />
						<input
							id="email"
							name="email"
							type="email"
							required
							placeholder="you@example.com"
							className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
						/>
					</div>
				</div>

				<div>
					<label htmlFor="password" className="block text-sm font-medium text-pink-200 mb-1">
						Password
					</label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-300" />
						<input
							id="password"
							name="password"
							type={showPassword ? "text" : "password"} // dynamic type added
							required
							placeholder="••••••••"
							minLength={6}
							className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-300 hover:text-pink-200 transition"
							aria-label={showPassword ? "Hide password" : "Show password"}
							title={showPassword ? "Hide password" : "Show password"} 
						>
							{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
					<p className="mt-1 text-xs text-pink-100">Password must be at least 6 characters</p>
				</div>
			</div>

			<Button
				variant="primary"
				disabled={isLoading}
				className="w-full bg-pink-600 hover:bg-pink-500 text-white py-2.5 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
			>
				{isLoading ? "Creating Account..." : "Create Account"}
			</Button>

			<div className="relative flex py-3 items-center">
				<div className="flex-grow border-t border-white/20"></div>
				<span className="mx-3 text-white/60 text-sm">or</span>
				<div className="flex-grow border-t border-white/20"></div>
			</div>

			<div className="text-center">
				<p className="text-pink-100 mb-4 text-sm">Already have an account?</p>
				<Link href="/login" className="w-full inline-block">
					<Button
						variant="primary"
						className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
					>
						Sign In
					</Button>
				</Link>
			</div>
		</form>
	);
}