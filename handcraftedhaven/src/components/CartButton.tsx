"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function CartButton() {
	const { itemCount } = useCart();
	const [hasItems, setHasItems] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";

	// Set isClient to true after mount to avoid hydration issues
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Animate badge when itemCount changes
	useEffect(() => {
		if (isClient && itemCount > 0) {
			setHasItems(true);
		}
	}, [itemCount, isClient]);

	// Only render on client and for authenticated users
	if (!isClient || !isAuthenticated) {
		return null;
	}

	return (
		<Link
			href="/cart"
			className="relative inline-flex items-center text-white p-2 hover:bg-white/10 rounded-full transition-colors"
		>
			<ShoppingCart className="h-6 w-6" />
			<AnimatePresence>
				{itemCount > 0 && (
					<motion.span
						key="badge"
						initial={{ scale: 0.6, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.6, opacity: 0 }}
						className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
					>
						{itemCount}
					</motion.span>
				)}
			</AnimatePresence>
			<span className="sr-only">View your cart</span>
		</Link>
	);
}
