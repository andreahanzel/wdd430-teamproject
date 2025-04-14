"use client";

import { useEffect, useState } from "react";
import SellerCard from "@/components/SellerCard";
import { getSellers } from "@/services/sellerServices";
import { Seller } from "@/types/database";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SellersPage() {
	const [sellers, setSellers] = useState<Seller[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadSellers() {
			try {
				const fetchedSellers = await getSellers();
				setSellers(fetchedSellers);
			} catch (error) {
				console.error("Failed to load sellers:", error);
			} finally {
				setIsLoading(false);
			}
		}

		loadSellers();
	}, []);

	return (
			<section id="main-content" className="py-16 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 min-h-screen text-white">
			<div className="container mx-auto px-4">
				{/* Heading */}
				<div className="text-center mb-16">
				<h1 className="text-4xl font-bold font-poppins text-white mb-2 relative inline-block">
				Meet Our Artisans
						<span className="absolute left-0 w-full h-1 bg-gradient-to-r from-electricBlue to-neonPink bottom-[-8px]"></span>
					</h1>
					<p className="text-pink-100 mt-3 max-w-2xl mx-auto">
						Discover unique shops and creators from around the world.
					</p>
				</div>

				{/* Loading State with Skeletons */}
				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
						{[...Array(8)].map((_, index) => (
							<div
								key={index}
								className="bg-white rounded-xl shadow-md overflow-hidden h-[350px]"
							>
								{/* Image placeholder */}
								<Skeleton className="w-full h-52" />

								{/* Content placeholders */}
								<div className="p-4">
									<div className="flex justify-between items-center mb-3">
										<Skeleton className="h-5 w-2/3" />
										<Skeleton className="h-5 w-12" />
									</div>
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-5/6 mt-2" />
									<div className="flex justify-between items-center mt-6">
										<Skeleton className="h-4 w-16" />
										<Skeleton className="h-8 w-24" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : sellers.length === 0 ? (
					<div className="text-center py-16 bg-white rounded-xl shadow">
						<p className="text-xl font-semibold text-gray-700 mb-2">
							No artisans found
						</p>
						<p className="text-gray-500">
							Please check back later for our artisan listings.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
						{sellers.map((seller, index) => (
							<SellerCard key={seller.id} seller={seller} isFirst={index === 0} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
