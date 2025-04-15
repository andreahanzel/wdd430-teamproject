import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams;
		const category = searchParams.get("category") || undefined;

		// Build filter conditions
		const whereCondition = category ? { category } : {};

		// Fetch images with optional category filter
		const images = await prisma.productImage.findMany({
			where: whereCondition,
			orderBy: { name: "asc" },
		});

		return NextResponse.json(images);
	} catch (error) {
		console.error("Error fetching product images:", error);
		return NextResponse.json(
			{ error: "Failed to fetch product images" },
			{ status: 500 }
		);
	}
}
