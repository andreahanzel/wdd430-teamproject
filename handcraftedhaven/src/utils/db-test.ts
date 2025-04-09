import { prisma } from "../../prisma/client";

export async function testDatabaseConnection() {
	try {
		// Simple query to test if database is connected
		const productCount = await prisma.product.count();
		const sellerCount = await prisma.seller.count();

		console.log(
			`Database connection successful. Found ${productCount} products and ${sellerCount} sellers.`
		);
		return {
			success: true,
			productCount,
			sellerCount,
		};
	} catch (error) {
		console.error("Database connection failed:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

// Run this function if this file is executed directly (for testing)
if (require.main === module) {
	testDatabaseConnection()
		.then((result) => console.log(result))
		.catch((err) => console.error(err))
		.finally(() => prisma.$disconnect());
}
