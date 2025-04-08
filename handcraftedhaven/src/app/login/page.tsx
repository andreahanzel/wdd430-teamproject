import { Suspense } from "react";
import LoginForm from "@/components/ui/login-form";

export default function Login() {
	return (
		<main className="min-h-screen py-4 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
			<div className="max-w-md w-full">
				<Suspense fallback={<div className="text-center">Loading...</div>}>
					<LoginForm />
				</Suspense>
			</div>
		</main>
	);
}
