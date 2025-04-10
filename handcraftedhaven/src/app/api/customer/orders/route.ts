import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/customer/orders - Get all orders for the current customer
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== 'CUSTOMER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Use the existing orders API endpoint
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/orders`, {
        headers: {
            'Cookie': req.headers.get('cookie') || ''
        }
        });

        if (!response.ok) {
        throw new Error('Failed to fetch orders from main API');
        }

        const ordersData = await response.json();

        // Format the orders for the customer dashboard
        const formattedOrders = ordersData
        // Filter out special orders like profile data
        .filter((order: any) => !['PROFILE_ADDRESS', 'PROFILE_PAYMENT', 'CONTACT_MESSAGE'].includes(order.status))
        .map((order: any) => {
            // Format order items
            const items = order.orderItems.map((item: any) => ({
            id: item.id.toString(),
            productId: item.product.id.toString(),
            name: item.product.name,
            price: Number(item.price),
            quantity: item.quantity,
            image: item.product.image,
            }));

            // Extract address info from shippingAddress
            const address = order.shippingAddress || {};

            return {
            id: order.id.toString(),
            createdAt: order.createdAt,
            status: order.status,
            total: Number(order.totalAmount),
            items,
            address: {
                street: address.street || '',
                city: address.city || '',
                state: address.state || '',
                postalCode: address.postalCode || '',
                country: address.country || '',
            }
            };
        });

        return NextResponse.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        
        // As a fallback, return an empty array with proper formatting
        return NextResponse.json([]);
    }
}