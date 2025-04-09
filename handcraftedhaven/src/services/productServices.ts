import { Product } from "../types/database";

export type ProductFilter = {
	category?: string;
	searchTerm?: string;
	minPrice?: number;
	maxPrice?: number;
	colors?: string[];
	materials?: string[];
};

export async function getProducts(
	filter: ProductFilter = {}
): Promise<Product[]> {
	try {
		// Build URL with query parameters
		const url = new URL("/api/products", window.location.origin);

		if (filter.category && filter.category !== "All") {
			url.searchParams.append("category", filter.category);
		}

		if (filter.searchTerm) {
			url.searchParams.append("searchTerm", filter.searchTerm);
		}

		if (filter.minPrice !== undefined) {
			url.searchParams.append("minPrice", filter.minPrice.toString());
		}

		if (filter.maxPrice !== undefined) {
			url.searchParams.append("maxPrice", filter.maxPrice.toString());
		}

		if (filter.colors && filter.colors.length > 0) {
			url.searchParams.append("colors", filter.colors.join(","));
		}

		if (filter.materials && filter.materials.length > 0) {
			url.searchParams.append("materials", filter.materials.join(","));
		}

		const response = await fetch(url.toString());

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const products = await response.json();

		// Ensure prices are handled as numbers
		return products.map((product: any) => ({
			...product,
			price: Number(product.price),
		}));
	} catch (error) {
		console.error("Error fetching products:", error);
		return [];
	}
}

export async function getProductById(id: number): Promise<Product | null> {
	try {
		const response = await fetch(`/api/products/${id}`);

		if (!response.ok) {
			if (response.status === 404) return null;
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const product = await response.json();

		// Convert price to number
		return {
			...product,
			price: Number(product.price),
		};
	} catch (error) {
		console.error(`Error fetching product with id ${id}:`, error);
		return null;
	}
}

export async function getFeaturedProducts(
	limit: number = 3
): Promise<Product[]> {
	try {
		const response = await fetch(`/api/products/featured?limit=${limit}`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const products = await response.json();

		// Convert prices to numbers
		return products.map((product: any) => ({
			...product,
			price: Number(product.price),
		}));
	} catch (error) {
		console.error("Error fetching featured products:", error);
		return [];
	}
}

export async function getCategories(): Promise<string[]> {
	try {
		const response = await fetch("/api/products/categories");

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching categories:", error);
		return ["All"];
	}
}

export async function getProductProperties() {
	try {
		const response = await fetch("/api/products/properties");

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching product properties:", error);
		return { colors: [], materials: [] };
	}
}
