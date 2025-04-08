import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/client";

export async function GET() {
	try {
		const categories = await prisma.product.groupBy({
			by: ["category"],
			orderBy: {
				category: "asc",
			},
		});

		return NextResponse.json([
			"All",
			...categories.map((c: { category: string }) => c.category),
		]);
	} catch (error) {
		console.error("Error fetching categories:", error);
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 }
		);
	}
}
