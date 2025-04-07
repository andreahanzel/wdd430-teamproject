"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import {
	getProducts,
	getCategories,
	getProductProperties,
	ProductFilter,
} from "@/services/productServices";
import { Product } from "@/types/database";

export default function ProductsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
	const [selectedColors, setSelectedColors] = useState<string[]>([]);
	const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<string[]>(["All"]);
	const [allColors, setAllColors] = useState<string[]>([]);
	const [allMaterials, setAllMaterials] = useState<string[]>([]);

	// Fetch categories, colors, and materials on initial load
	useEffect(() => {
		async function loadFilterOptions() {
			try {
				const categoriesList = await getCategories();
				setCategories(categoriesList);

				const { colors, materials } = await getProductProperties();
				setAllColors(colors);
				setAllMaterials(materials);
			} catch (error) {
				console.error("Error loading filter options:", error);
			}
		}

		loadFilterOptions();
	}, []);

	// Fetch products based on filters
	useEffect(() => {
		async function loadProducts() {
			setIsLoading(true);

			try {
				const filters: ProductFilter = {
					category: selectedCategory === "All" ? undefined : selectedCategory,
					searchTerm: searchTerm || undefined,
					minPrice: priceRange[0],
					maxPrice: priceRange[1],
					colors: selectedColors.length > 0 ? selectedColors : undefined,
					materials:
						selectedMaterials.length > 0 ? selectedMaterials : undefined,
				};

				const productsList = await getProducts(filters);
				setProducts(productsList);
			} catch (error) {
				console.error("Error loading products:", error);
			} finally {
				setIsLoading(false);
			}
		}

		// Add a small delay to avoid too many queries while typing
		const timer = setTimeout(() => {
			loadProducts();
		}, 300);

		return () => clearTimeout(timer);
	}, [
		searchTerm,
		selectedCategory,
		priceRange,
		selectedColors,
		selectedMaterials,
	]);

	const handleColorChange = (color: string) => {
		setSelectedColors((prev) =>
			prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
		);
	};

	const handleMaterialChange = (material: string) => {
		setSelectedMaterials((prev) =>
			prev.includes(material)
				? prev.filter((m) => m !== material)
				: [...prev, material]
		);
	};

	const resetFilters = () => {
		setSearchTerm("");
		setSelectedCategory("All");
		setPriceRange([0, 200]);
		setSelectedColors([]);
		setSelectedMaterials([]);
	};

	return (
		<section className="py-16 bg-gradient-to-b from-white to-gray-50">
			<div className="container mx-auto px-4">
				{/* Heading with underline effect */}
				<div className="text-center mb-16">
					<h1 className="text-4xl font-bold font-poppins text-darkPurple mb-2 relative inline-block">
						Discover Our Handcrafted Products
						<span className="absolute left-0 w-full h-1 bg-gradient-to-r from-electricBlue to-neonPink bottom-[-8px]"></span>
					</h1>
					<p className="text-gray-600 mt-3 max-w-2xl mx-auto">
						Explore our collection of unique items made with passion and skill
						by talented artisans.
					</p>
				</div>

				{/* Enhanced Search and Filter UI */}
				<div className="bg-white dark:bg-backgroundDark/90 rounded-xl shadow-lg p-6 mb-12 border border-gray-100 dark:border-gray-800">
					{/* Main Search and Filter Controls */}
					<div className="flex flex-col md:flex-row md:items-center gap-6">
						{/* Search with icon and animation */}
						<div className="flex-1 group">
							<label htmlFor="product-search" className="sr-only">
								Search products
							</label>
							<div className="relative">
								<input
									type="text"
									id="product-search"
									placeholder="Search by name or description..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full px-4 py-3 pl-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 
                            focus:ring-2 focus:ring-electricBlue dark:focus:ring-neonPink focus:border-transparent 
                            transition-all duration-300 dark:text-gray-100"
									aria-label="Search products by name or description"
								/>
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 text-gray-400 group-focus-within:text-electricBlue dark:group-focus-within:text-neonPink transition-colors duration-300"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</div>
								{searchTerm && (
									<button
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
										onClick={() => setSearchTerm("")}
										aria-label="Clear search"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								)}
							</div>
						</div>

						{/* Category Filter with styled select */}
						<div className="md:w-1/4">
							<label htmlFor="category-filter" className="sr-only">
								Filter by category
							</label>
							<div className="relative">
								<select
									id="category-filter"
									aria-label="Filter products by category"
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									className="appearance-none w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 
                            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
                            focus:ring-2 focus:ring-electricBlue dark:focus:ring-neonPink focus:border-transparent
                            transition-all duration-300"
								>
									{categories.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
								<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
									<svg
										className="h-5 w-5 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 011.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>

					{/* Advanced Filters Toggle - Styled version */}
					{showAdvancedFilters ? (
						<button
							type="button"
							onClick={() => setShowAdvancedFilters(false)}
							className="mt-6 flex items-center text-sm font-medium bg-electricBlue/10 dark:bg-electricBlue/20 
                        text-electricBlue dark:text-electricBlue hover:bg-electricBlue/20 dark:hover:bg-electricBlue/30
                        rounded-full px-4 py-2 transition-all duration-300"
							aria-expanded="true"
							aria-controls="advanced-filters"
						>
							Hide Advanced Filters
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 ml-1 transition-transform rotate-180"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									d="M5.293 7.293a1 1 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
					) : (
						<button
							type="button"
							onClick={() => setShowAdvancedFilters(true)}
							className="mt-6 flex items-center text-sm font-medium border border-electricBlue/30 dark:border-electricBlue/20
                        text-electricBlue dark:text-electricBlue hover:bg-electricBlue/10 dark:hover:bg-electricBlue/20
                        rounded-full px-4 py-2 transition-all duration-300"
							aria-expanded="false"
							aria-controls="advanced-filters"
						>
							Show Advanced Filters
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 ml-1 transition-transform"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									d="M5.293 7.293a1 1 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
					)}

					{/* Advanced Filters Section - Enhanced version */}
					<div
						id="advanced-filters"
						className={`overflow-hidden transition-all duration-500 ease-in-out ${
							showAdvancedFilters
								? "max-h-[800px] opacity-100"
								: "max-h-0 opacity-0"
						}`}
					>
						{/* Price Range Filter - Enhanced */}
						<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Price Range
							</label>
							<div className="flex justify-between mb-2">
								<span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
									Min:{" "}
									<span className="font-medium text-electricBlue dark:text-neonPink">
										${priceRange[0]}
									</span>
								</span>
								<span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
									Max:{" "}
									<span className="font-medium text-electricBlue dark:text-neonPink">
										${priceRange[1]}
									</span>
								</span>
							</div>
							<div className="space-y-4 px-1">
								<div>
									<label htmlFor="min-price" className="sr-only">
										Minimum price
									</label>
									<input
										type="range"
										id="min-price"
										min="0"
										max="200"
										value={priceRange[0]}
										onChange={(e) =>
											setPriceRange([parseInt(e.target.value), priceRange[1]])
										}
										className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer 
                              accent-electricBlue dark:accent-neonPink"
										aria-label="Minimum price slider"
									/>
								</div>
								<div>
									<label htmlFor="max-price" className="sr-only">
										Maximum price
									</label>
									<input
										type="range"
										id="max-price"
										min="0"
										max="200"
										value={priceRange[1]}
										onChange={(e) =>
											setPriceRange([priceRange[0], parseInt(e.target.value)])
										}
										className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer 
                              accent-electricBlue dark:accent-neonPink"
										aria-label="Maximum price slider"
									/>
								</div>
							</div>
						</div>

						{/* Color Filter - Styled version */}
						<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
							<fieldset>
								<legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Colors
								</legend>
								<div className="flex flex-wrap gap-2">
									{allColors.map((color) => (
										<button
											key={color}
											type="button"
											onClick={() => handleColorChange(color)}
											className={`px-4 py-1.5 text-xs rounded-full border-2 transition-all duration-300 ${
												selectedColors.includes(color)
													? "bg-electricBlue text-white border-electricBlue shadow-md shadow-electricBlue/20"
													: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-electricBlue dark:hover:border-neonPink"
											}`}
											aria-label={`${color} color filter ${
												selectedColors.includes(color) ? "active" : "inactive"
											}`}
										>
											{color}
										</button>
									))}
								</div>
							</fieldset>
						</div>

						{/* Material Filter - Styled version */}
						<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
							<fieldset>
								<legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Materials
								</legend>
								<div className="flex flex-wrap gap-2">
									{allMaterials.map((material) => (
										<button
											key={material}
											type="button"
											onClick={() => handleMaterialChange(material)}
											className={`px-4 py-1.5 text-xs rounded-full border-2 transition-all duration-300 ${
												selectedMaterials.includes(material)
													? "bg-neonPink text-white border-neonPink shadow-md shadow-neonPink/20"
													: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-neonPink dark:hover:border-neonPink"
											}`}
											aria-label={`${material} material filter ${
												selectedMaterials.includes(material)
													? "active"
													: "inactive"
											}`}
										>
											{material}
										</button>
									))}
								</div>
							</fieldset>
						</div>
					</div>

					{/* Reset Filters Button - Enhanced */}
					<div className="mt-6 flex justify-end">
						<button
							onClick={resetFilters}
							className="text-sm font-medium flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 
                        hover:text-neonPink dark:hover:text-neonPink hover:bg-neonPink/5 dark:hover:bg-neonPink/10 
                        rounded-lg transition-all duration-300"
							aria-label="Reset all filters"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 mr-1"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M4 2a1 1 011 1v2.101a7.002 7.002 0111.601 2.566 1 1 011-1.885.666A5.002 5.002 005.999 7H9a1 1 010 2H4a1 1 01-1-1V3a1 1 011-1zm.008 9.057a1 1 011.276.61A5.002 5.002 0014.001 13H11a1 1 110-2h5a1 1 011 1v5a1 1 11-2 0v-2.101a7.002 7.002 0111.601-2.566 1 1 01.61-1.276z"
									clipRule="evenodd"
								/>
							</svg>
							Reset All Filters
						</button>
					</div>
				</div>

				{/* Product count and result info */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<p className="text-gray-600">
							Showing{" "}
							<span className="font-medium text-darkPurple">
								{products.length}
							</span>{" "}
							products
							{selectedCategory !== "All" && (
								<span>
									{" "}
									in{" "}
									<span className="font-medium text-darkPurple">
										{selectedCategory}
									</span>
								</span>
							)}
						</p>
						{(selectedColors.length > 0 ||
							selectedMaterials.length > 0 ||
							priceRange[0] > 0 ||
							priceRange[1] < 200) && (
							<div className="flex flex-wrap gap-2 mt-2">
								{selectedColors.length > 0 && (
									<span className="text-xs bg-electricBlue/10 text-electricBlue px-2 py-1 rounded-full">
										Colors: {selectedColors.join(", ")}
									</span>
								)}
								{selectedMaterials.length > 0 && (
									<span className="text-xs bg-neonPink/10 text-neonPink px-2 py-1 rounded-full">
										Materials: {selectedMaterials.join(", ")}
									</span>
								)}
								{(priceRange[0] > 0 || priceRange[1] < 200) && (
									<span className="text-xs bg-darkPurple/10 text-darkPurple px-2 py-1 rounded-full">
										Price: ${priceRange[0]} - ${priceRange[1]}
									</span>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Loading State */}
				{isLoading ? (
					<div className="flex justify-center items-center py-20">
						<div
							className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-electricBlue"
							aria-label="Loading products"
						></div>
					</div>
				) : products.length === 0 ? (
					<div className="text-center py-16 bg-white rounded-xl shadow">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-16 w-16 mx-auto text-gray-300 mb-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1}
								d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 100 4 2 2 000-4zm-8 2a2 2 114 0 0 2 2 0z"
							/>
						</svg>
						<h3 className="text-xl font-semibold text-gray-700 mb-2">
							No products found
						</h3>
						<p className="text-gray-500 mb-6">
							Try adjusting your search or filter criteria
						</p>
						<button
							onClick={resetFilters}
							className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-pink-700 transition-colors"
							aria-label="Reset all filters"
						>
							Reset Filters
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
						{products.map((product) => (
							<div key={product.id} className="animate-fadeIn">
								<ProductCard product={product} />
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
