'use client'

import { Suspense } from "react";
import LoginForm from "@/components/ui/login-form";
import { LogIn } from "lucide-react";

export default function Login() {
	return (
		<section id="main-content" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-6">
		<div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 p-8 sm:p-10 text-white"> {/* Changed to text-white */}
			
			<div className="mb-6">
			<div className="w-16 h-16 mx-auto flex items-center justify-center bg-indigo-600/50 rounded-full shadow-md">
				<LogIn className="w-8 h-8 text-white" />
			</div>
			<h1 className="text-3xl font-bold text-white mt-4">Welcome Back</h1>
			<p className="text-pink-200 text-sm mt-1">Log in to your account</p> {/* Changed to text-pink-200 and added text-sm */}
			</div>

			<Suspense fallback={<div className="text-white">Loading login form...</div>}>
			<LoginForm />
			</Suspense>

			<p className="text-sm text-pink-200 mt-6"> {/* Changed to text-pink-200 */}
			Don't have an account?{" "}
			<a href="/register" className="text-pink-300 hover:text-white font-semibold transition duration-300">
				Sign up
			</a>
			</p>
		</div>
	</section>
	);
}