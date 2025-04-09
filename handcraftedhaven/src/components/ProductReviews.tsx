"use client";

import { useState, useEffect } from "react";
import {
	getProductReviews,
	createProductReview,
} from "@/services/reviewServices";
import { Review } from "@/types/database";
import { Button } from "./ui/Button";
import { useSession } from "next-auth/react";
import ReviewModal from "./ReviewModal";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useNotification } from "../contexts/NotificationContext";

interface ProductReviewsProps {
	productId: number;
	productName: string;
}

export default function ProductReviews({
	productId,
	productName,
}: ProductReviewsProps) {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { data: session } = useSession();
	const { showNotification } = useNotification();
	const isAuthenticated = !!session?.user;

	useEffect(() => {
		async function loadReviews() {
			try {
				const reviewData = await getProductReviews(productId);
				setReviews(reviewData);
			} catch (error) {
				console.error("Error loading reviews:", error);
			} finally {
				setLoading(false);
			}
		}

		loadReviews();
	}, [productId]);

	const handleSubmitReview = async (rating: number, comment: string) => {
		try {
			const newReview = await createProductReview(productId, rating, comment);

			// Add user info from session to the review for display
			const reviewWithUser = {
				...newReview,
				user: {
					name: session?.user?.name || "Anonymous",
					image: session?.user?.image || null,
				},
			};

			setReviews([reviewWithUser, ...reviews]);
		} catch (error) {
			showNotification(
				error instanceof Error ? error.message : "Failed to submit review",
				"error"
			);
			throw error;
		}
	};

	// Calculate average rating
	const averageRating = reviews.length
		? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
		: 0;

	return (
		<div className="mt-20 bg-gradient-to-br from-backgroundDark via-darkPurple to-black/30 border border-white/10 shadow-lg shadow-neonPink/20 rounded-xl p-6 text-white">
			<div className="flex justify-between items-center mb-6">
			<h2 className="text-2xl font-bold text-white">Customer Reviews</h2>

				{isAuthenticated ? (
					<Button variant="primary" onClick={() => setIsModalOpen(true)}>
						Write a Review
					</Button>
				) : (
					<Link href={`/login?callbackUrl=/products/${productId}`}>
						<Button variant="secondary">Sign in to Review</Button>
					</Link>
				)}
			</div>

			{/* Average rating display */}
			<div className="flex items-center mb-6">
				<div className="flex mr-2">
					{[...Array(5)].map((_, i) => (
						<svg
							key={i}
							className={`w-5 h-5 ${
								i < Math.round(averageRating)
									? "text-yellow-400"
									: "text-gray-300"
							}`}
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
						</svg>
					))}
				</div>
				<p className="text-sm text-white/70">
					{averageRating.toFixed(1)} ({reviews.length}{" "}
					{reviews.length === 1 ? "review" : "reviews"})
				</p>
			</div>

			{loading ? (
				<div className="flex justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electricBlue"></div>
				</div>
			) : reviews.length === 0 ? (
				<p className="text-gray-500 py-8 text-center">
					No reviews yet for this product.
				</p>
			) : (
				<div className="space-y-6">
					{reviews.map((review) => (
						<div
							key={review.id}
							className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10 shadow-inner"
						>
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center">
									<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 overflow-hidden">
										{review.user?.image ? (
											<img
												src={review.user.image}
												alt={review.userName}
												className="w-full h-full object-cover"
											/>
										) : (
											<span className="text-sm font-medium text-gray-600">
												{review.userName.charAt(0).toUpperCase()}
											</span>
										)}
									</div>
									<span className="font-semibold text-white">
										{review.userName}
									</span>
								</div>
								<span className="text-xs text-white">
									{formatDistanceToNow(new Date(review.date), {
										addSuffix: true,
									})}
								</span>
							</div>

							{/* Rating display */}
							<div className="flex items-center mb-2">
								{[...Array(5)].map((_, i) => (
									<svg
										key={i}
										className={`w-4 h-4 ${
											i < review.rating ? "text-yellow-400" : "text-gray-300"
										}`}
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								))}
							</div>

							{/* Review comment */}
							<p className="text-white/80">{review.comment}</p>
						</div>
					))}
				</div>
			)}

			{/* Review modal */}
			<ReviewModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleSubmitReview}
				type="product"
				name={productName}
			/>
		</div>
	);
}
