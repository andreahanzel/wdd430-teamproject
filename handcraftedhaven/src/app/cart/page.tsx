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
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electricBlue"></div>
			</div>
		);
	}

	if (status === "unauthenticated") {
		return (
			<div className="flex flex-col items-center justify-center py-20 px-4">
				<div className="bg-gray-50 rounded-full p-6 mb-6">
					<ShoppingBag size={64} className="text-gray-300" />
				</div>
				<h2 className="text-2xl font-bold text-darkPurple mb-2">
					Authentication Required
				</h2>
				<p className="text-gray-500 mb-8 text-center max-w-md">
					Please sign in to view your shopping cart and make purchases
				</p>
				<div className="flex flex-col space-y-4 w-full max-w-xs">
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
		);
	}

	return <div id="main-content"><Cart /></div>;
}
