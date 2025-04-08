"use client";

import Link from "next/link";
import { Button } from "./ui/Button";
import { Seller } from "@/types/database";
import { useState } from "react";

interface SellerCardProps {
	seller: Seller;
}

export default function SellerCard({ seller }: SellerCardProps) {
	const [imageLoaded, setImageLoaded] = useState(false);

	return (
		<div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-[350px] flex flex-col">
			<div className="relative h-52 overflow-hidden bg-gray-100">
				{/* Profile image */}
				<img
					src={seller.profileImage}
					alt={seller.name}
					className={`w-full h-full object-cover transition-opacity duration-300 ${
						imageLoaded ? 'opacity-100' : 'opacity-0'
					}`}
					onLoad={() => setImageLoaded(true)}
				/>
				
				{/* Image placeholder */}
				{!imageLoaded && (
					<div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
				)}

				{/* Overlay gradient */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
					<div className="absolute bottom-0 left-0 p-4 text-white">
						<h3 className="font-bold text-lg">{seller.name}</h3>
						<p className="text-sm opacity-90">{seller.location}</p>
					</div>
				</div>
			</div>

			<div className="p-4 flex-1 flex flex-col">
				{/* Shop name and ratings */}
				<div className="flex justify-between items-center mb-3">
					<h4 className="font-bold text-darkPurple">{seller.shopName}</h4>
					<div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4 text-yellow-500 mr-1"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
						</svg>
						<span className="text-xs font-medium text-yellow-800">
							{seller.rating}
						</span>
					</div>
				</div>

				{/* Short bio */}
				<p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{seller.bio}</p>

				{/* Sales count and view button */}
				<div className="flex justify-between items-center mt-auto">
					<div className="text-xs text-gray-500">
						<span className="font-medium">{seller.sales}</span> sales
					</div>

					<Link href={`/sellers/${seller.id}`}>
						<Button variant="seller" size="sm">
							View Shop
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
