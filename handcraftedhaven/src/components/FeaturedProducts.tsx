"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { getFeaturedProducts } from "@/services/productServices";

export default function FeaturedProducts() {
	const [isVisible, setIsVisible] = useState(false);
	const [featured, setFeatured] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadFeaturedProducts() {
			try {
				const featuredProducts = await getFeaturedProducts(3);
				setFeatured(featuredProducts);
			} catch (error) {
				console.error("Failed to load featured products:", error);
			} finally {
				setLoading(false);
			}
		}

		loadFeaturedProducts();

		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 300);

		return () => clearTimeout(timer);
	}, []);

	if (loading) {
		return (
			<section className="py-20 bg-gray-50 relative overflow-hidden">
				<div className="container mx-auto px-4 relative flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electricBlue"></div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-20 bg-gray-50 relative overflow-hidden">
			{/* Decorative background elements */}
			<div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-electricBlue/10 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2"></div>
			<div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-neonPink/10 to-transparent rounded-full translate-x-1/3 translate-y-1/3"></div>

			<div className="container mx-auto px-4 relative">
				<div className="max-w-xl mx-auto text-center mb-16">
					<span className="inline-block text-neonPink font-medium text-sm uppercase tracking-wider mb-2">
						Handpicked For You
					</span>
					<h2 className="text-4xl font-poppins font-bold text-darkPurple mb-4">
						Featured Artisan Creations
					</h2>
					<p className="text-gray-600">
						Discover our collection of unique, handcrafted treasures created
						with passion and skill by talented artisans.
					</p>
				</div>

				<div
					className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 ${
						isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
					}`}
				>
					{featured.map((product, index) => (
						<div
							key={product.id}
							className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
						>
							{/* Product image with overlay */}
							<div className="relative h-56 overflow-hidden">
								<div className="absolute inset-0 bg-gradient-to-t from-darkPurple/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

								<img
									src={product.image}
									alt={product.name}
									className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
								/>

								{/* Category badge */}
								<div className="absolute top-3 left-3 z-20">
									<span className="inline-block px-3 py-1 text-xs font-medium bg-neonPink text-white rounded-full shadow-md">
										{product.category}
									</span>
								</div>

								{/* Quick view button */}
								<div className="absolute inset-x-0 bottom-0 flex justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 transform translate-y-4 group-hover:translate-y-0">
									<Link href={`/products/${product.id}`}>
										<Button variant="secondary" className="shadow-md">
											View Details
										</Button>
									</Link>
								</div>
							</div>

							{/* Product info */}
							<div className="p-5">
								<h3 className="text-lg font-bold font-poppins text-darkPurple group-hover:text-electricBlue transition-colors">
									{product.name}
								</h3>

								<div className="flex justify-between items-center mt-2">
									<span className="text-lg font-bold text-neonPink">
										$
										{typeof product.price === "number"
											? product.price.toFixed(2)
											: "0.00"}
									</span>

									<div className="flex">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className={`w-4 h-4 ${
													i < 4 ? "text-yellow-400" : "text-gray-300"
												}`}
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="text-center mt-12">
					<Link href="/products">
						<Button variant="primary" className="px-8">
							Explore All Products
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
