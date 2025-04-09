"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { getSellerById } from "@/services/sellerServices";
import { Seller } from "@/types/database";
import ProductCard from "@/components/ProductCard";
import SellerReviews from "@/components/SellerReviews";

export default function SellerDetailPage() {
	const params = useParams();
	const sellerId = parseInt(params.id as string);

	const [seller, setSeller] = useState<Seller | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadSeller() {
			try {
				const sellerData = await getSellerById(sellerId);
				setSeller(sellerData);
			} catch (error) {
				console.error("Failed to load seller:", error);
			} finally {
				setLoading(false);
			}
		}

		if (!isNaN(sellerId)) {
			loadSeller();
		}
	}, [sellerId]);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electricBlue"></div>
			</div>
		);
	}

	if (!seller) return notFound();

	return (
		<section id="main-content" className="py-12 bg-gradient-to-b from-white to-gray-50">
			<div className="container mx-auto px-4">
				{/* Back Link */}
				<Link
					href="/sellers"
					className="inline-flex items-center text-electricBlue hover:text-neonPink mb-8"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-5 h-5 mr-2"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
						/>
					</svg>
					Back to all artisans
				</Link>

				{/* Seller Profile Header */}
				<div className="bg-white shadow-md rounded-xl overflow-hidden mb-12">
					<div className="relative h-64 md:h-80">
						<img
							src={seller.profileImage}
							alt={seller.name}
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

						<div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
							<div className="inline-flex items-center bg-yellow-400/90 text-yellow-900 rounded-full px-3 py-1 text-sm font-medium mb-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 mr-1"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
								{seller.rating} Rating
							</div>
							<h1 className="text-3xl md:text-5xl font-bold mb-2">
								{seller.name}
							</h1>
							<h2 className="text-xl md:text-2xl font-medium text-gray-100 mb-2">
								{seller.shopName}
							</h2>
							<div className="flex flex-wrap items-center gap-4 mt-3">
								<div className="flex items-center text-gray-200">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 mr-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									{seller.location}
								</div>
								<div className="flex items-center text-gray-200">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 mr-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
										/>
									</svg>
									{seller.sales} Sales
								</div>
							</div>
						</div>
					</div>

					{/* Seller Details */}
					<div className="p-6 md:p-8">
						<div className="mb-8">
							<h3 className="text-xl font-semibold text-darkPurple mb-3">
								About the Artisan
							</h3>
							<p className="text-gray-700">{seller.bio}</p>
						</div>

						<div className="mb-8">
							<h3 className="text-xl font-semibold text-darkPurple mb-3">
								Artisan's Story
							</h3>
							<p className="text-gray-700 whitespace-pre-line">
								{seller.story}
							</p>
						</div>

						<div>
							<h3 className="text-xl font-semibold text-darkPurple mb-3">
								Contact
							</h3>
							<p className="text-gray-700">{seller.contact}</p>
						</div>
					</div>
				</div>

				{/* Seller Reviews */}
				<div className="mb-16">
					<SellerReviews sellerId={seller.id} sellerName={seller.name} />
				</div>

				{/* Products by this seller - moved below reviews with more spacing */}
				<div className="mt-16 pt-8 border-t border-gray-200">
					<h2 className="text-2xl font-bold text-center text-darkPurple mb-8">
						Handcrafted by {seller.name}
					</h2>

					{seller.products && seller.products.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
							{seller.products.map((product) => (
								<div key={product.id}>
									<ProductCard product={product} />
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12 bg-white rounded-lg shadow">
							<p className="text-lg text-gray-600">
								No products available from this artisan yet.
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
