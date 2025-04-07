"use client";

import reviewData from "@/lib/reviews.json";
import productData from "@/lib/mock-products.json";
import Link from "next/link";

interface Review {
    id: number;
    productId: number;
    userName: string;
    rating: number;
    comment: string;
    date: Date;
    }

interface ProductProps {
        id: number;
        name: string;
        description: string;
        price: number;
        image: string;
        category: string;
        sellerId: number;
    }
      
interface SellerReviewsProps {
    sellerId: number;
}

export default function SellerReviews({ sellerId }: SellerReviewsProps) {
    const products: ProductProps[] = productData as ProductProps[];
    // Load products for this seller
    const sellerProductsIds = products
    .filter((p) => p.sellerId === sellerId)
    .map((p) => p.id);

    // Convert dates and filter reviews related to seller's products
    const reviews: Review[] = reviewData.map((r) => ({
        ...r,
        date: new Date(r.date),
    }));

    const sellerReviews: Review[] = reviews.filter((r) =>
        sellerProductsIds.includes(r.productId)
    );

    // Calculate average rating for seller
    const averageRating = sellerReviews.length
        ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
        : 0;

    return (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md">

        {sellerReviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet for this seller.</p>
        ) : (
            <>
            <div className="space-y-6">
                {sellerReviews.map((review) => (
                    <div key={review.id}
                        className="border p-4 rounded-lg shadow-sm bg-gray-50">
                        <div className="flex items-center mb-1">
                            <span className="font-semibold text-darkPurple">
                                {review.userName}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-darkPurple">
                                {review.date.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                })}
                            </span>
                        </div>

                        <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                            <svg
                            key={i}
                            className={`w-4 h-4 ${
                                i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                        ))}
                        </div>

                        <p className="text-gray-700">{review.comment}</p>
                        <div>
                            <Link href={`/products/${review.productId}`} className="text-electricBlue hover:text-neonPink">
                                View product: {products.find((p) => p.id === review.productId)?.name}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            </>
        )}
        </div>
    );
    }
