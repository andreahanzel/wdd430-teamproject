import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// DELETE /api/customer/saved/[id] - Remove a product from saved items
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const savedId = parseInt(params.id)

    if (isNaN(savedId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    // Find the saved product to ensure it belongs to the user and is a saved item (quantity 0)
    const savedProduct = await prisma.cartItem.findFirst({
      where: {
        id: savedId,
        userId: session.user.id,
        quantity: 0, // This indicates it's a saved product, not an actual cart item
      },
    })

    if (!savedProduct) {
      return NextResponse.json(
        { error: 'Saved product not found' },
        { status: 404 }
      )
    }

    // Delete the saved product
    await prisma.cartItem.delete({
      where: {
        id: savedId,
      },
    })

    return NextResponse.json({
      message: 'Product removed from saved items successfully',
    })
  } catch (error) {
    console.error('Error removing saved product:', error)
    return NextResponse.json(
      { error: 'Failed to remove product from saved items' },
      { status: 500 }
    )
  }
}