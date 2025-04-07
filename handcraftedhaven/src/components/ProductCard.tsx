"use client";

import Link from "next/link";
import { Button } from "./ui/Button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "../contexts/NotificationContext";

interface ProductProps {
	product?: {
		id: number;
		name: string;
		description: string;
		price: number;
		image: string;
		category: string;
	};
}

export default function ProductCard({ product }: ProductProps) {
	const [isHovered, setIsHovered] = useState(false);
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";
	const { showNotification } = useNotification();

	if (!product) return null;

	const handleAuthenticationRequired = () => {
		showNotification(
			"Please sign in to view product details or add to cart",
			"info"
		);
	};

	return (
		<div
			className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Category badge */}
			<div className="absolute top-4 left-4 z-10">
				<span className="inline-block px-3 py-1 text-xs font-medium bg-neonPinkDark text-white rounded-full shadow-md">
					{product.category}
				</span>
			</div>

			{/* Image container with overlay */}
			<div className="relative h-64 overflow-hidden">
				<div
					className={`absolute inset-0 bg-gradient-to-t from-darkPurple/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}
				></div>

				<img
					src={product.image}
					alt={product.name}
					className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
				/>

				{/* Action button that appears on hover */}
				<div
					className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20`}
				>
					{isAuthenticated ? (
						<Link
							href={`/products/${product.id}`}
							className="transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300"
						>
							<Button variant="secondary" className="shadow-lg">
								Quick View
							</Button>
						</Link>
					) : (
						<Link
							href="/login"
							onClick={handleAuthenticationRequired}
							className="transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300"
						>
							<Button variant="secondary" className="shadow-lg">
								Sign in to View
							</Button>
						</Link>
					)}
				</div>
			</div>

			{/* Product info */}
			<div className="p-5">
				<div className="flex justify-between items-start mb-2">
					<h3 className="text-lg font-bold font-poppins text-darkPurple truncate group-hover:text-electricBlue transition-colors">
						{product.name}
					</h3>

					{/* Price with animated background on hover */}
					<div className="relative">
						<span className="text-lg font-bold text-darkPurple group-hover:text-white relative z-10 transition-colors duration-300">
							${Number(product.price).toFixed(2)}
						</span>
						<div className="absolute inset-0 bg-electricBlue scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 -z-0 rounded-full px-2"></div>
					</div>
				</div>

				{/* Description with truncate */}
				<p className="text-sm text-gray-600 mb-4 line-clamp-2">
					{product.description}
				</p>

				{/* Bottom action area */}
				<div className="pt-2 border-t border-gray-100">
					{isAuthenticated ? (
						<Link href={`/products/${product.id}`} className="block">
							<Button
								variant="product"
								className="w-full group-hover:bg-electricBlue group-hover:text-white transition-colors duration-300"
							>
								<span>View Product</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M14 5l7 7m0 0l-7 7m7-7H3"
									/>
								</svg>
							</Button>
						</Link>
					) : (
						<Link
							href="/login"
							onClick={handleAuthenticationRequired}
							className="block"
						>
							<Button
								variant="product"
								className="w-full group-hover:bg-electricBlue group-hover:text-white transition-colors duration-300"
							>
								<span>Sign in to View</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 ml-2"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
									/>
								</svg>
							</Button>
						</Link>
					)}
				</div>
			</div>

			{/* Decorative corner accent */}
			<div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-neonPink to-electricBlue opacity-30 rounded-tl-3xl"></div>
		</div>
	);
}
