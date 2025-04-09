"use client";

import Link from "next/link";
import { Button } from "./ui/Button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "../contexts/NotificationContext";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";

interface ProductProps {
	product?: {
		id: number;
		name: string;
		description: string;
		price: number;
		image: string;
		category: string;
		sellerId?: number;
	};
}

export default function ProductCard({ product }: ProductProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";
	const { showNotification } = useNotification();
	const { addToCart } = useCart();

	if (!product) return null;

	const handleAuthenticationRequired = () => {
		showNotification(
			"Please sign in to add items to your cart",
			"info"
		);
	};

	const handleAddToCart = async () => {
		if (!isAuthenticated) {
			handleAuthenticationRequired();
			return;
		}

		setIsAdding(true);
		try {
			await addToCart(product, 1);
		} catch (error) {
			console.error("Failed to add to cart:", error);
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<div
			className="group relative bg-white/20 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Category badge */}
			<div className="absolute top-4 left-4 z-10">
				<span className="inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r from-neonPink to-electricBlue text-white rounded-full shadow-md backdrop-blur-sm">
				{product.category}
				</span>
			</div>

			{/* Image container with overlay - fixed height to prevent layout shift */}
			<div className="relative h-64 overflow-hidden bg-gray-100">
				<div
					className={`absolute inset-0 bg-gradient-to-t from-darkPurple/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}
				></div>

				<img
					src={product.image}
					alt={product.name}
					className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
						imageLoaded ? "opacity-100" : "opacity-0"
					}`}
					onLoad={() => setImageLoaded(true)}
				/>

				{/* Placeholder while image loads */}
				{!imageLoaded && (
				<div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse"></div>
				)}

				{/* Action button that appears on hover */}
				<div
					className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20`}
				>
					<Link
						href={`/products/${product.id}`}
						className="transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300"
					>
						<Button variant="secondary" className="shadow-lg">
							Quick View
						</Button>
					</Link>
				</div>
			</div>

			{/* Product info - fixed height to prevent layout shift */}
			<div className="p-5 h-36 flex flex-col">
				<div className="flex justify-between items-start mb-2">
				<h3 className="text-lg font-bold font-poppins text-white truncate group-hover:text-neonPink transition-colors">
						{product.name}
					</h3>

					{/* Price with animated background on hover */}
					<div className="relative">
						<span className="text-lg font-bold text-darkPurple group-hover:text-white relative z-10 transition-colors duration-300">
							${Number(product.price).toFixed(2)}
						</span>
						<div className="absolute inset-0 bg-gradient-to-r from-electricBlue to-neonPink scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 -z-0 rounded-full px-2"></div>
					</div>

				</div>

				{/* Description with truncate */}
				<p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
					{product.description}
				</p>

				{/* Bottom action area */}
				<div className="pt-2 border-t border-gray-100 mt-auto flex justify-between">
					<Link href={`/products/${product.id}`} className="flex-1 mr-2">
						<Button
							variant="product"
							className="w-full group-hover:bg-electricBlue group-hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
							>
							<span>View</span>
						</Button>
					</Link>
					{isAuthenticated ? (
					<Button
						variant="primary"
						className="px-3 shadow-md hover:shadow-lg hover:scale-105 transition-transform"
						onClick={handleAddToCart}
						disabled={isAdding}
						aria-label="Add to cart"
					>
						<ShoppingBag size={18} />
					</Button> 
					) : (
						<Link href={`/login?callbackUrl=/products/${product.id}`}>
						<Button variant="primary" className="px-3">
							<span className="sr-only">Sign in to purchase</span>
							<ShoppingBag size={18} />
						</Button>
						</Link>


					)}
				</div>
			</div>

			{/* Decorative corner accent */}
			<div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-neonPink to-electricBlue opacity-40 rounded-tl-3xl shadow-md shadow-electricBlue/30"></div>
			</div>
	);
}