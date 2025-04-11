'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
    Heart, 
    ShoppingCart, 
    Trash2, 
    AlertTriangle, 
    Loader2,
    ExternalLink
    } from 'lucide-react'
    import CustomerSidebar from '@/components/CustomerSidebar'
    import { Button } from '@/components/ui/Button'
    import { useNotification } from "@/contexts/NotificationContext"
    import { useCart } from "@/contexts/CartContext"

    interface SavedProduct {
    id: string
    productId: number
    name: string
    price: number
    image: string
    description: string
    category: string
    createdAt: string
    }

    export default function SavedProductsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { showNotification } = useNotification()
    const { addToCart: addProductToCart } = useCart()
    const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [addingToCart, setAddingToCart] = useState<number | null>(null)
    const [removing, setRemoving] = useState<string | null>(null)

    useEffect(() => {
        // Redirect if not logged in
        if (status === 'unauthenticated') {
        router.push('/login')
        return
        }
        
        // Redirect if not a customer
        if (session && session.user.role !== 'CUSTOMER') {
        router.push('/')
        return
        }

        const fetchSavedProducts = async () => {
        try {
            const response = await fetch('/api/customer/saved')
            
            if (!response.ok) {
            throw new Error('Failed to fetch saved products')
            }
            
            const data = await response.json()
            setSavedProducts(data)
        } catch (err) {
            console.error('Error fetching saved products:', err)
            setError('Failed to load your saved products. Please try again later.')
        } finally {
            setLoading(false)
        }
        }

        fetchSavedProducts()
    }, [session, status, router])

    const handleAddToCart = async (productId: number) => {
        setAddingToCart(productId)
        try {
        await addProductToCart({ id: productId }, 1)
        showNotification('Added to cart successfully!', 'success')
        } catch (err) {
        console.error('Error adding to cart:', err)
        showNotification('Failed to add product to cart. Please try again.', 'error')
        } finally {
        setAddingToCart(null)
        }
    }

    const removeFromSaved = async (savedId: string) => {
        setRemoving(savedId)
        try {
        const response = await fetch(`/api/customer/saved/${savedId}`, {
            method: 'DELETE',
        })

        if (!response.ok) {
            throw new Error('Failed to remove product from saved items')
        }

        // Remove the product from the state
        setSavedProducts(savedProducts.filter(item => item.id !== savedId))
        showNotification('Product removed from saved items', 'success')
        } catch (err) {
        console.error('Error removing product:', err)
        showNotification('Failed to remove product. Please try again.', 'error')
        } finally {
        setRemoving(null)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
        }).format(date)
    }

    if (status === 'loading' || loading) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
            <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Customer Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-1">
                <CustomerSidebar activePage="saved" />
                </div>
                
                {/* Main Content */}
                <div className="md:col-span-3 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10 flex items-center justify-center">
                <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 text-pink-400 mx-auto animate-spin" />
                    <p className="mt-4 text-lg text-white">Loading your saved products...</p>
                </div>
                </div>
            </div>
            </div>
        </div>
        )
    }

    if (status === 'unauthenticated' || (session && session.user.role !== 'CUSTOMER')) {
        return null // useEffect will handle the redirect
    }

    return (
        <div id="main-content" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Customer Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
                <CustomerSidebar activePage="saved" />
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-3 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Saved Products</h2>
                
                {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-white rounded-lg p-4 mb-6 flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
                )}
                
                {savedProducts.length === 0 && !error ? (
                <div className="bg-white/5 rounded-lg p-8 text-center border border-white/10">
                    <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No Saved Products</h3>
                    <p className="text-pink-200 mb-6">You haven't saved any products yet.</p>
                    <Button 
                    onClick={() => router.push('/products')}
                    className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300"
                    >
                    Explore Products
                    </Button>
                </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedProducts.map((product) => (
                    <div 
                        key={product.id} 
                        className="bg-white/5 rounded-lg border border-white/10 overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
                    >
                        <div className="h-48 overflow-hidden relative">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Product'
                            }}
                        />
                        <div 
                            className="absolute top-2 right-2 p-1.5 bg-pink-600 rounded-full text-white cursor-pointer hover:bg-pink-500 transition"
                            onClick={(e) => {
                            e.stopPropagation();
                            removeFromSaved(product.id);
                            }}
                        >
                            {removing === product.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                            <Trash2 className="w-5 h-5" />
                            )}
                        </div>
                        </div>
                        
                        <div className="p-4">
                        <h3 
                            className="text-white font-medium text-lg mb-1 hover:text-pink-300 cursor-pointer transition"
                            onClick={() => router.push(`/products/${product.productId}`)}
                        >
                            {product.name}
                        </h3>
                        
                        <p className="text-pink-400 font-medium mb-3">${Number(product.price).toFixed(2)}</p>
                        
                        <p className="text-pink-200 text-sm mb-4 line-clamp-2">
                            {product.description}
                        </p>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-pink-200">Saved on {formatDate(product.createdAt)}</span>
                            
                            <div className="flex space-x-2">
                            <button
                                className="p-2 text-pink-200 hover:text-white transition rounded-lg hover:bg-white/5"
                                onClick={() => router.push(`/products/${product.productId}`)}
                                title="View Product Details"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </button>
                            
                            <button
                                className="p-2 text-pink-200 hover:text-white transition rounded-lg hover:bg-white/5"
                                onClick={() => handleAddToCart(product.productId)}
                                disabled={addingToCart === product.productId}
                                aria-label="Add to cart"
                                title="Add to cart"
                            >
                                {addingToCart === product.productId ? (
                                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                                ) : (
                                    <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                                )}
                            </button>

                            </div>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
            </div>
        </div>
        </div>
    )
}