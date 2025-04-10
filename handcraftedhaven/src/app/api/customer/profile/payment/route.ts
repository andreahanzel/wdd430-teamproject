import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// PUT /api/customer/profile/payment - Update the customer's payment information
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'CUSTOMER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { paymentInfo } = await req.json()

        if (!paymentInfo) {
        return NextResponse.json(
            { error: 'Payment information is required' },
            { status: 400 }
        )
        }

        // Find existing profile payment order or create a new one
        const existingPaymentOrder = await prisma.order.findFirst({
        where: {
            userId: session.user.id,
            status: 'PROFILE_PAYMENT',
        },
        })

        // Mask the card number for security (store only last 4 digits)
        let maskedPaymentInfo = { ...paymentInfo };
        if (paymentInfo.cardNumber) {
        // Only store the last 4 digits
        const lastFourDigits = paymentInfo.cardNumber.slice(-4);
        maskedPaymentInfo.cardNumber = `xxxx-xxxx-xxxx-${lastFourDigits}`;
        }

        if (existingPaymentOrder) {
        // Update existing payment order
        await prisma.order.update({
            where: {
            id: existingPaymentOrder.id,
            },
            data: {
            paymentDetails: maskedPaymentInfo,
            },
        })
        } else {
        // Create a new payment order
        await prisma.order.create({
            data: {
            userId: session.user.id,
            orderNumber: `PAYMENT_${Date.now()}`,
            totalAmount: 0,
            status: 'PROFILE_PAYMENT',
            shippingAddress: {},
            paymentDetails: maskedPaymentInfo,
            },
        })
        }

        return NextResponse.json({
        message: 'Payment information updated successfully',
        // Return masked info to client
        paymentInfo: {
            ...maskedPaymentInfo,
            // Don't send the full card number back to the client
            cardNumber: maskedPaymentInfo.cardNumber,
        },
        })
    } catch (error) {
        console.error('Error updating payment information:', error)
        return NextResponse.json(
        { error: 'Failed to update payment information' },
        { status: 500 }
        )
    }
}