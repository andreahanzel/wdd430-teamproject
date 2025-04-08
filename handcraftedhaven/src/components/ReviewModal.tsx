"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { useSession } from "next-auth/react";
import { useNotification } from "../contexts/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (rating: number, comment: string) => Promise<void>;
	type: "product" | "seller";
	name: string;
}

export default function ReviewModal({
	isOpen,
	onClose,
	onSubmit,
	type,
	name,
}: ReviewModalProps) {
	const [rating, setRating] = useState<number>(0);
	const [comment, setComment] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const { showNotification } = useNotification();
	const { data: session } = useSession();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!session?.user) {
			showNotification("You must be signed in to leave a review", "error");
			return;
		}

		if (rating === 0) {
			showNotification("Please select a rating", "error");
			return;
		}

		if (!comment.trim()) {
			showNotification("Please write a comment", "error");
			return;
		}

		setIsSubmitting(true);

		try {
			await onSubmit(rating, comment);
			showNotification("Review submitted successfully!", "success");
			setRating(0);
			setComment("");
			onClose();
		} catch (error) {
			showNotification("Failed to submit review. Please try again.", "error");
			console.error("Review submission error:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 z-40"
						onClick={onClose}
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: "spring", damping: 15 }}
						className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 z-50 w-full max-w-md"
					>
						{/* Header */}
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-bold text-darkPurple">
								{type === "product"
									? `Review ${name}`
									: `Review Artisan: ${name}`}
							</h2>
							<button
								onClick={onClose}
								className="text-gray-400 hover:text-gray-600 focus:outline-none"
								aria-label="Close"
							>
								<X size={20} />
							</button>
						</div>

						<form onSubmit={handleSubmit}>
							{/* Rating selector */}
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Your Rating
								</label>
								<div className="flex gap-1">
									{[1, 2, 3, 4, 5].map((star) => (
										<button
											key={star}
											type="button"
											onClick={() => setRating(star)}
											className="focus:outline-none"
											aria-label={`Rate ${star} stars`}
										>
											<svg
												className={`w-8 h-8 ${
													star <= rating ? "text-yellow-400" : "text-gray-300"
												} hover:text-yellow-400 transition-colors`}
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										</button>
									))}
								</div>
							</div>

							{/* Comment textarea */}
							<div className="mb-6">
								<label
									htmlFor="review-comment"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Your Review
								</label>
								<textarea
									id="review-comment"
									rows={4}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-electricBlue focus:border-electricBlue transition-colors text-gray-800"
									placeholder="Share your experience..."
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									required
								></textarea>
							</div>

							{/* Submit button */}
							<div className="flex justify-end">
								<Button
									type="button"
									variant="secondary"
									onClick={onClose}
									className="mr-2"
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button type="submit" variant="primary" disabled={isSubmitting}>
									{isSubmitting ? "Submitting..." : "Submit Review"}
								</Button>
							</div>
						</form>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
