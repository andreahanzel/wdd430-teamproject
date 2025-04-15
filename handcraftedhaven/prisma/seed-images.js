const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

/**
 * Recursively get all image files from a directory
 */
function getImageFiles(dir) {
	let results = [];
	const list = fs.readdirSync(dir);

	list.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat && stat.isDirectory()) {
			// Recurse into subdirectory
			results = results.concat(getImageFiles(filePath));
		} else {
			// Check if file is an image
			const ext = path.extname(file).toLowerCase();
			if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
				results.push(filePath);
			}
		}
	});

	return results;
}

/**
 * Format the image name from filename with special formatting rules:
 * - Replace hyphens with spaces
 * - Capitalize the first letter of each word
 * - Add a space before any number in the name
 */
function formatImageName(filename) {
	// Remove file extension and replace hyphens and underscores with spaces
	let name = path
		.basename(filename, path.extname(filename))
		.replace(/[-_]/g, " ");

	// Insert a space before any number
	name = name.replace(/([a-zA-Z])(\d)/g, "$1 $2");

	// Capitalize first letter of each word
	return name.replace(/\b\w/g, (char) => char.toUpperCase());
}

async function seedImages() {
	try {
		console.log("Starting image seeding process...");

		// Get the base public directory path
		const publicDir = path.join(process.cwd(), "public");
		const imagesDir = path.join(publicDir, "images", "products");

		// Check if the directory exists
		if (!fs.existsSync(imagesDir)) {
			console.log(`Creating images directory: ${imagesDir}`);
			fs.mkdirSync(imagesDir, { recursive: true });
		}

		console.log(`Scanning directory: ${imagesDir}`);
		const imagePaths = getImageFiles(imagesDir);
		console.log(`Found ${imagePaths.length} images`);

		// Clear existing records
		await prisma.productImage.deleteMany({});

		for (const fullPath of imagePaths) {
			// Convert to relative path for storage (relative to public directory)
			const relativePath = fullPath.replace(publicDir, "");
			// Use forward slashes for web paths regardless of OS
			const webPath = relativePath.replace(/\\/g, "/");

			// Format the image name with special rules
			const fileName = formatImageName(path.basename(fullPath));

			// Try to determine category from path
			const pathParts = fullPath.split(path.sep);
			const categoryIndex =
				pathParts.findIndex((part) => part === "products") + 1;
			const category =
				categoryIndex < pathParts.length - 1
					? pathParts[categoryIndex]
					: "Other";
			const formattedCategory =
				category !== "products"
					? category.charAt(0).toUpperCase() + category.slice(1)
					: "Other";

			console.log(`Adding image: ${webPath} as "${fileName}"`);

			await prisma.productImage.create({
				data: {
					path: webPath,
					name: fileName,
					category: formattedCategory,
					description: `Product image: ${fileName}`,
				},
			});
		}

		console.log("Image seeding completed successfully");
	} catch (error) {
		console.error("Error seeding images:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Run the script if executed directly
if (require.main === module) {
	seedImages()
		.then(() => console.log("Seeding complete"))
		.catch((e) => {
			console.error("Error during seeding:", e);
			process.exit(1);
		});
}

// Export for programmatic usage
module.exports = { seedImages };
