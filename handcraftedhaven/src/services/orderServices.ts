import { Order, ShippingAddress, PaymentDetails } from "@/types/database";

interface OrderItem {
	id: number;
	quantity: number;
	price: number;
}

interface CreateOrderParams {
	orderNumber: string;
	shippingAddress: ShippingAddress;
	paymentDetails: PaymentDetails;
	totalAmount: number;
	items: OrderItem[];
}

/**
 * Create a new order
 */
export async function createOrder(params: CreateOrderParams): Promise<Order> {
	try {
		const response = await fetch("/api/orders", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to create order");
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating order:", error);
		throw error;
	}
}

/**
 * Get all orders for the current user
 */
export async function getUserOrders(): Promise<Order[]> {
	try {
		const response = await fetch("/api/orders");

		if (!response.ok) {
			if (response.status === 401) {
				// User is not authenticated
				return [];
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching orders:", error);
		return [];
	}
}

/**
 * Generate a random order number
 */
export function generateOrderNumber(): string {
	return `HCH-${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Calculate order total with taxes and shipping
 */
export function calculateOrderTotal(
	subtotal: number,
	shippingMethod: "standard" | "express" | "overnight"
): {
	subtotal: number;
	shipping: number;
	tax: number;
	total: number;
} {
	// Shipping rates
	const shippingRates = {
		standard: 0,
		express: 12.99,
		overnight: 24.99,
	};

	// Tax rate (7% for demo)
	const taxRate = 0.07;

	const shipping = shippingRates[shippingMethod];
	const tax = subtotal * taxRate;
	const total = subtotal + shipping + tax;

	return {
		subtotal,
		shipping,
		tax,
		total,
	};
}
