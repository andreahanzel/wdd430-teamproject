import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";

export async function GET() {
	try {
		const sellers = await prisma.seller.findMany({
			include: {
				products: true,
			},
		});

		return NextResponse.json(sellers);
	} catch (error) {
		console.error("Error fetching sellers:", error);
		return NextResponse.json(
			{ error: "Failed to fetch sellers" },
			{ status: 500 }
		);
	}
}
