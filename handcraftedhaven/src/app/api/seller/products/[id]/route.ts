import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET specific product by ID
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || session.user.role !== "SELLER") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const productId = parseInt(params.id);

		// Find the product and make sure it belongs to this seller
		const seller = await prisma.seller.findFirst({
			where: { contact: session.user.email },
		});

		if (!seller) {
			return NextResponse.json(
				{ error: "Seller profile not found" },
				{ status: 404 }
			);
		}

		const product = await prisma.product.findFirst({
			where: {
				id: productId,
				sellerId: seller.id,
			},
		});

		if (!product) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		return NextResponse.json(product);
	} catch (error) {
		console.error("Error fetching product:", error);
		return NextResponse.json(
			{ error: "Failed to fetch product" },
			{ status: 500 }
		);
	}
}

// PUT (update) a product
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || session.user.role !== "SELLER") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const productId = parseInt(params.id);

		// Get formData from request
		const formData = await req.formData();

		const name = formData.get("name") as string;
		const description = formData.get("description") as string;
		const price = parseFloat(formData.get("price") as string);
		const category = formData.get("category") as string;
		const color = (formData.get("color") as string) || null;
		const material = (formData.get("material") as string) || null;

		// Get the image path from the library
		const imagePath = formData.get("imagePath") as string;

		// Check if the product exists and belongs to this seller
		const seller = await prisma.seller.findFirst({
			where: { contact: session.user.email },
		});

		if (!seller) {
			return NextResponse.json(
				{ error: "Seller profile not found" },
				{ status: 404 }
			);
		}

		const existingProduct = await prisma.product.findFirst({
			where: {
				id: productId,
				sellerId: seller.id,
			},
		});

		if (!existingProduct) {
			return NextResponse.json(
				{ error: "Product not found or you don't have permission to edit it" },
				{ status: 404 }
			);
		}

		// Update the product
		const updatedProduct = await prisma.product.update({
			where: { id: productId },
			data: {
				name,
				description,
				price,
				image: imagePath || existingProduct.image, // Use new path or keep existing
				category,
				color,
				material,
			},
		});

		return NextResponse.json(updatedProduct);
	} catch (error) {
		console.error("Error updating product:", error);
		return NextResponse.json(
			{ error: "Failed to update product" },
			{ status: 500 }
		);
	}
}

// DELETE a product
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || session.user.role !== "SELLER") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const productId = parseInt(params.id);

		// Check if the product exists and belongs to this seller
		const seller = await prisma.seller.findFirst({
			where: { contact: session.user.email },
		});

		if (!seller) {
			return NextResponse.json(
				{ error: "Seller profile not found" },
				{ status: 404 }
			);
		}

		const existingProduct = await prisma.product.findFirst({
			where: {
				id: productId,
				sellerId: seller.id,
			},
		});

		if (!existingProduct) {
			return NextResponse.json(
				{
					error: "Product not found or you don't have permission to delete it",
				},
				{ status: 404 }
			);
		}

		// Delete the product
		await prisma.product.delete({
			where: { id: productId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting product:", error);
		return NextResponse.json(
			{ error: "Failed to delete product" },
			{ status: 500 }
		);
	}
}
