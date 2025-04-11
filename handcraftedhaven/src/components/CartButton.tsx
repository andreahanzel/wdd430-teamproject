"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function CartButton() {
	const { itemCount, isLoading } = useCart();
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient || !isAuthenticated || isLoading) {
		return (
			<div className="relative inline-flex items-center text-white p-2">
				<ShoppingBag className="h-6 w-6" />
			</div>
		);
	}

	return (
		<Link
			href="/cart"
			className="relative inline-flex items-center text-white p-2 hover:bg-white/10 rounded-full transition"
			aria-label="View your cart"
		>
			<ShoppingBag className="h-6 w-6" />
			<AnimatePresence>
				{itemCount > 0 && (
					<motion.span
					key="badge"
					initial={{ scale: 0.6, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.6, opacity: 0 }}
					style={{pointerEvents: "auto"}}
					className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border border-white"
					>
						{itemCount}
					</motion.span>
				)}
			</AnimatePresence>
			<span className="sr-only">View your cart</span>
		</Link>
	);
}
