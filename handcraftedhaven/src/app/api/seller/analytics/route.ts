// handcraftedhaven/src/app/api/seller/analytics/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma'


export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session || session.user.role !== 'SELLER') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const seller = await prisma.seller.findFirst({
			where: { contact: session.user.email ?? '' }, // adjust if you use a different match
		});

		if (!seller) {
			return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
		}

		// Fetch all products belonging to this seller
		const products = await prisma.product.findMany({
			where: { sellerId: seller.id },
			include: {
				orderItems: true,
			},
		});

		// Total sales and top products
		let totalSales = 0;
		let totalOrders = 0;
		const productSales: { [productId: number]: number } = {};

		for (const product of products) {
			for (const orderItem of product.orderItems) {
				totalSales += Number(orderItem.price) * orderItem.quantity;
				totalOrders += 1;
				productSales[product.id] = (productSales[product.id] || 0) + orderItem.quantity;
			}
		}

		// Build monthly sales data
		const monthlySalesData = await prisma.orderItem.findMany({
			where: {
				product: {
					sellerId: seller.id,
				},
			},
			include: {
				order: true,
			},
		});

		const monthlySales: Record<string, number> = {};

		for (const item of monthlySalesData) {
			const month = new Date(item.order.createdAt).toLocaleString('default', { month: 'short' });
			monthlySales[month] = (monthlySales[month] || 0) + Number(item.price) * item.quantity;
		}

		// Prepare response
		const topProducts = Object.entries(productSales)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([productId, sales]) => {
				const product = products.find((p) => p.id === parseInt(productId));
				return {
					name: product?.name || 'Unknown Product',
					sales,
				};
			});

		return NextResponse.json({
			totalSales,
			totalOrders,
			topProducts,
			monthlySales: Object.entries(monthlySales).map(([month, sales]) => ({
				month,
				sales,
			})),
		});
	} catch (error) {
		console.error('Analytics route error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
