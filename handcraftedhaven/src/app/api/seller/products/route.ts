import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || session.user.role !== "SELLER") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Handle multipart form data
		const formData = await req.formData();

		// Extract product data
		const name = formData.get("name") as string;
		const description = formData.get("description") as string;
		const price = parseFloat(formData.get("price") as string);
		const category = formData.get("category") as string;
		const color = (formData.get("color") as string) || null;
		const material = (formData.get("material") as string) || null;

		// Get the image path - only from library now
		const imagePath = formData.get("imagePath") as string;

		if (!imagePath) {
			return NextResponse.json(
				{ error: "An image is required" },
				{ status: 400 }
			);
		}

		if (!session.user.email) {
			return NextResponse.json(
				{ error: "User email is required" },
				{ status: 400 }
			);
		}

		// Get the seller ID from the user
		const seller = await prisma.seller.findFirst({
			where: { contact: session.user.email },
		});

		if (!seller) {
			return NextResponse.json(
				{ error: "Seller profile not found" },
				{ status: 404 }
			);
		}

		try {
			// Try creating the product with a clean data object to avoid ID conflicts
			const productData = {
				name,
				description,
				price,
				image: imagePath,
				category,
				color,
				material,
				sellerId: seller.id,
			};

			const product = await prisma.product.create({
				data: productData,
			});

			return NextResponse.json(product);
		} catch (createError) {
			console.error("Error in product creation:", createError);

			// If it fails due to a unique constraint on ID, try to fix the sequence
			if (
				createError.code === "P2002" &&
				createError.meta?.target?.includes("id")
			) {
				// Try to reset the sequence
				try {
					// Get the current max ID
					const maxProduct = await prisma.product.findFirst({
						orderBy: {
							id: "desc",
						},
					});

					const nextId = maxProduct ? maxProduct.id + 1 : 1;

					// Create product with explicit ID that's guaranteed to be unique
					const product = await prisma.product.create({
						data: {
							id: nextId,
							name,
							description,
							price,
							image: imagePath,
							category,
							color,
							material,
							sellerId: seller.id,
						},
					});

					return NextResponse.json(product);
				} catch (seqError) {
					console.error("Failed fallback attempt:", seqError);
					throw seqError;
				}
			}

			throw createError;
		}
	} catch (error) {
		console.error("Error creating product:", error);
		return NextResponse.json(
			{
				error:
					"Failed to create product: " + (error.message || "Unknown error"),
			},
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || session.user.role !== "SELLER") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get the seller ID from the user's email
		if (!session.user.email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		const seller = await prisma.seller.findFirst({
			where: { contact: session.user.email },
		});

		if (!seller) {
			return NextResponse.json([]);
		}

		// Get all products for the seller
		const products = await prisma.product.findMany({
			where: { sellerId: seller.id },
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json(products);
	} catch (error) {
		console.error("Error fetching seller products:", error);
		return NextResponse.json(
			{ error: "Failed to fetch products" },
			{ status: 500 }
		);
	}
}
