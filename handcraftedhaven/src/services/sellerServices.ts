import { Seller } from "../types/database";

// Helper function to format seller data (ensure prices are numbers)
const formatSeller = (seller: any): Seller => {
	return {
		...seller,
		products: seller.products?.map((product: any) => ({
			...product,
			price: Number(product.price),
		})),
	};
};

export async function getSellers(): Promise<Seller[]> {
	try {
		const response = await fetch("/api/sellers");

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const sellers = await response.json();
		return sellers.map(formatSeller);
	} catch (error) {
		console.error("Error fetching sellers:", error);
		return [];
	}
}

export async function getSellerById(id: number): Promise<Seller | null> {
	try {
		const response = await fetch(`/api/sellers/${id}`);

		if (!response.ok) {
			if (response.status === 404) return null;
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const seller = await response.json();
		return formatSeller(seller);
	} catch (error) {
		console.error(`Error fetching seller with id ${id}:`, error);
		return null;
	}
}
