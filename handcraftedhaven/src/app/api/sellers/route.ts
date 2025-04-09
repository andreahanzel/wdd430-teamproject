import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const contact = searchParams.get("contact");

	try {
		if (contact) {
			const seller = await prisma.seller.findFirst({
				where: { contact },
				include: { products: true },
			});

			if (!seller) {
				return NextResponse.json(
					{ error: "Seller not found" },
					{ status: 404 }
				);
			}

			return NextResponse.json(seller);
		}

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
