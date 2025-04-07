"use client";

import { useEffect, useState } from "react";
import SellerCard from "@/components/SellerCard";
import { getSellers } from "@/services/sellerServices";
import { Seller } from "@/types/database";

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
		<section className="py-16 bg-gradient-to-b from-white to-gray-50">
			<div className="container mx-auto px-4">
				{/* Heading */}
				<div className="text-center mb-16">
					<h1 className="text-4xl font-bold font-poppins text-darkPurple mb-2 relative inline-block">
						Meet Our Artisans
						<span className="absolute left-0 w-full h-1 bg-gradient-to-r from-electricBlue to-neonPink bottom-[-8px]"></span>
					</h1>
					<p className="text-gray-600 mt-3 max-w-2xl mx-auto">
						Discover unique shops and creators from around the world.
					</p>
				</div>

				{/* Loading State */}
				{isLoading ? (
					<div className="flex justify-center items-center py-20">
						<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-electricBlue"></div>
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
						{sellers.map((seller) => (
							<SellerCard key={seller.id} seller={seller} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
