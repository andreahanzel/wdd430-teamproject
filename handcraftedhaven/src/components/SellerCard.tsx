"use client";

import Link from "next/link";
import { Button } from "./ui/Button";

interface SellerProps {
  seller?: {
    id: number;
    name: string;
    shopName: string;
    profileImage: string;
    location: string;
    rating: string;
    sales: string;
    bio: string;
  };
}

export default function SellerCard({ seller }: SellerProps) {
  if (!seller) return null;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      {/* Avatar and info */}
      <div className="flex items-center p-5 space-x-4">
        <img
          src={seller.profileImage}
          alt={seller.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-neonPinkDark"
        />
        <div>
          <h3 className="text-lg font-bold font-poppins text-darkPurple group-hover:text-neonPinkDark transition-colors">
            {seller.name}
          </h3>
          <p className="text-sm text-gray-800">{seller.shopName}</p>
          <p className="text-xs text-gray-800">{seller.location}</p>
        </div>
      </div>

      {/* Seller bio and stats */}
      <div className="px-5 pb-5">
        <p className="text-sm text-gray-900 mb-3 line-clamp-3">{seller.bio}</p>

        <div className="flex justify-between text-xs text-gray-800 mb-4">
          <span>⭐ {seller.rating}</span>
          <span>{seller.sales} sales</span>
        </div>

        {/* View shop button */}
        <Link href={`/sellers/${seller.id}`}>
          <Button
            variant="seller"
            className="w-full group-hover:bg-neonPinkDark group-hover:text-white transition-colors duration-300"
          >
            <span>Visit Shop</span>
          </Button>
        </Link>
      </div>

      {/* Decorative accent */}
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-neonPinkDark to-electricBlue opacity-40 rounded-tl-3xl"></div>
    </div>
  );
}
