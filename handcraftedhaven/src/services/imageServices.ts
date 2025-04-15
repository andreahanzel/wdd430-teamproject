interface ProductImage {
	id: number;
	path: string;
	name: string;
	category: string | null;
	description: string | null;
}

export async function getProductImages(
	category?: string
): Promise<ProductImage[]> {
	try {
		const url = new URL("/api/product-images", window.location.origin);

		if (category) {
			url.searchParams.append("category", category);
		}

		const response = await fetch(url.toString());

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching product images:", error);
		return [];
	}
}
