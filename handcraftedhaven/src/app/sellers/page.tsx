"use client";

import { useEffect, useState } from "react";
import sellerData from "@/lib/sellers.json";
import SellerCard from "@/components/SellerCard";

export default function SellersPage() {
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
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
                Discover unique shops and creators from around the world.</p>
            </div>

            {/* Loading State */}
            {isLoading ? (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-electricBlue"></div>
            </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {sellerData.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
                ))}
            </div>
            )}
        </div>
    </section>
    );
}
