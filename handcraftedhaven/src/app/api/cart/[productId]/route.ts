import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// PATCH update cart item quantity
export async function PATCH(
	request: Request,
	{ params }: { params: { productId: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const productId = parseInt(params.productId);

		if (isNaN(productId)) {
			return NextResponse.json(
				{ error: "Invalid product ID" },
				{ status: 400 }
			);
		}

		const body = await request.json();
		const { quantity } = body;

		if (quantity === undefined || quantity < 1) {
			return NextResponse.json(
				{ error: "Valid quantity is required" },
				{ status: 400 }
			);
		}

		const cartItem = await prisma.cartItem.findFirst({
			where: {
				userId: session.user.id,
				productId,
			},
		});

		if (!cartItem) {
			return NextResponse.json(
				{ error: "Cart item not found" },
				{ status: 404 }
			);
		}

		const updatedItem = await prisma.cartItem.update({
			where: { id: cartItem.id },
			data: { quantity },
		});

		return NextResponse.json(updatedItem);
	} catch (error) {
		console.error("Error updating cart item:", error);
		return NextResponse.json(
			{ error: "Failed to update cart item" },
			{ status: 500 }
		);
	}
}

// DELETE remove item from cart
export async function DELETE(
	request: Request,
	{ params }: { params: { productId: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const productId = parseInt(params.productId);

		if (isNaN(productId)) {
			return NextResponse.json(
				{ error: "Invalid product ID" },
				{ status: 400 }
			);
		}

		const cartItem = await prisma.cartItem.findFirst({
			where: {
				userId: session.user.id,
				productId,
			},
		});

		if (!cartItem) {
			return NextResponse.json(
				{ error: "Cart item not found" },
				{ status: 404 }
			);
		}

		await prisma.cartItem.delete({
			where: { id: cartItem.id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error removing cart item:", error);
		return NextResponse.json(
			{ error: "Failed to remove cart item" },
			{ status: 500 }
		);
	}
}
