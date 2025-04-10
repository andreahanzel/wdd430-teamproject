import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// PUT /api/customer/profile/address - Update the customer's address
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'CUSTOMER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { address } = await req.json()

        if (!address) {
        return NextResponse.json(
            { error: 'Address data is required' },
            { status: 400 }
        )
        }

        // Find existing profile address order or create a new one
        const existingAddressOrder = await prisma.order.findFirst({
        where: {
            userId: session.user.id,
            status: 'PROFILE_ADDRESS',
        },
        })

        if (existingAddressOrder) {
        // Update existing address order
        const currentAddress = existingAddressOrder.shippingAddress as Record<string, any> || {};
        await prisma.order.update({
            where: {
            id: existingAddressOrder.id,
            },
            data: {
            shippingAddress: {
                ...currentAddress,
                ...address,
            },
            },
        })
        } else {
        // Create a new address order
        await prisma.order.create({
            data: {
            userId: session.user.id,
            orderNumber: `PROFILE_${Date.now()}`,
            totalAmount: 0,
            status: 'PROFILE_ADDRESS',
            shippingAddress: address,
            paymentDetails: {},
            },
        })
        }

        return NextResponse.json({
        message: 'Address updated successfully',
        address,
        })
    } catch (error) {
        console.error('Error updating address:', error)
        return NextResponse.json(
        { error: 'Failed to update address' },
        { status: 500 }
        )
    }
}