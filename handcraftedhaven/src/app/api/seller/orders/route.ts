import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "../../../../../prisma/client"

// GET all orders for the current seller
export async function GET(request: Request) {
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
        return NextResponse.json([])
        }

        const productIds = sellerProducts.map(product => product.id)

        // Find all order items containing the seller's products
        const orderItems = await prisma.orderItem.findMany({
        where: {
            productId: { in: productIds }
        },
        include: {
            order: {
            include: {
                user: {
                select: {
                    name: true,
                    email: true
                }
                },
                orderItems: {
                include: {
                    product: true
                }
                }
            }
            },
            product: true
        }
        })

        // Create a Set to track unique order IDs
        const uniqueOrderIds = new Set()

        // Filter out duplicate orders and map to the expected format
        const orders = orderItems
        .filter(item => {
            if (uniqueOrderIds.has(item.order.id)) {
            return false
            }
            uniqueOrderIds.add(item.order.id)
            return true
        })
        .map(item => {
            // Filter order items to only include this seller's products
            const sellerOrderItems = item.order.orderItems.filter(orderItem => 
            productIds.includes(orderItem.productId)
            )

            // Calculate total for just this seller's items
            const sellerTotal = parseFloat(sellerOrderItems.reduce(
            (sum, orderItem) => sum + (parseFloat(orderItem.price.toString()) * orderItem.quantity),
            0
            ).toFixed(2))

            // Safely parse shipping address JSON
            let shippingAddress = {}
            try {
            if (typeof item.order.shippingAddress === 'string') {
                shippingAddress = JSON.parse(item.order.shippingAddress)
            } else {
                shippingAddress = item.order.shippingAddress || {}
            }
            } catch (e) {
            console.error('Error parsing shipping address:', e)
            }

            // Safely parse payment details JSON
            let paymentDetails = {}
            try {
            if (item.order.paymentDetails) {
                if (typeof item.order.paymentDetails === 'string') {
                paymentDetails = JSON.parse(item.order.paymentDetails)
                } else {
                paymentDetails = item.order.paymentDetails
                }
            }
            } catch (e) {
            console.error('Error parsing payment details:', e)
            }

            return {
            id: item.order.id,
            orderNumber: item.order.orderNumber,
            createdAt: item.order.createdAt,
            updatedAt: item.order.updatedAt,
            status: item.order.status,
            totalAmount: sellerTotal,
            customerName: item.order.user?.name || 'Guest',
            customerEmail: item.order.user?.email || 'No email provided',
            shippingAddress: shippingAddress,
            paymentDetails: paymentDetails,
            orderItems: sellerOrderItems.map(orderItem => ({
                id: orderItem.id,
                productId: orderItem.productId,
                productName: orderItem.product.name,
                productImage: orderItem.product.image,
                quantity: orderItem.quantity,
                price: parseFloat(orderItem.price.toString())
            }))
            }
        })

        return NextResponse.json(orders)
    } catch (error) {
        console.error("Error fetching seller orders:", error)
        return NextResponse.json(
        { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
        )
    }
}