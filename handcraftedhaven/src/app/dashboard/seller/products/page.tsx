"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Pencil, Trash, AlertTriangle, Plus, Package } from "lucide-react";

export default function ProductsSection() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [products, setProducts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (status === "authenticated" && session?.user?.role !== "SELLER") {
			router.push("/");
			return;
		}

		const fetchProducts = async () => {
			try {
				const productsRes = await fetch("/api/seller/products");

				if (productsRes.status === 404) {
					setProducts([]);
					setError(null);
				} else if (!productsRes.ok) {
					throw new Error("Failed to fetch products");
				} else {
					const productsData = await productsRes.json();
					setProducts(productsData);
					setError(null);
				}
			} catch (error) {
				console.error("Error fetching products:", error);
				setError("Could not load products. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		if (status === "authenticated") {
			fetchProducts();
		}
	}, [session, router, status]);

	const handleDelete = async (productId: number) => {
		if (!confirm("Are you sure you want to delete this product?")) return;

		try {
			const response = await fetch(`/api/seller/products/${productId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete product");
			}

			setProducts(products.filter((p) => p.id !== productId));
		} catch (error) {
			console.error("Error deleting product:", error);
			alert("Failed to delete product");
		}
	};

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
				<div className="max-w-7xl mx-auto">
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 h-96 animate-pulse border border-white/10"
							>
								<div className="bg-white/20 h-48 rounded-lg mb-4"></div>
								<div className="bg-white/20 h-5 rounded-full w-3/4 mb-3"></div>
								<div className="bg-white/20 h-4 rounded-full w-1/2 mb-4"></div>
								<div className="bg-white/20 h-8 rounded-lg w-1/3"></div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-8">
				<div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-10 max-w-md border border-white/10 text-center">
					<div className="flex justify-center mb-6">
						<AlertTriangle size={64} className="text-pink-300" />
					</div>
					<h3 className="text-xl font-bold text-white mb-3">
						Something went wrong
					</h3>
					<p className="text-pink-100 mb-6">{error}</p>
					<Button
						onClick={() => window.location.reload()}
						className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div
			id="main-content"
			className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8"
		>
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-10">
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
							Your Products
						</h1>
						<p className="text-pink-200">Manage your handcrafted creations</p>
					</div>
					<Link href="/dashboard/seller/products/new">
						<Button className="bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 py-2 px-5 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
							<Plus className="w-5 h-5" /> Add New Product
						</Button>
					</Link>
				</div>

				{products.length === 0 ? (
					<div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-10 border border-white/10 text-center">
						<div className="flex justify-center mb-6">
							<Package size={64} className="text-pink-300" />
						</div>
						<h3 className="text-xl font-bold text-white mb-3">
							No products yet
						</h3>
						<p className="text-pink-100 mb-6">
							Add your first product to start selling your handcrafted creations
						</p>
						<Link href="/dashboard/seller/products/new">
							<Button className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
								Add Product
							</Button>
						</Link>
					</div>
				) : (
					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{products.map((product) => (
							<div
								key={product.id}
								className="group bg-white/10 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border border-white/10 transition-all duration-300 hover:shadow-2xl hover:transform hover:scale-[1.02]"
							>
								<div className="h-60 overflow-hidden">
									<img
										src={product.image}
										alt={product.name}
										className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
										onError={(e) => {
											(e.target as HTMLImageElement).src =
												"https://via.placeholder.com/600x400?text=Product+Image";
										}}
									/>
								</div>
								<div className="p-6">
									<div className="flex justify-between items-start mb-3">
										<div>
											<h3 className="font-bold text-white text-xl">
												{product.name}
											</h3>
											<p className="text-pink-200 text-lg mt-1">
												${Number(product.price).toFixed(2)}
											</p>
										</div>
										<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600/40 text-indigo-100 backdrop-blur-sm">
											{product.category}
										</span>
									</div>
									<p className="text-pink-100 mt-3 mb-5 line-clamp-2">
										{product.description}
									</p>
									<div className="flex justify-between">
										<Link
											href={`/dashboard/seller/products/edit/${product.id}`}
										>
											<Button className="bg-indigo-600/40 hover:bg-indigo-500/40 text-white backdrop-blur-sm border border-indigo-400/20 transition duration-300 transform hover:scale-105">
												<Pencil className="h-4 w-4 mr-2" /> Edit
											</Button>
										</Link>
										<Button
											onClick={() => handleDelete(product.id)}
											className="bg-pink-600/40 hover:bg-pink-500/40 text-white backdrop-blur-sm border border-pink-400/20 transition duration-300 transform hover:scale-105"
										>
											<Trash className="h-4 w-4 mr-2" /> Delete
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
