import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET endpoint to fetch reviews (with filtering options)
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const productId = searchParams.get("productId");
		const sellerId = searchParams.get("sellerId");

		if (!productId && !sellerId) {
			return NextResponse.json(
				{ error: "Must provide either productId or sellerId" },
				{ status: 400 }
			);
		}

		const where: any = {};

		if (productId) {
			where.productId = parseInt(productId);
		}

		if (sellerId) {
			where.sellerId = parseInt(sellerId);
		}

		const reviews = await prisma.review.findMany({
			where,
			orderBy: { date: "desc" },
			include: {
				user: {
					select: {
						name: true,
						image: true,
					},
				},
			},
		});

		return NextResponse.json(reviews);
	} catch (error) {
		console.error("Error fetching reviews:", error);
		return NextResponse.json(
			{ error: "Failed to fetch reviews" },
			{ status: 500 }
		);
	}
}

// POST endpoint to create a new review
export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user || !session.user.id) {
			return NextResponse.json(
				{ error: "You must be logged in to leave a review" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { productId, sellerId, rating, comment } = body;

		if (!productId && !sellerId) {
			return NextResponse.json(
				{ error: "Must provide either productId or sellerId" },
				{ status: 400 }
			);
		}

		if (!rating || rating < 1 || rating > 5) {
			return NextResponse.json(
				{ error: "Rating must be between 1 and 5" },
				{ status: 400 }
			);
		}

		if (!comment || comment.trim() === "") {
			return NextResponse.json(
				{ error: "Comment is required" },
				{ status: 400 }
			);
		}

		// Check if user already reviewed this product/seller
		const existingReview = await prisma.review.findFirst({
			where: {
				userId: session.user.id,
				...(productId ? { productId: parseInt(productId) } : {}),
				...(sellerId ? { sellerId: parseInt(sellerId) } : {}),
			},
		});

		if (existingReview) {
			return NextResponse.json(
				{ error: "You have already reviewed this item" },
				{ status: 400 }
			);
		}

		// Create the review
		const review = await prisma.review.create({
			data: {
				userId: session.user.id,
				userName: session.user.name || "Anonymous",
				rating,
				comment,
				...(productId ? { productId: parseInt(productId) } : {}),
				...(sellerId ? { sellerId: parseInt(sellerId) } : {}),
			},
		});

		return NextResponse.json(review, { status: 201 });
	} catch (error) {
		console.error("Error creating review:", error);
		return NextResponse.json(
			{ error: "Failed to create review" },
			{ status: 500 }
		);
	}
}
