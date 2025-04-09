import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import fs from 'fs'
import path from 'path'

// GET a single product
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER" || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
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

        // Get the product
        const product = await prisma.product.findFirst({
            where: { 
                id: parseInt(params.id),
                sellerId: seller.id 
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error("Error fetching product:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

// PUT update a product
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER" || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        
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

        // Get current product
        const currentProduct = await prisma.product.findFirst({
            where: { 
                id: parseInt(params.id),
                sellerId: seller.id 
            }
        })

        if (!currentProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            )
        }

        let imagePath = currentProduct.image

        // Handle image upload if a new one was provided
        const imageFile = formData.get('image') as File | null
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            try {
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

                // Save new file
                await fs.promises.writeFile(filePath, buffer)

                // Delete old file if it exists and it's not a default image
                if (currentProduct.image && !currentProduct.image.includes('placeholder')) {
                    try {
                        const oldFilePath = path.join(process.cwd(), 'public', currentProduct.image)
                        if (fs.existsSync(oldFilePath)) {
                            fs.unlinkSync(oldFilePath)
                        }
                    } catch (deleteError) {
                        console.error("Error deleting old image:", deleteError)
                        // Continue even if old file deletion fails
                    }
                }

                imagePath = `/uploads/${uniqueFilename}`
            } catch (imageError) {
                console.error("Error processing image:", imageError)
                return NextResponse.json(
                    { error: "Failed to process image" },
                    { status: 500 }
                )
            }
        }

        // Parse price with proper error handling
        const priceValue = parseFloat(formData.get('price') as string)
        if (isNaN(priceValue)) {
            return NextResponse.json(
                { error: "Invalid price value" },
                { status: 400 }
            )
        }

        // Update product
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(params.id) },
            data: {
                name: formData.get('name') as string,
                description: formData.get('description') as string || "",
                price: priceValue,
                image: imagePath,
                category: formData.get('category') as string,
                color: formData.get('color') as string || null,
                material: formData.get('material') as string || null,
            }
        })

        return NextResponse.json(updatedProduct)

    } catch (error) {
        console.error("Error updating product:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

// DELETE a product
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER" || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
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

        // Get the product to delete (to remove its image)
        const product = await prisma.product.findFirst({
            where: { 
                id: parseInt(params.id),
                sellerId: seller.id 
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            )
        }

        // Delete the product
        await prisma.product.delete({
            where: { id: parseInt(params.id) }
        })

        // Delete the associated image file if it exists and it's not a default image
        if (product.image && !product.image.includes('placeholder')) {
            try {
                const filePath = path.join(process.cwd(), 'public', product.image)
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
            } catch (deleteError) {
                console.error("Error deleting product image:", deleteError)
                // Continue even if image deletion fails
            }
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error deleting product:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}