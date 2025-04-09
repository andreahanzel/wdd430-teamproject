"use client";

import { useState, useEffect } from "react";
import ProductReviews from "@/components/ProductReviews";
import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle, ShoppingBag, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useNotification } from "@/contexts/NotificationContext";
import { getProductById } from "@/services/productServices";

export default function ProductDetailPage() {
	const params = useParams();
	const id = parseInt(params.id as string);
	const { addToCart } = useCart();
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";
	const router = useRouter();
	const { showNotification } = useNotification();

	const [product, setProduct] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [quantity, setQuantity] = useState(1);
	const [addedToCart, setAddedToCart] = useState(false);

	useEffect(() => {
		async function loadProduct() {
			try {
				const productData = await getProductById(id);
				if (productData) {
					setProduct(productData);
				}
			} catch (error) {
				console.error("Error loading product:", error);
			} finally {
				setLoading(false);
			}
		}

		loadProduct();
	}, [id]);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electricBlue"></div>
			</div>
		);
	}

	if (!product) return notFound();

	const handleAddToCart = async () => {
		if (!isAuthenticated) {
			showNotification("Please sign in to add items to your cart", "info");
			router.push(`/login?callbackUrl=/products/${id}`);
			return;
		}

		try {
			await addToCart(product, quantity);
			setAddedToCart(true);

			// Reset notification after 3 seconds
			setTimeout(() => {
				setAddedToCart(false);
			}, 3000);
		} catch (error) {
			console.error("Error adding to cart:", error);
			showNotification(
				error instanceof Error ? error.message : "Failed to add item to cart",
				"error"
			);
		}
	};

	// Show product details for all users, regardless of authentication
	return (
		<section id="main-content" className="min-h-screen py-16 bg-gradient-to-br from-darkPurple via-backgroundDark to-neonPink/10 text-white">
			<div className="container mx-auto px-4">
				<Link
					href="/products"
					className="inline-flex items-center text-electricBlue hover:text-neonPink mb-8"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-5 h-5 mr-2"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
						/>
					</svg>
					Back to all products
				</Link>

				<div className="bg-gradient-to-br from-backgroundDark via-darkPurple to-black/20 border border-white/10 shadow-xl shadow-neonPink/30 ring-1 ring-white/5 shadow-neonPink/30 rounded-2xl p-8 md:p-12 text-white">
					<div className="grid md:grid-cols-2 gap-12 items-center">
						{/* Image Section */}
						<div className="relative overflow-hidden rounded-lg">
							<div className="absolute top-4 left-4 z-10">
								<span className="bg-darkPurple text-white text-xs tracking-wider uppercase font-semibold px-4 py-2 rounded-full">
									{product.category}
								</span>
							</div>
							<div className="h-full flex items-center justify-center p-8">
								<Image
									src={product.image}
									alt={product.name}
									width={500}
									height={500}
									className="object-contain max-h-[500px] w-auto"
								/>
							</div>
						</div>

						{/* Product Details Section */}
						<div className="space-y-8">
							<div>
							<h1 className="text-4xl font-extrabold text-neonPink font-poppins tracking-tight">
									{product.name}
								</h1>
								<div className="flex items-center mt-2">
									<div className="flex mr-2">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className={`w-4 h-4 ${
													i < 4 ? "text-yellow-400" : "text-gray-300"
												}`}
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									<p className="text-sm text-gray-500">(14 reviews)</p>
								</div>
							</div>

							<div className="border-t border-b border-gray-200 py-6">
								<p className="text-3xl font-bold text-neonPink">
									${Number(product.price).toFixed(2)}
								</p>
							</div>

							<div>
							<h2 className="text-lg font-semibold text-white mb-2">
									Description
								</h2>
								<p className="text-white/80">{product.description}</p>
							</div>

							<div className="pt-4">
								<div className="flex items-center mb-6">
									<div className="mr-4">
										<label
											htmlFor="quantity-select"
											className="block text-sm font-medium text-white mb-1"
										>
											Quantity
										</label>
										<select
										id="quantity-select"
										name="quantity"
										value={quantity}
										onChange={(e) => setQuantity(parseInt(e.target.value))}
										aria-label="Product quantity"
										className="border border-white/20 bg-backgroundDark text-white rounded-md p-2 w-20"
									>
											{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
												<option key={num} value={num}>
													{num}
												</option>
											))}
										</select>
									</div>
									<div>
									<label className="block text-sm font-medium text-white mb-1">
											Seller
										</label>
										<Link
											href={`/sellers/${product.sellerId}`}
											className="text-electricBlue hover:underline"
										>
											View Artisan #{product.sellerId}
										</Link>
									</div>
								</div>

								<div className="flex space-x-4">
									{isAuthenticated ? (
										<Button
											variant="primary"
											className="flex-1 py-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-electricBlue/30 hover:shadow-neonPink/40 transition-transform transform hover:scale-105"
											onClick={handleAddToCart}
										>
											<ShoppingBag size={18} />
											Add to Cart
										</Button>
									) : (
										<Link
											href={`/login?callbackUrl=/products/${id}`}
											className="flex-1"
										>
											<Button
												variant="login"
												className="flex-1 w-full py-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-electricBlue/30 hover:shadow-neonPink/40 transition-transform transform hover:scale-105"
												>
												<LogIn size={18} />
												Sign In to Purchase
											</Button>
										</Link>
									)}
									<button
										className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
										aria-label="Add to wishlist"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
											className="w-6 h-6 text-neonPink hover:text-pink-600 drop-shadow-sm transition"
											>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
											/>
										</svg>
									</button>
								</div>

								{/* Added to cart notification */}
								<AnimatePresence>
									{addedToCart && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0 }}
											className="mt-4 bg-green-50 border border-green-100 rounded-md p-3 flex items-center text-green-700"
										>
											<CheckCircle size={18} className="mr-2" />
											<span className="text-sm font-medium">
												Added to cart successfully!
											</span>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							<div className="bg-backgroundDark/70 border border-white/10 p-4 rounded-lg">
								<div className="flex items-center text-sm">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
										className="w-5 h-5 text-electricBlue mr-2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 00 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.56 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
										/>
									</svg>
									<span className="text-white/80">
										Free shipping on orders over $50
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Product Reviews */}
				<ProductReviews productId={product.id} productName={product.name} />

				{/* Suggested Products */}
				<div className="mt-24">
					<h2 className="text-2xl font-bold text-darkPurple mb-8 text-center">
						You May Also Like
					</h2>
					<div className="text-center py-8">
						<Link href="/products">
							<Button variant="secondary">Browse More Handcrafted Items</Button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}