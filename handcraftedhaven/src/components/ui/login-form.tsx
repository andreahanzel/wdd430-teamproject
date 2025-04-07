"use client";

import { Button } from "./Button";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, FormEvent, useEffect } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { Mail, Lock } from "lucide-react";

export default function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";
	const registered = searchParams.get("registered");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { showNotification } = useNotification();

	// Show success message if redirected from registration
	useEffect(() => {
		if (registered === "true") {
			showNotification(
				"Registration successful! Please log in with your new account.",
				"success"
			);
		}
	}, [registered, showNotification]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(event.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const result = await signIn("credentials", {
				redirect: false,
				email,
				password,
			});

			if (result?.error) {
				setError("Invalid email or password");
				showNotification("Invalid email or password", "error");
				setIsLoading(false);
				return;
			}

			showNotification("Login successful!", "success");
			router.push(callbackUrl);
			router.refresh();
		} catch (error) {
			setError("An error occurred. Please try again.");
			showNotification("An error occurred. Please try again.", "error");
			setIsLoading(false);
		}
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-white rounded-xl shadow-lg overflow-hidden">
				<div className="bg-backgroundDark p-6 text-center">
					<h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
					<p className="text-gray-300 text-sm">Sign in to your account</p>
				</div>

				<form onSubmit={handleSubmit} className="p-8 space-y-6">
					{error && (
						<div
							className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
							role="alert"
						>
							<p className="font-medium">Login Error</p>
							<p>{error}</p>
						</div>
					)}

					<div className="space-y-5">
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
						</div>

						<div className="flex justify-end">
							<Link
								href="#"
								className="text-sm text-backgroundDark hover:text-backgroundDark/80"
							>
								Forgot password?
							</Link>
						</div>
					</div>

					<div>
						<Button
							variant="login"
							disabled={isLoading}
							className="w-full py-3 flex justify-center"
						>
							{isLoading ? "Signing in..." : "Sign In"}
						</Button>
					</div>

					<div className="relative flex py-3 items-center">
						<div className="flex-grow border-t border-gray-200"></div>
						<span className="flex-shrink mx-3 text-gray-400 text-sm">or</span>
						<div className="flex-grow border-t border-gray-200"></div>
					</div>

					<div className="text-center">
						<p className="text-gray-600 mb-4">Don't have an account?</p>
						<Link href="/register" className="w-full inline-block">
							<Button variant="register" className="w-full">
								Create Account
							</Button>
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
