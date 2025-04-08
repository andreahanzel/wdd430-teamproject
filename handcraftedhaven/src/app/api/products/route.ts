import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		// Handle featured products request
		const featured = searchParams.get("featured");
		if (featured) {
			const limit = parseInt(featured) || 3;
			const products = await prisma.product.findMany({
				orderBy: { price: "desc" },
				take: limit,
			});
			return NextResponse.json(products);
		}

		// Build filter object based on query params
		const where: any = {};

		// Category filter
		const category = searchParams.get("category");
		if (category && category !== "All") {
			where.category = category;
		}

		// Search term
		const searchTerm = searchParams.get("searchTerm");
		if (searchTerm) {
			where.OR = [
				{ name: { contains: searchTerm, mode: "insensitive" } },
				{ description: { contains: searchTerm, mode: "insensitive" } },
			];
		}

		// Price range
		const minPrice = searchParams.get("minPrice");
		const maxPrice = searchParams.get("maxPrice");
		if (minPrice || maxPrice) {
			where.price = {};
			if (minPrice) {
				where.price.gte = new Decimal(minPrice);
			}
			if (maxPrice) {
				where.price.lte = new Decimal(maxPrice);
			}
		}

		// Colors
		const colors = searchParams.get("colors");
		if (colors) {
			where.color = { in: colors.split(",") };
		}

		// Materials
		const materials = searchParams.get("materials");
		if (materials) {
			where.material = { in: materials.split(",") };
		}

		// Get products with filters
		const products = await prisma.product.findMany({
			where,
			orderBy: { id: "asc" },
		});

		return NextResponse.json(products);
	} catch (error) {
		console.error("Error fetching products:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch products",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
