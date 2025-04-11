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
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if the product is already saved (as a CartItem with quantity 0)
    const existingSavedProduct = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        quantity: 0, // This indicates a saved product
      },
    })

    if (existingSavedProduct) {
      return NextResponse.json(
        { error: 'Product already saved' },
        { status: 400 }
      )
    }

    // Add to saved products as a CartItem with quantity 0
    const savedProduct = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        quantity: 0, // This indicates a saved product, not an actual cart item
      },
    })

    return NextResponse.json({
      message: 'Product saved successfully',
      savedProduct,
    })
  } catch (error) {
    console.error('Error saving product:', error)
    return NextResponse.json(
      { error: 'Failed to save product' },
      { status: 500 }
    )
  }
}