import { useState } from "react";

export default function CreateReview() {
	const [review, setReview] = useState("");
	const [rating, setRating] = useState(0);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess(false);

		if (review.trim() === "") {
			setError("Please enter a review.");
			setLoading(false);
			return;
		}
		if (rating === 0) {
			setError("Please select a rating.");
			setLoading(false);
			return;
		}
		try {
			// Simulate an API call to submit the review
			// Replace this with database logic
			await new Promise((resolve) => setTimeout(resolve, 2000));
			setSubmitted(true);
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
			setReview("");
			setRating(0);
		} catch (error) {
			setError("Failed to submit review. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="mt-4">
			<h3 className="text-lg font-semibold text-darkPurple">Leave a Review</h3>
			<form onSubmit={handleSubmit} className="mt-2">
				{/* Rating display */}
				<div className="flex items-center mb-2">
					{[...Array(5)].map((_, i) => {
						const isFilled = i + 1;
						return (
							<svg
								key={i}
								onClick={() => setRating(isFilled)}
								className={`w-6 h-6 cursor-pointer ${
									isFilled <= rating ? "text-yellow-400" : "text-gray-300"
								}`}
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
							</svg>
						);
					})}
				</div>
				{/* Review display */}
				<textarea
					className="w-full p-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-electricBlue focus:border-electricBlue"
					rows={4}
					placeholder="Write your review here..."
					value={review}
					onChange={(e) => setReview(e.target.value)}
				></textarea>

				<button
					type="submit"
					className="mt-2 px-4 py-2 bg-darkPurple text-white rounded-lg"
				>
					Submit Review
				</button>

				{/* Error and success messages */}
				<div className="pt-2">
					{error && <p className="text-red-500 pt-2 text-sm mb-2">{error}</p>}
					{success && (
						<p className="text-green-600 pt-2 text-sm mb-2">
							Review submitted successfully!
						</p>
					)}
				</div>
			</form>
		</div>
	);
}
