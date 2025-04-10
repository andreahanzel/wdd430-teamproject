import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/customer/profile - Get the customer's profile
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'CUSTOMER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get the user's profile
        const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
        })

        if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get address and payment info if they exist
        const profileOrders = await prisma.order.findMany({
        where: {
            userId: session.user.id,
            OR: [
            { status: 'PROFILE_ADDRESS' },
            { status: 'PROFILE_PAYMENT' },
            ]
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 2, // Get the most recent profile orders
        })

        // Extract address and payment info
        let address = {};
        let paymentInfo = {};

        profileOrders.forEach(order => {
        if (order.status === 'PROFILE_ADDRESS' && order.shippingAddress) {
            address = order.shippingAddress;
        }
        if (order.status === 'PROFILE_PAYMENT' && order.paymentDetails) {
            paymentInfo = order.paymentDetails;
        }
        });

        // Construct the full profile
        const profile = {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone: (address as any)?.phone || '',
        address: {
            street: (address as any)?.street || '',
            city: (address as any)?.city || '',
            state: (address as any)?.state || '',
            postalCode: (address as any)?.postalCode || '',
            country: (address as any)?.country || '',
        },
        paymentInfo: {
            cardNumber: (paymentInfo as any)?.cardNumber || '',
            cardName: (paymentInfo as any)?.cardName || '',
            expiryMonth: (paymentInfo as any)?.expiryMonth || '',
            expiryYear: (paymentInfo as any)?.expiryYear || '',
        }
        }

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Error fetching profile:', error)
        return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
        )
    }
    }

    // PUT /api/customer/profile - Update the customer's basic info
    export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'CUSTOMER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { name, email, phone } = await req.json()

        // Update the user's profile in the database
        const updatedUser = await prisma.user.update({
        where: {
            id: session.user.id,
        },
        data: {
            name,
            email,
        },
        })

        // Store phone in address info
        // Find existing profile order or create a new one
        const existingAddressOrder = await prisma.order.findFirst({
        where: {
            userId: session.user.id,
            status: 'PROFILE_ADDRESS',
        },
        })

        if (existingAddressOrder) {
        // Update existing address order with phone
        const currentAddress = existingAddressOrder.shippingAddress as Record<string, any> || {};
        await prisma.order.update({
            where: {
            id: existingAddressOrder.id,
            },
            data: {
            shippingAddress: {
                ...currentAddress,
                phone,
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
            shippingAddress: {
                phone,
            },
            paymentDetails: {},
            },
        })
        }

        return NextResponse.json({
        message: 'Profile updated successfully',
        user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
        },
        })
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
        )
    }
}