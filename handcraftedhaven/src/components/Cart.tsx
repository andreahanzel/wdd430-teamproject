"use client";

import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Cart() {
	const { cartItems, removeFromCart, updateQuantity, cartTotal, isLoading } =
		useCart();
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return null; // Prevent hydration errors by not rendering on server
	}

	// Show loading state
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-20 px-4 text-white">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electricBlue"></div>
				<p className="mt-4 text-pink-200">Loading your cart...</p>
			</div>
		);
	}

	if (cartItems.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 px-4 text-center text-white">
				<div className="bg-white/10 rounded-full p-6 mb-6">
					<ShoppingBag size={64} className="text-pink-300" />
				</div>
				<h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
				<p className="text-pink-200 mb-8 max-w-md">
					Looks like you haven't added any items yet. Discover unique handcrafted treasures!
				</p>
				<Link href="/products">
					<Button variant="primary" className="px-8">Continue Shopping</Button>
				</Link>
			</div>
		);
	}

	return (
		<div id="main-content" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 px-4 py-10 text-white">
			<div className="max-w-6xl mx-auto space-y-10">
				<h1 className="text-3xl font-bold text-white">Your Shopping Cart ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Cart Items */}
					<div className="lg:col-span-2 space-y-4">
						<div className="bg-white/10 border border-white/10 rounded-xl shadow-xl backdrop-blur-md">
							<div className="p-5 border-b border-white/10 flex justify-between items-center">
								<h2 className="text-lg font-semibold">Cart Items</h2>
								<Link href="/products" className="text-pink-300 hover:text-white flex items-center gap-1 text-sm">
									<ArrowLeft size={16} /> Continue Shopping
								</Link>
							</div>
							<ul>
								<AnimatePresence>
									{cartItems.map((item) => (
										<li key={item.id}>
											<motion.div
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, height: 0, margin: 0 }}
												transition={{ duration: 0.3 }}
												className="p-5 border-b border-white/5 flex flex-col sm:flex-row gap-6"
											>
												<div className="w-20 h-20 bg-white/10 rounded-lg overflow-hidden border border-white/10">
													<img src={item.image} alt={item.name} className="w-full h-full object-cover" />
												</div>
												<div className="flex-1 flex flex-col justify-between">
													<div className="flex justify-between flex-wrap gap-2">
														<div>
															<Link href={`/products/${item.id}`} className="text-white font-semibold hover:text-pink-400 transition">
																{item.name}
															</Link>
															<p className="text-sm text-pink-200">From Artisan #{item.sellerId}</p>
														</div>
														<p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
													</div>

													<div className="flex items-center justify-between mt-4">
														<div className="flex items-center border border-white/20 rounded">
															<button
																aria-label="Decrease quantity"
																onClick={() => updateQuantity(item.id, item.quantity - 1)}
																className="px-2 py-1 text-white hover:text-pink-400 transition"
															>
																<Minus size={16} />
															</button>
															<span className="px-4">{item.quantity}</span>
															<button
																aria-label="Increase quantity"
																onClick={() => updateQuantity(item.id, item.quantity + 1)}
																className="px-2 py-1 text-white hover:text-pink-400 transition"
															>
																<Plus size={16} />
															</button>
														</div>
														<button
															aria-label="Remove item"
															onClick={() => removeFromCart(item.id)}
															className="text-white hover:text-red-500 transition"
														>
															<Trash2 size={18} />
														</button>
													</div>
												</div>
											</motion.div>
										</li>
									))}
								</AnimatePresence>
							</ul>
						</div>
					</div>

					{/* Summary */}
					<div className="bg-white/10 border border-white/10 rounded-xl shadow-xl backdrop-blur-md p-6 sticky top-6">
						<h2 className="text-lg font-semibold mb-4">Order Summary</h2>
						<div className="space-y-3 text-pink-200">
							<div className="flex justify-between">
								<span>Subtotal</span>
								<span className="text-white font-medium">${cartTotal.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span>Shipping</span>
								<span>Calculated at checkout</span>
							</div>
							<div className="flex justify-between">
								<span>Taxes</span>
								<span>Calculated at checkout</span>
							</div>
							<hr className="border-white/10 my-3" />
							<div className="flex justify-between text-lg font-bold text-white">
								<span>Total</span>
								<span>${cartTotal.toFixed(2)}</span>
							</div>
							<Link href="/checkout">
								<Button variant="primary" className="w-full py-3 mt-4">Proceed to Checkout</Button>
							</Link>
							<p className="text-xs text-center mt-2 text-white/60">Secure checkout powered by Stripe</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}