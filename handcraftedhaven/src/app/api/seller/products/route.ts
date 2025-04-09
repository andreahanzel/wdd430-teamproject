import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import fs from 'fs'
import path from 'path'

// GET all products for the current seller
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SELLER" || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Find seller
        const seller = await prisma.seller.findFirst({
            where: { contact: session.user.email }
        })

        if (!seller) {
            return NextResponse.json(
                { error: "Seller profile not found" },
                { status: 404 }
            )
        }

        // Get all products for this seller
        const products = await prisma.product.findMany({
            where: { sellerId: seller.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(products)
    } catch (error) {
        console.error("Error fetching products:", error)
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
}

// POST create a new product
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SELLER" || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await req.formData()
        
        // Validate required fields
        const requiredFields = ['name', 'price', 'category']
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        // Find seller
        const seller = await prisma.seller.findFirst({
            where: { contact: session.user.email }
        })

        if (!seller) {
            return NextResponse.json(
                { error: "Seller profile not found" },
                { status: 404 }
            )
        }

        // Validate image file
        const imageFile = formData.get('image')
        if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
            return NextResponse.json(
                { error: "Product image is required" },
                { status: 400 }
            )
        }

        // Handle image upload
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }

        // Create unique filename
        const timestamp = Date.now()
        const filename = imageFile.name || "product-image.jpg"
        const ext = path.extname(filename)
        const uniqueFilename = `product-${timestamp}${ext}`
        const filePath = path.join(uploadsDir, uniqueFilename)

        // Save file
        await fs.promises.writeFile(filePath, buffer)

        // Create product with proper price handling
        const priceValue = parseFloat(formData.get('price') as string);
        if (isNaN(priceValue)) {
            return NextResponse.json(
                { error: "Invalid price value" },
                { status: 400 }
            )
        }

        // Try handling the ID issue with a similar approach as in the seller profile creation
        let product = null;
        let retryCount = 0;
        const maxRetries = 5;
        
        while (!product && retryCount < maxRetries) {
            try {
                // Find max ID
                const result = await prisma.$queryRaw`SELECT COALESCE(MAX(id), 0) as max_id FROM "Product"`;
                let maxId = 1;
                
                if (Array.isArray(result) && result.length > 0) {
                    // Extract max_id depending on database and result format
                    maxId = (result[0] as any).max_id + 1 || 1;
                }

                // Try to create with explicit ID
                product = await prisma.product.create({
                    data: {
                        id: maxId,
                        name: formData.get('name') as string,
                        description: formData.get('description') as string || "",
                        price: priceValue,
                        image: `/uploads/${uniqueFilename}`,
                        category: formData.get('category') as string,
                        color: formData.get('color') as string || null,
                        material: formData.get('material') as string || null,
                        sellerId: seller.id
                    }
                });
            } catch (createError) {
                console.error(`Product creation attempt ${retryCount + 1} failed:`, createError);
                retryCount++;
            }
        }

        if (!product) {
            throw new Error("Failed to create product after multiple attempts");
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error("Error creating product:", error)
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
}