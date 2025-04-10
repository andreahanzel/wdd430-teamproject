"use client";

import Cart from "@/components/Cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, LogIn } from "lucide-react";

export default function CartPage() {
	const { status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login?callbackUrl=/cart");
		}
	}, [status, router]);

	if (status === "loading") {
		return (
			<main
				id="main-content"
				className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex justify-center items-center"
			>
				<div className="w-12 h-12 border-t-4 border-white rounded-full animate-spin"></div>
			</main>
		);
	}

	if (status === "unauthenticated") {
		return (
			<main
				id="main-content"
				className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center px-4"
			>
				<div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/10 shadow-2xl rounded-xl p-10 text-center">
					<div className="flex justify-center mb-6">
						<ShoppingBag size={64} className="text-pink-300" />
					</div>
					<h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
					<p className="text-pink-100 mb-8">
						Please sign in to view your shopping cart and make purchases.
					</p>
					<div className="flex flex-col space-y-4 w-full">
						<Link href="/login?callbackUrl=/cart" className="w-full">
							<Button
								variant="login"
								className="w-full flex items-center justify-center gap-2"
							>
								<LogIn size={18} />
								Sign In
							</Button>
						</Link>
						<Link href="/register" className="w-full">
							<Button variant="register" className="w-full">
								Create Account
							</Button>
						</Link>
					</div>
				</div>
			</main>
		);
	}

	// Authenticated state
	return (
		<main
			id="main-content"
			className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 py-10 px-4"
		>
			<div className="max-w-6xl mx-auto">
				<Cart />
			</div>
		</main>
	);
}