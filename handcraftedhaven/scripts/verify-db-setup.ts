import { testDatabaseConnection } from "../src/utils/db-test";
import { getProducts, getCategories } from "../src/services/productServices";
import { getSellers } from "../src/services/sellerServices";
import { prisma } from "../prisma/client";

async function verifyDatabaseSetup() {
	console.log("Verifying database setup...");

	// Test basic connection
	const connectionTest = await testDatabaseConnection();
	console.log("Connection test:", connectionTest);

	if (!connectionTest.success) {
		console.error(
			"Database connection failed - cannot proceed with verification"
		);
		return;
	}

	// Test product retrieval
	console.log("\nTesting product retrieval...");
	const products = await getProducts();
	console.log(`Retrieved ${products.length} products`);
	if (products.length > 0) {
		console.log("Sample product:", products[0]);
	}

	// Test category retrieval
	console.log("\nTesting category retrieval...");
	const categories = await getCategories();
	console.log("Categories:", categories);

	// Test seller retrieval
	console.log("\nTesting seller retrieval...");
	const sellers = await getSellers();
	console.log(`Retrieved ${sellers.length} sellers`);
	if (sellers.length > 0) {
		console.log("Sample seller:", sellers[0].name);
	}

	console.log("\nVerification complete!");
}

// Run the verification
verifyDatabaseSetup()
	.catch(console.error)
	.finally(() => prisma.$disconnect());
