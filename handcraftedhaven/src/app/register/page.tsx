'use client'

import RegisterForm from "@/components/ui/register-form";
import { UserPlus } from "lucide-react";

export default function Register() {
	return (
		<section id="main-content" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-6">
			<div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 p-8 sm:p-10 text-white">
				<div className="mb-6 text-center">
					<div className="w-16 h-16 mx-auto flex items-center justify-center bg-pink-600/50 rounded-full shadow-md">
						<UserPlus className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold mt-4">Join Handcrafted Haven</h1>
					<p className="text-pink-100 text-sm mt-1">Create an account to start crafting your journey</p>
				</div>
				<RegisterForm />
			</div>
		</section>
	);
}
