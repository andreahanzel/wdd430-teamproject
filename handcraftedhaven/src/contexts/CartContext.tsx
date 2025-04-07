"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "./NotificationContext";

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
	addToCart: (product: any, quantity: number) => void;
	removeFromCart: (productId: number) => void;
	updateQuantity: (productId: number, quantity: number) => void;
	clearCart: () => void;
	itemCount: number;
	cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";
	const { showNotification } = useNotification();

	// Load cart from localStorage on initial render
	useEffect(() => {
		if (isAuthenticated) {
			const storedCart = localStorage.getItem("cart");
			if (storedCart) {
				try {
					setCartItems(JSON.parse(storedCart));
				} catch (error) {
					console.error("Failed to parse cart from localStorage:", error);
					localStorage.removeItem("cart");
				}
			}
		} else {
			// Clear cart when not authenticated
			setCartItems([]);
		}
	}, [isAuthenticated]);

	// Save cart to localStorage whenever it changes
	useEffect(() => {
		if (isAuthenticated && cartItems.length > 0) {
			localStorage.setItem("cart", JSON.stringify(cartItems));
		}
	}, [cartItems, isAuthenticated]);

	// Clear cart when signing out
	useEffect(() => {
		if (!isAuthenticated) {
			localStorage.removeItem("cart");
		}
	}, [isAuthenticated]);

	const addToCart = (product: any, quantity: number = 1) => {
		if (!isAuthenticated) {
			showNotification("Please sign in to add items to your cart", "info");
			return;
		}

		setCartItems((prevItems) => {
			const existingItem = prevItems.find((item) => item.id === product.id);

			if (existingItem) {
				// Update quantity if item already in cart
				return prevItems.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + quantity }
						: item
				);
			} else {
				// Add new item
				return [
					...prevItems,
					{
						id: product.id,
						name: product.name,
						price: product.price,
						image: product.image,
						quantity,
						sellerId: product.sellerId || 1, // Default sellerId if not provided
					},
				];
			}
		});
	};

	const removeFromCart = (productId: number) => {
		if (!isAuthenticated) return;

		setCartItems((prevItems) =>
			prevItems.filter((item) => item.id !== productId)
		);

		// If cart becomes empty, remove from localStorage
		if (cartItems.length === 1) {
			localStorage.removeItem("cart");
		}
	};

	const updateQuantity = (productId: number, quantity: number) => {
		if (!isAuthenticated) return;

		if (quantity <= 0) {
			removeFromCart(productId);
			return;
		}

		setCartItems((prevItems) =>
			prevItems.map((item) =>
				item.id === productId ? { ...item, quantity } : item
			)
		);
	};

	const clearCart = () => {
		setCartItems([]);
		localStorage.removeItem("cart");
	};

	// Calculate total number of items
	const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

	// Calculate total price
	const cartTotal = cartItems.reduce(
		(total, item) => total + item.price * item.quantity,
		0
	);

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
