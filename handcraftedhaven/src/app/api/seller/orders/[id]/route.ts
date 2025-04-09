import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "../../../../../../prisma/client"

// GET a single order by ID
export async function GET(
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

        // Find all products by this seller
        const sellerProducts = await prisma.product.findMany({
        where: { sellerId: seller.id },
        select: { id: true }
        })

        if (sellerProducts.length === 0) {
        return NextResponse.json(
            { error: "No products found for this seller" },
            { status: 404 }
        )
        }

        const productIds = sellerProducts.map(product => product.id)

        // Get the order
        const order = await prisma.order.findUnique({
        where: { id: parseInt(params.id) },
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

        // Calculate total for just this seller's items
        const sellerTotal = parseFloat(sellerOrderItems.reduce(
        (sum, item) => sum + (parseFloat(item.price.toString()) * item.quantity),
        0
        ).toFixed(2))

        // Safely parse shipping address JSON
        let shippingAddress = {}
        try {
        if (typeof order.shippingAddress === 'string') {
            shippingAddress = JSON.parse(order.shippingAddress)
        } else {
            shippingAddress = order.shippingAddress || {}
        }
        } catch (e) {
        console.error('Error parsing shipping address:', e)
        }

        // Safely parse payment details JSON
        let paymentDetails = {}
        try {
        if (order.paymentDetails) {
            if (typeof order.paymentDetails === 'string') {
            paymentDetails = JSON.parse(order.paymentDetails)
            } else {
            paymentDetails = order.paymentDetails
            }
        }
        } catch (e) {
        console.error('Error parsing payment details:', e)
        }

        // Format the response
        const formattedOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        status: order.status,
        totalAmount: sellerTotal,
        customerName: order.user?.name || 'Guest',
        customerEmail: order.user?.email || 'No email provided',
        shippingAddress: shippingAddress,
        paymentDetails: paymentDetails,
        orderItems: sellerOrderItems.map(item => ({
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
        console.error("Error fetching order details:", error)
        return NextResponse.json(
        { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
        )
    }
}