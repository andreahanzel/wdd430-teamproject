"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import sellerData from "@/lib/sellers.json";
import productData from "@/lib/mock-products.json";
import ProductCard from "@/components/ProductCard";
import SellerProfileCard from "@/components/SellerProfileCard";
import SellerReviews from "@/components/SellerReviews";

export default function SellerDetailPage() {

    const { id } = useParams();
    const sellerId = parseInt(id as string, 10);
    const seller = sellerData.find((s) => s.id === sellerId);

    const [isLoading, setIsLoading] = useState(true);

    const sellerProducts = productData.filter(
    (product) => product.sellerId === sellerId
    );

    useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
    }, []);

    if (!seller) return notFound();

    return (
    <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            {/* Back to Sellers Link */}
            <div className="mb-8">
                <Link 
                href="/sellers"
                className="inline-flex items-center text-darkPurple hover:text-neonPinkDark">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
                </svg>
                Back to all sellers
                </Link>
            </div>

            {/* Seller Profile Card */}
            <SellerProfileCard seller={{ 
                ...seller, 
                rating: parseFloat(seller.rating)
            }} />

            {/* Seller's Products */}
            <div>
                <h2 className="text-2xl font-bold text-darkPurple mb-8 text-center">
                Products by {seller.shopName}
                </h2>

                {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-neonPinkDark"></div>
                </div>
                ) : sellerProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-6">This seller hasn't listed any products yet.</p>
                </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {sellerProducts.map((product) => (
                        <ProductCard
                        key={product.id}
                        product={{
                            ...product,
                            price: typeof product.price === "number" ? product.price : 0,
                        }}
                        />
                ))}
                </div>
            )}
            </div>

            {/* Seller's Reviews */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold text-darkPurple mb-8 text-center">Customer Reviews</h2>
                <SellerReviews sellerId={seller.id} />
            </div>
        </div>
    </section>
    );
}
