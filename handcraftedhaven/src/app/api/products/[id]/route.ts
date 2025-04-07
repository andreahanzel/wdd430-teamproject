import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/client";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
	}

	try {
		const product = await prisma.product.findUnique({
			where: { id },
			include: {
				seller: true,
			},
		});

		if (!product) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		return NextResponse.json(product);
	} catch (error) {
		console.error(`Error fetching product ${id}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch product" },
			{ status: 500 }
		);
	}
}
