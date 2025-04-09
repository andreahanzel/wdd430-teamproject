import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/client";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const limitParam = searchParams.get("limit");
		const limit = limitParam ? parseInt(limitParam) : 3;

		const featuredProducts = await prisma.product.findMany({
			orderBy: { price: "desc" },
			take: limit,
		});

		return NextResponse.json(featuredProducts);
	} catch (error) {
		console.error("Error fetching featured products:", error);
		return NextResponse.json(
			{ error: "Failed to fetch featured products" },
			{ status: 500 }
		);
	}
}
