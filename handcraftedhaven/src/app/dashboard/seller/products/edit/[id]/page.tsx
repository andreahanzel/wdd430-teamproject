"use client";

import { use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
	AlertTriangle,
	ArrowLeft,
	Save,
	Image as ImageIcon,
} from "lucide-react";
import { getProductImages } from "@/services/imageServices";

interface ProductImage {
	id: number;
	path: string;
	name: string;
	category: string | null;
}

export default function EditProductPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: productId } = use(params);

	const { data: session } = useSession();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [product, setProduct] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [availableImages, setAvailableImages] = useState<ProductImage[]>([]);
	const [selectedLibraryImage, setSelectedLibraryImage] = useState<string>("");

	useEffect(() => {
		if (!session || session.user.role !== "SELLER") {
			router.push("/");
			return;
		}

		const loadData = async () => {
			try {
				const productRes = await fetch(`/api/seller/products/${productId}`);

				if (productRes.status === 404) {
					setError("Product not found");
					setLoading(false);
					return;
				}

				if (!productRes.ok) {
					throw new Error("Failed to fetch product");
				}

				const productData = await productRes.json();
				setProduct(productData);
				setImagePreview(productData.image);
				setSelectedLibraryImage(productData.image);

				const images = await getProductImages();
				setAvailableImages(images);
			} catch (error) {
				console.error("Error loading data:", error);
				setError("Failed to load product data");
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [session, router, productId]);

	const handleLibraryImageSelect = (imagePath: string) => {
		setSelectedLibraryImage(imagePath);
		setImagePreview(imagePath);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		formData.delete("id");

		if (selectedLibraryImage) {
			formData.append("imagePath", selectedLibraryImage);
		} else {
			formData.append("imagePath", product.image);
		}

		try {
			const response = await fetch(`/api/seller/products/${productId}`, {
				method: "PUT",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update product");
			}

			router.push("/dashboard/seller/products");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update product");
			console.error("Error updating product:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div
				id="main-content"
				className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-8"
			>
				<div className="max-w-4xl w-full mx-auto">
					<div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-white/10 animate-pulse">
						<div className="h-8 bg-white/20 rounded-lg w-1/3 mb-10"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
							<div className="space-y-6">
								<div className="h-6 bg-white/20 rounded-lg w-1/2 mb-2"></div>
								<div className="h-12 bg-white/20 rounded-lg mb-6"></div>
								<div className="h-6 bg-white/20 rounded-lg w-1/2 mb-2"></div>
								<div className="h-32 bg-white/20 rounded-lg mb-6"></div>
							</div>
							<div className="space-y-6">
								<div className="h-6 bg-white/20 rounded-lg w-1/2 mb-2"></div>
								<div className="h-12 bg-white/20 rounded-lg mb-6"></div>
								<div className="h-6 bg-white/20 rounded-lg w-1/2 mb-2"></div>
								<div className="h-12 bg-white/20 rounded-lg mb-6"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error === "Product not found" || !product) {
		return (
			<div
				id="main-content"
				className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8"
			>
				<div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-10 border border-white/10 text-center">
					<div className="flex justify-center mb-6">
						<AlertTriangle size={64} className="text-pink-300" />
					</div>
					<h3 className="text-xl font-bold text-white mb-3">
						Product Not Found
					</h3>
					<p className="text-pink-100 mb-6">
						The product you're trying to edit could not be found.
					</p>
					<Button
						variant="primary"
						onClick={() => router.push("/dashboard/seller/products")}
						className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
					>
						Back to Products
					</Button>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				id="main-content"
				className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-8"
			>
				<div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-10 border border-white/10 text-center">
					<div className="flex justify-center mb-6">
						<AlertTriangle size={64} className="text-pink-300" />
					</div>
					<h3 className="text-xl font-bold text-white mb-3">
						Something Went Wrong
					</h3>
					<p className="text-pink-100 mb-6">{error}</p>
					<Button
						variant="primary"
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
			<div className="max-w-4xl mx-auto">
				<button
					onClick={() => router.back()}
					className="flex items-center text-pink-200 hover:text-white mb-6 transition duration-300"
				>
					<ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
				</button>

				<div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-white/10">
					<h1 className="text-3xl font-bold text-white mb-8">Edit Product</h1>

					{error && (
						<div className="mb-8 p-4 bg-pink-600/40 border border-pink-400/30 text-white rounded-lg">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} encType="multipart/form-data">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
							<div className="space-y-6">
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-pink-200 mb-2"
									>
										Product Name *
									</label>
									<input
										type="text"
										id="name"
										name="name"
										defaultValue={product.name}
										required
										className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
									/>
								</div>

								<div>
									<label
										htmlFor="description"
										className="block text-sm font-medium text-pink-200 mb-2"
									>
										Description *
									</label>
									<textarea
										id="description"
										name="description"
										rows={4}
										defaultValue={product.description}
										required
										className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
									/>
								</div>

								<div>
									<label
										htmlFor="price"
										className="block text-sm font-medium text-pink-200 mb-2"
									>
										Price *
									</label>
									<input
										type="number"
										id="price"
										name="price"
										step="0.01"
										min="0"
										defaultValue={Number(product.price)}
										required
										className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
									/>
								</div>
							</div>

							<div className="space-y-6">
								<div>
									<label
										htmlFor="category"
										className="block text-sm font-medium text-pink-200 mb-2"
									>
										Category *
									</label>
									<select
										id="category"
										name="category"
										defaultValue={product.category}
										required
										className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
									>
										<option value="">Select a category</option>
										<option value="Home Decor">Home Decor</option>
										<option value="Jewelry">Jewelry</option>
										<option value="Clothing">Clothing</option>
										<option value="Art">Art</option>
										<option value="Furniture">Furniture</option>
										<option value="Other">Other</option>
									</select>
								</div>

								<div>
									<label
										htmlFor="color"
										className="block text-sm font-medium text-pink-200 mb-2"
									>
										Color
									</label>
									<input
										type="text"
										id="color"
										name="color"
										defaultValue={product.color || ""}
										className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
									/>
								</div>

								<div>
									<label
										htmlFor="material"
										className="block text-sm font-medium text-pink-200 mb-2"
									>
										Material
									</label>
									<input
										type="text"
										id="material"
										name="material"
										defaultValue={product.material || ""}
										className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
									/>
								</div>
							</div>
						</div>

						<div className="mt-10">
							<span className="block text-sm font-medium text-pink-200 mb-2">
								Product Image *
							</span>

							<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
								{imagePreview ? (
									<div className="relative group w-32 h-32 rounded-xl overflow-hidden border-2 border-white/20">
										<img
											src={imagePreview}
											alt="Product preview"
											className="w-full h-full object-cover"
											onError={(e) => {
												(e.target as HTMLImageElement).src =
													"https://via.placeholder.com/160?text=Product";
											}}
										/>
									</div>
								) : (
									<div className="w-32 h-32 flex items-center justify-center bg-white/5 border-2 border-white/20 border-dashed rounded-xl">
										<ImageIcon className="w-8 h-8 text-pink-300/50" />
									</div>
								)}
							</div>
						</div>

						<div className="mt-10 flex justify-end space-x-4">
							<button
								type="button"
								onClick={() => router.push("/dashboard/seller/products")}
								className="px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition duration-300"
							>
								Cancel
							</button>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
							>
								<Save className="w-5 h-5" />
								{isSubmitting ? "Updating..." : "Update Product"}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
