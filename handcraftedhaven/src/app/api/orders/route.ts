import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Decimal } from "@prisma/client/runtime/library";

// POST create a new order
export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { orderNumber, shippingAddress, totalAmount, paymentDetails, items } =
			body;

		if (!orderNumber || !shippingAddress || !items || items.length === 0) {
			return NextResponse.json(
				{ error: "Missing required order information" },
				{ status: 400 }
			);
		}

		// Create the order
		const order = await prisma.order.create({
			data: {
				userId: session.user.id,
				orderNumber,
				totalAmount: new Decimal(totalAmount || 0),
				shippingAddress,
				paymentDetails: paymentDetails || {},
				status: "pending",
				orderItems: {
					create: items.map((item: any) => ({
						productId: item.id,
						quantity: item.quantity,
						price: new Decimal(item.price),
					})),
				},
			},
		});

		// Clear the user's cart after successful order
		await prisma.cartItem.deleteMany({
			where: { userId: session.user.id },
		});

		return NextResponse.json(order);
	} catch (error) {
		console.error("Error creating order:", error);
		return NextResponse.json(
			{ error: "Failed to create order" },
			{ status: 500 }
		);
	}
}

// GET user's orders
export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const orders = await prisma.order.findMany({
			where: { userId: session.user.id },
			orderBy: { createdAt: "desc" },
			include: {
				orderItems: {
					include: {
						product: true,
					},
				},
			},
		});

		return NextResponse.json(orders);
	} catch (error) {
		console.error("Error fetching orders:", error);
		return NextResponse.json(
			{ error: "Failed to fetch orders" },
			{ status: 500 }
		);
	}
}
