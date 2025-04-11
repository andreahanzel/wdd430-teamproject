import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET cart items for the current authenticated user
export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const cartItems = await prisma.cartItem.findMany({
		where: { 
			userId: session.user.id,
			quantity: {
			gt: 0 // Only get items with quantity > 0
			}
		},
		include: {
			product: true,
		},
		orderBy: { createdAt: "desc" },
		});

		// Transform data to match client-side cart structure
		const formattedItems = cartItems.map((item: { productId: any; product: { name: any; price: any; image: any; sellerId: any; }; quantity: any; }) => ({
		id: item.productId,
		name: item.product.name,
		price: Number(item.product.price),
		image: item.product.image,
		quantity: item.quantity,
		sellerId: item.product.sellerId,
		}));

		return NextResponse.json(formattedItems);
	} catch (error) {
		console.error("Error fetching cart items:", error);
		return NextResponse.json(
		{ error: "Failed to fetch cart items" },
		{ status: 500 }
		);
	}
	}

	// POST add item to cart
	export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		let { productId, quantity = 1 } = body;

		// Ensure minimum quantity is 1
		if (quantity < 1) {
		quantity = 1;
		}

		if (!productId) {
		return NextResponse.json(
			{ error: "Product ID is required" },
			{ status: 400 }
		);
		}

		// Check if the product exists
		const product = await prisma.product.findUnique({
		where: { id: productId },
		});

		if (!product) {
		return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		// Check if item already in cart (only actual cart items)
		const existingCartItem = await prisma.cartItem.findFirst({
		where: {
			userId: session.user.id,
			productId,
			quantity: {
			gt: 0 // Only consider items with quantity > 0
			}
		},
		});

		let cartItem;

		if (existingCartItem) {
		// Update quantity if item already exists
		cartItem = await prisma.cartItem.update({
			where: { id: existingCartItem.id },
			data: { quantity: existingCartItem.quantity + quantity },
		});
		} else {
		// Create new cart item
		cartItem = await prisma.cartItem.create({
			data: {
			userId: session.user.id,
			productId,
			quantity,
			},
		});
		}

		return NextResponse.json(cartItem);
	} catch (error) {
		console.error("Error adding item to cart:", error);
		return NextResponse.json(
		{ error: "Failed to add item to cart" },
		{ status: 500 }
		);
	}
	}

	// DELETE all cart items (clear cart)
	export async function DELETE() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await prisma.cartItem.deleteMany({
		where: { 
			userId: session.user.id,
			quantity: {
			gt: 0 // Only delete actual cart items
			}
		},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error clearing cart:", error);
		return NextResponse.json(
		{ error: "Failed to clear cart" },
		{ status: 500 }
		);
	}
}