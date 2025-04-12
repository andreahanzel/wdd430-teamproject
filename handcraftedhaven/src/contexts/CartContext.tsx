"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "./NotificationContext";
import { useRouter } from "next/navigation";

export interface CartItem {
	id: number;
	name: string;
	price: number;
	image: string;
	quantity: number;
	sellerId: number;
}

interface CartContextType {
	cartItems: CartItem[];
	addToCart: (product: any, quantity: number) => Promise<void>;
	removeFromCart: (productId: number) => Promise<void>;
	updateQuantity: (productId: number, quantity: number) => Promise<void>;
	clearCart: () => Promise<void>;
	itemCount: number;
	cartTotal: number;
	isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";
	const { showNotification } = useNotification();
	const router = useRouter();

	// Load cart from server on authentication status change
	useEffect(() => {
		const loadCartFromServer = async () => {
			if (isAuthenticated) {
				setIsLoading(true);
				try {
					const response = await fetch("/api/cart");
					if (response.ok) {
						const data = await response.json();
						setCartItems(data);
					} else {
						console.error("Failed to load cart from server");
						showNotification("Failed to load your cart", "error");
					}
				} catch (error) {
					console.error("Error loading cart:", error);
				} finally {
					setIsLoading(false);
				}
			} else {
				// Clear cart when not authenticated
				setCartItems([]);
				setIsLoading(false);
			}
		};

		loadCartFromServer();
	}, [isAuthenticated, showNotification]);

	const addToCart = async (product: any, quantity: number = 1) => {
		if (!isAuthenticated) {
			showNotification("Please sign in to add items to cart", "info");
			router.push("/login");
			return;
		}

		try {
			const response = await fetch("/api/cart", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					productId: product.id,
					quantity,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to add item to cart");
			}

			// Update local cart state
			const existingItem = cartItems.find((item) => item.id === product.id);

			if (existingItem) {
				// Update quantity if item already in cart
				setCartItems(
					cartItems.map((item) =>
						item.id === product.id
							? { ...item, quantity: item.quantity + quantity }
							: item
					)
				);
			} else {
				// Add new item
				setCartItems([
					...cartItems,
					{
						id: product.id,
						name: product.name,
						price: product.price,
						image: product.image,
						quantity,
						sellerId: product.sellerId || 1, // Default sellerId if not provided
					},
				]);
			}

			await new Promise(resolve => setTimeout(resolve, 100)); 
    
			showNotification(`${product.name} added to cart!`, "success");
			} catch (error) {
				showNotification(
				error instanceof Error ? error.message : "Failed to add to cart",
				"error"
				);
			}
		};

	const removeFromCart = async (productId: number) => {
		if (!isAuthenticated) return;

		try {
			const response = await fetch(`/api/cart/${productId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to remove item");
			}

			setCartItems(cartItems.filter((item) => item.id !== productId));
			showNotification("Item removed from cart", "info");
		} catch (error) {
			console.error("Error removing from cart:", error);
			showNotification(
				error instanceof Error ? error.message : "Failed to remove item",
				"error"
			);
		}
	};

	const updateQuantity = async (productId: number, quantity: number) => {
		if (!isAuthenticated) return;

		if (quantity <= 0) {
			await removeFromCart(productId);
			return;
		}

		try {
			const response = await fetch(`/api/cart/${productId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ quantity }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update quantity");
			}

			setCartItems(
				cartItems.map((item) =>
					item.id === productId ? { ...item, quantity } : item
				)
			);
		} catch (error) {
			console.error("Error updating cart:", error);
			showNotification(
				error instanceof Error ? error.message : "Failed to update quantity",
				"error"
			);
		}
	};

	const clearCart = async () => {
		if (!isAuthenticated) return;

		try {
			const response = await fetch("/api/cart", {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to clear cart");
			}

			setCartItems([]);
		} catch (error) {
			console.error("Error clearing cart:", error);
			showNotification(
				error instanceof Error ? error.message : "Failed to clear cart",
				"error"
			);
		}
	};

	// Calculate total number of items
	const itemCount = cartItems
	.filter(item => item.quantity > 0) // Only count actual cart items
	.reduce((total, item) => total + item.quantity, 0);

	// Calculate total price
	const cartTotal = cartItems
  .filter(item => item.quantity > 0) // Only calculate for actual cart items
  .reduce((total, item) => total + item.price * item.quantity, 0);

	return (
		<CartContext.Provider
			value={{
				cartItems,
				addToCart,
				removeFromCart,
				updateQuantity,
				clearCart,
				itemCount,
				cartTotal,
				isLoading,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export const useCart = () => {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};
