import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/client";

export async function GET() {
	try {
		// Get all distinct colors
		const colors = await prisma.product.findMany({
			select: {
				color: true,
			},
			distinct: ["color"],
			where: {
				color: {
					not: null,
				},
			},
		});

		// Get all distinct materials
		const materials = await prisma.product.findMany({
			select: {
				material: true,
			},
			distinct: ["material"],
			where: {
				material: {
					not: null,
				},
			},
		});

		return NextResponse.json({
			colors: colors
				.map((c: { color: string | null }) => c.color)
				.filter((c: string | null): c is string => c !== null),
			materials: materials
				.map((m: { material: string | null }) => m.material)
				.filter((m: string | null): m is string => m !== null),
		});
	} catch (error) {
		console.error("Error fetching product properties:", error);
		return NextResponse.json(
			{ error: "Failed to fetch product properties" },
			{ status: 500 }
		);
	}
}
