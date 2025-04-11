import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/client";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		const id = parseInt(params.id as string);

		if (isNaN(id)) {
		return NextResponse.json(
			{ error: "Invalid product ID" },
			{ status: 400 }
		);
		}

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
		console.error(`Error fetching product ${params.id}:`, error);
		return NextResponse.json(
		{ error: "Failed to fetch product" },
		{ status: 500 }
		);
	}
}

	export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
        const params = await props.params;
        try {
            const id = parseInt(params.id);
            const body = await request.json();

            if (isNaN(id)) {
            return NextResponse.json(
                { error: "Invalid product ID" },
                { status: 400 }
            );
            }

            // Validate required fields
            if (!body.name || !body.description || !body.price || !body.image || !body.category) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
            }

            const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                price: parseFloat(body.price),
                image: body.image,
                category: body.category,
                color: body.color || null,
                material: body.material || null,
            },
            });

            return NextResponse.json(updatedProduct);
        } catch (error) {
            console.error(`Error updating product ${params.id}:`, error);
            return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
            );
        }
    }

	export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
        const params = await props.params;
        try {
            const id = parseInt(params.id);

            if (isNaN(id)) {
            return NextResponse.json(
                { error: "Invalid product ID" },
                { status: 400 }
            );
            }

            await prisma.product.delete({
            where: { id },
            });

            return NextResponse.json({ message: "Product deleted successfully" });
        } catch (error) {
            console.error(`Error deleting product ${params.id}:`, error);
            return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
            );
        }
    }