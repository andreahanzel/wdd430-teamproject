import { Review } from "@/types/database";

export async function getProductReviews(productId: number): Promise<Review[]> {
	try {
		const response = await fetch(`/api/reviews?productId=${productId}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch reviews: ${response.status}`);
		}

		const reviews = await response.json();
		return reviews;
	} catch (error) {
		console.error("Error fetching product reviews:", error);
		return [];
	}
}

export async function getSellerReviews(sellerId: number): Promise<Review[]> {
	try {
		const response = await fetch(`/api/reviews?sellerId=${sellerId}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch reviews: ${response.status}`);
		}

		const reviews = await response.json();
		return reviews;
	} catch (error) {
		console.error("Error fetching seller reviews:", error);
		return [];
	}
}

export async function createProductReview(
	productId: number,
	rating: number,
	comment: string
): Promise<Review> {
	try {
		const response = await fetch("/api/reviews", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				productId,
				rating,
				comment,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to submit review");
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating product review:", error);
		throw error;
	}
}

export async function createSellerReview(
	sellerId: number,
	rating: number,
	comment: string
): Promise<Review> {
	try {
		const response = await fetch("/api/reviews", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				sellerId,
				rating,
				comment,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to submit review");
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating seller review:", error);
		throw error;
	}
}
