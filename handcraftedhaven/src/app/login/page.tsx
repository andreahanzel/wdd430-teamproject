'use client'


import { Suspense } from "react";
import LoginForm from "@/components/ui/login-form";
import { LogIn } from "lucide-react";

export default function Login() {
	return (
		<main id="main-content" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-6">
			<div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 p-8 sm:p-10 text-center">
				
				<div className="mb-6">
					<div className="w-16 h-16 mx-auto flex items-center justify-center bg-indigo-600/50 rounded-full shadow-md">
						<LogIn className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-white mt-4">Welcome Back</h1>
					<p className="text-pink-100 mt-1">Log in to your account</p>
				</div>

				<Suspense fallback={<div className="text-white">Loading login form...</div>}>
					<LoginForm />
				</Suspense>

				<p className="text-sm text-pink-100 mt-6">
					Don't have an account?{" "}
					<a href="/register" className="text-pink-300 hover:text-white font-semibold transition duration-300">
						Sign up
					</a>
				</p>
			</div>
		</main>
	);
}
