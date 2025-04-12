import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'


// GET /api/customer/saved - Get all saved products for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all cart items with quantity 0 (these are saved items)
    const savedProducts = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
        quantity: 0, // This indicates a saved product, not an actual cart item
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format the response
    const formattedSavedProducts = savedProducts.map(item => ({
      id: item.id.toString(),
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      description: item.product.description,
      image: item.product.image,
      category: item.product.category,
      createdAt: item.createdAt,
    }))

    return NextResponse.json(formattedSavedProducts)
  } catch (error) {
    console.error('Error fetching saved products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved products' },
      { status: 500 }
    )
  }
}

// POST /api/customer/saved - Add a product to saved items
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to save products'
        }, 
        { status: 401 }
      );
    }

    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Forbidden',
          message: 'Only customers can save products'
        }, 
        { status: 403 }
      );
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing productId',
          message: 'Product ID is required'
        }, 
        { status: 400 }
      );
    }

    // Validate productId is a number
    if (isNaN(Number(productId))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid productId',
          message: 'Product ID must be a number'
        }, 
        { status: 400 }
      );
    }

    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Product not found',
          message: 'The specified product does not exist'
        }, 
        { status: 404 }
      );
    }

    // Check if already saved
    const existingSavedItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId: Number(productId),
        quantity: 0,
      },
    });

    if (existingSavedItem) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Product already saved',
          message: 'This product is already in your saved items'
        }, 
        { status: 409 } // 409 Conflict
      );
    }

    // Create saved item
    const savedProduct = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId: Number(productId),
        quantity: 0,
      },
      select: {
        id: true,
        productId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product saved successfully',
      data: {
        savedProduct: {
          id: savedProduct.id,
          productId: savedProduct.productId,
          createdAt: savedProduct.createdAt,
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving product:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while saving the product'
      },
      { status: 500 }
    );
  }
}