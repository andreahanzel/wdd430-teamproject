import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// POST handler to create a new seller profile
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SELLER" || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        
        // Validate required fields
        const requiredFields = ['name', 'shopName', 'location', 'bio'];
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Validate profile image exists
        const imageFile = formData.get('profileImage');
        if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
            return NextResponse.json(
                { error: "Profile image is required" },
                { status: 400 }
            );
        }

        // Check if seller already exists with the same email
        const existingSeller = await prisma.seller.findFirst({
            where: { contact: session.user.email }
        });

        if (existingSeller) {
            return NextResponse.json(
                { error: "Seller profile already exists" },
                { status: 400 }
            );
        }

        // Handle image upload
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Create unique filename
        const timestamp = Date.now();
        const filename = imageFile.name || "profile-image.jpg";
        const ext = path.extname(filename);
        const uniqueFilename = `seller-${timestamp}${ext}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        // Save file
        await fs.promises.writeFile(filePath, buffer);

        // Try approach 1: Use $executeRaw to bypass Prisma's automatic ID handling
        try {
            // Find max ID
            const result = await prisma.$queryRaw`SELECT COALESCE(MAX(id), 0) as max_id FROM "Seller"`;
            let maxId = 1;
            
            if (Array.isArray(result) && result.length > 0) {
                // Extract max_id depending on database and result format
                maxId = (result[0] as any).max_id + 1 || 1;
            }
            
            // Create seller with specific ID using direct SQL
            await prisma.$executeRaw`
                INSERT INTO "Seller" (
                    id, name, "shopName", "profileImage", location, rating, sales, bio, story, contact, "createdAt", "updatedAt"
                ) VALUES (
                    ${maxId}, 
                    ${formData.get('name') as string}, 
                    ${formData.get('shopName') as string}, 
                    ${`/uploads/${uniqueFilename}`}, 
                    ${formData.get('location') as string}, 
                    ${'0'}, 
                    ${'0'}, 
                    ${formData.get('bio') as string}, 
                    ${formData.get('story') as string || ''}, 
                    ${session.user.email}, 
                    ${new Date()}, 
                    ${new Date()}
                )
            `;
            
            // Fetch the created seller
            const seller = await prisma.seller.findFirst({
                where: { id: maxId }
            });
            
            if (!seller) {
                throw new Error("Failed to retrieve created seller profile");
            }
            
            return NextResponse.json(seller);
        } catch (sqlError) {
            console.error("Error with direct SQL approach:", sqlError);
            
            // Fallback to Prisma create with retry
            let seller = null;
            let retryCount = 0;
            const maxRetries = 5;
            
            while (!seller && retryCount < maxRetries) {
                try {
                    // Try creating with Prisma
                    seller = await prisma.seller.create({
                        data: {
                            name: formData.get('name') as string,
                            shopName: formData.get('shopName') as string,
                            profileImage: `/uploads/${uniqueFilename}`,
                            location: formData.get('location') as string,
                            rating: "0",
                            sales: "0",
                            bio: formData.get('bio') as string,
                            story: formData.get('story') as string || "",
                            contact: session.user.email,
                        }
                    });
                } catch (createError) {
                    if (createError instanceof PrismaClientKnownRequestError && createError.code === 'P2002') {
                        // If constraint error, try with manual ID
                        try {
                            // Get max ID and increment
                            const maxResult = await prisma.$queryRaw`SELECT MAX(id) as max_id FROM "Seller"`;
                            const maxId = Array.isArray(maxResult) && maxResult.length > 0 
                                ? (maxResult[0] as any).max_id || 0 
                                : 0;
                            
                            // Try with a specified ID
                            seller = await prisma.seller.create({
                                data: {
                                    id: maxId + retryCount + 1,
                                    name: formData.get('name') as string,
                                    shopName: formData.get('shopName') as string,
                                    profileImage: `/uploads/${uniqueFilename}`,
                                    location: formData.get('location') as string,
                                    rating: "0",
                                    sales: "0",
                                    bio: formData.get('bio') as string,
                                    story: formData.get('story') as string || "",
                                    contact: session.user.email,
                                }
                            });
                        } catch (retryError) {
                            console.error(`Retry attempt ${retryCount + 1} failed:`, retryError);
                        }
                    } else {
                        // If it's not a constraint error, rethrow
                        throw createError;
                    }
                }
                
                retryCount++;
            }
            
            if (!seller) {
                throw new Error("Failed to create seller profile after multiple attempts");
            }
            
            return NextResponse.json(seller);
        }

    } catch (error) {
        console.error("Error creating seller profile:", error);
        
        // Handle specific Prisma errors
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // This is a unique constraint violation
                return NextResponse.json(
                    { error: "A seller profile with this information already exists." },
                    { status: 400 }
                );
            }
        }
        
        return NextResponse.json(
            { error: "Failed to create seller profile", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// GET handler to fetch a seller profile
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SELLER" || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const seller = await prisma.seller.findFirst({
            where: { contact: session.user.email }
        });

        if (!seller) {
            return NextResponse.json(
                { error: "Seller profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(seller);
    } catch (error) {
        console.error("Error fetching seller profile:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// PUT handler to update an existing seller profile
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SELLER" || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();

        // Find the existing seller profile
        const existingSeller = await prisma.seller.findFirst({
            where: { contact: session.user.email }
        });

        if (!existingSeller) {
            return NextResponse.json(
                { error: "Seller profile not found" },
                { status: 404 }
            );
        }

        let profileImagePath = existingSeller.profileImage;

        // Handle image upload if a new one was provided
        const imageFile = formData.get('profileImage') as File | null;
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            try {
                const bytes = await imageFile.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Create uploads directory if it doesn't exist
                const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }

                // Create unique filename
                const timestamp = Date.now();
                const filename = imageFile.name || "profile-image.jpg";
                const ext = path.extname(filename);
                const uniqueFilename = `seller-${timestamp}${ext}`;
                const filePath = path.join(uploadsDir, uniqueFilename);

                // Save new file
                await fs.promises.writeFile(filePath, buffer);

                // Delete old file if it exists
                if (existingSeller.profileImage) {
                    try {
                        const oldFilePath = path.join(process.cwd(), 'public', existingSeller.profileImage);
                        if (fs.existsSync(oldFilePath)) {
                            fs.unlinkSync(oldFilePath);
                        }
                    } catch (deleteError) {
                        console.error("Error deleting old image:", deleteError);
                    }
                }

                profileImagePath = `/uploads/${uniqueFilename}`;
            } catch (imageError) {
                console.error("Error processing image:", imageError);
                return NextResponse.json(
                    { error: "Failed to process image" },
                    { status: 500 }
                );
            }
        }

        // Update the seller profile
        const updatedSeller = await prisma.seller.update({
            where: { id: existingSeller.id },
            data: {
                name: formData.get('name') as string,
                shopName: formData.get('shopName') as string,
                profileImage: profileImagePath,
                location: formData.get('location') as string,
                bio: formData.get('bio') as string,
                story: formData.get('story') as string || "",
                updatedAt: new Date(),
            }
        });

        return NextResponse.json(updatedSeller);

    } catch (error) {
        console.error("Error updating seller profile:", error);
        return NextResponse.json(
            { error: "Failed to update seller profile", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}