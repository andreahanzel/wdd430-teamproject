import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "../../../../../../../prisma/client"

// PUT update order status
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
    ) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SELLER" || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Find seller
        const seller = await prisma.seller.findFirst({
        where: { contact: session.user.email }
        })

        if (!seller) {
        return NextResponse.json(
            { error: "Seller profile not found" },
            { status: 404 }
        )
        }

        // Parse request body
        const data = await request.json()
        const { status } = data

        if (!status) {
        return NextResponse.json(
            { error: "Status is required" },
            { status: 400 }
        )
        }

        // Validate status
        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
        if (!validStatuses.includes(status)) {
        return NextResponse.json(
            { error: "Invalid status value" },
            { status: 400 }
        )
        }

        // Find all products by this seller
        const sellerProducts = await prisma.product.findMany({
        where: { sellerId: seller.id },
        select: { id: true }
        })

        const productIds = sellerProducts.map(product => product.id)

        // Get the order
        const order = await prisma.order.findUnique({
        where: { id: parseInt(params.id) },
        include: {
            orderItems: {
            select: {
                productId: true
            }
            }
        }
        })

        if (!order) {
        return NextResponse.json(
            { error: "Order not found" },
            { status: 404 }
        )
        }

        // Check if any of the order items belong to this seller
        const sellerOrderItems = order.orderItems.filter(item => 
        productIds.includes(item.productId)
        )

        if (sellerOrderItems.length === 0) {
        return NextResponse.json(
            { error: "This order does not contain any of your products" },
            { status: 403 }
        )
        }

        // Update the order status
        const updatedOrder = await prisma.order.update({
        where: { id: parseInt(params.id) },
        data: { status },
        include: {
            orderItems: {
            include: {
                product: true
            }
            },
            user: {
            select: {
                name: true,
                email: true
            }
            }
        }
        })

        // Filter items that belong to this seller
        const sellerItems = updatedOrder.orderItems.filter(item => 
        productIds.includes(item.productId)
        )

        // Calculate total for just this seller's items
        const sellerTotal = parseFloat(sellerItems.reduce(
        (sum, item) => sum + (parseFloat(item.price.toString()) * item.quantity),
        0
        ).toFixed(2))

        // Safely parse shipping address JSON
        let shippingAddress = {}
        try {
        if (typeof updatedOrder.shippingAddress === 'string') {
            shippingAddress = JSON.parse(updatedOrder.shippingAddress)
        } else {
            shippingAddress = updatedOrder.shippingAddress || {}
        }
        } catch (e) {
        console.error('Error parsing shipping address:', e)
        }

        // Safely parse payment details JSON
        let paymentDetails = {}
        try {
        if (updatedOrder.paymentDetails) {
            if (typeof updatedOrder.paymentDetails === 'string') {
            paymentDetails = JSON.parse(updatedOrder.paymentDetails)
            } else {
            paymentDetails = updatedOrder.paymentDetails
            }
        }
        } catch (e) {
        console.error('Error parsing payment details:', e)
        }

        // Format the response
        const formattedOrder = {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        status: updatedOrder.status,
        totalAmount: sellerTotal,
        customerName: updatedOrder.user?.name || 'Guest',
        customerEmail: updatedOrder.user?.email || 'No email provided',
        shippingAddress: shippingAddress,
        paymentDetails: paymentDetails,
        orderItems: sellerItems.map(item => ({
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            productImage: item.product.image,
            quantity: item.quantity,
            price: parseFloat(item.price.toString())
        }))
        }

        return NextResponse.json(formattedOrder)
    } catch (error) {
        console.error("Error updating order status:", error)
        return NextResponse.json(
        { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
        )
    }
}