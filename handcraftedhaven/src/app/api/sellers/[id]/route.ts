import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/client";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		return NextResponse.json({ error: "Invalid seller ID" }, { status: 400 });
	}

	try {
		const seller = await prisma.seller.findUnique({
			where: { id },
			include: {
				products: true,
			},
		});

		if (!seller) {
			return NextResponse.json({ error: "Seller not found" }, { status: 404 });
		}

		return NextResponse.json(seller);
	} catch (error) {
		console.error(`Error fetching seller ${id}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch seller" },
			{ status: 500 }
		);
	}
}
