import { CartItem } from "@/types/database";

/**
 * Fetch cart items for the current authenticated user
 */
export async function getCartItems(): Promise<CartItem[]> {
	try {
		const response = await fetch("/api/cart");

		if (!response.ok) {
			if (response.status === 401) {
				// User is not authenticated
				return [];
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching cart items:", error);
		return [];
	}
}

/**
 * Add an item to cart
 */
export async function addToCart(
	productId: number,
	quantity: number = 1
): Promise<boolean> {
	try {
		const response = await fetch("/api/cart", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				productId,
				quantity,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to add item to cart");
		}

		return true;
	} catch (error) {
		console.error("Error adding to cart:", error);
		throw error;
	}
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
	productId: number,
	quantity: number
): Promise<boolean> {
	try {
		if (quantity <= 0) {
			return await removeFromCart(productId);
		}

		const response = await fetch(`/api/cart/${productId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ quantity }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to update quantity");
		}

		return true;
	} catch (error) {
		console.error("Error updating cart item:", error);
		throw error;
	}
}

/**
 * Remove an item from cart
 */
export async function removeFromCart(productId: number): Promise<boolean> {
	try {
		const response = await fetch(`/api/cart/${productId}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to remove item");
		}

		return true;
	} catch (error) {
		console.error("Error removing from cart:", error);
		throw error;
	}
}

/**
 * Clear the entire cart
 */
export async function clearCart(): Promise<boolean> {
	try {
		const response = await fetch("/api/cart", {
			method: "DELETE",
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to clear cart");
		}

		return true;
	} catch (error) {
		console.error("Error clearing cart:", error);
		throw error;
	}
}
