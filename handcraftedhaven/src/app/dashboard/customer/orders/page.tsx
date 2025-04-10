'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
    Package, 
    Clock, 
    ChevronDown, 
    ChevronUp, 
    ExternalLink,
    AlertTriangle,
    Loader2
    } from 'lucide-react'
    import CustomerSidebar from '@/components/CustomerSidebar'
    import { Button } from '@/components/ui/Button'
    import { getUserOrders } from '@/services/orderServices' // Use existing service function

    interface OrderItem {
    id: string
    productId: string
    name: string
    price: number
    quantity: number
    image: string
    }

    interface Order {
    id: string
    createdAt: string
    status: string
    total: number
    items: OrderItem[]
    address: {
        street: string
        city: string
        state: string
        postalCode: string
        country: string
    }
    }

    export default function OrdersPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

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

        const fetchOrders = async () => {
        try {
            // Use the existing service function that calls /api/orders
            const ordersData = await getUserOrders()
            
            // Format the orders for display
            const formattedOrders = ordersData
            .filter((order: any) => !['PROFILE_ADDRESS', 'PROFILE_PAYMENT', 'CONTACT_MESSAGE'].includes(order.status))
            .map((order: any) => {
                // Create formatted order items
                const items = order.orderItems ? order.orderItems.map((item: any) => ({
                id: item.id.toString(),
                productId: item.productId.toString(),
                name: item.product?.name || 'Product',
                price: Number(item.price),
                quantity: item.quantity,
                image: item.product?.image || '/placeholder.jpg',
                })) : [];

                // Extract address info
                const address = order.shippingAddress || {};

                return {
                id: order.id.toString(),
                createdAt: order.createdAt,
                status: order.status,
                total: Number(order.totalAmount),
                items,
                address: {
                    street: address.street || '',
                    city: address.city || '',
                    state: address.state || '',
                    postalCode: address.postalCode || '',
                    country: address.country || '',
                }
                };
            });

            setOrders(formattedOrders)
        } catch (err) {
            console.error('Error fetching orders:', err)
            setError('Failed to load your order history. Please try again later.')
        } finally {
            setLoading(false)
        }
        }

        fetchOrders()
    }, [session, status, router])

    const toggleOrderDetails = (orderId: string) => {
        if (expandedOrderId === orderId) {
        setExpandedOrderId(null)
        } else {
        setExpandedOrderId(orderId)
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
        case 'processing':
            return 'bg-blue-500'
        case 'shipped':
            return 'bg-indigo-500'
        case 'delivered':
            return 'bg-green-500'
        case 'cancelled':
            return 'bg-red-500'
        default:
            return 'bg-gray-500'
        }
    }

    if (status === 'loading' || loading) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
            <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Customer Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-1">
                <CustomerSidebar activePage="orders" />
                </div>
                
                {/* Main Content */}
                <div className="md:col-span-3 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10 flex items-center justify-center">
                <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 text-pink-400 mx-auto animate-spin" />
                    <p className="mt-4 text-lg text-white">Loading your orders...</p>
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
                <CustomerSidebar activePage="orders" />
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-3 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>
                
                {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-white rounded-lg p-4 mb-6 flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
                )}
                
                {orders.length === 0 && !error ? (
                <div className="bg-white/5 rounded-lg p-8 text-center border border-white/10">
                    <Package className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No Orders Yet</h3>
                    <p className="text-pink-200 mb-6">You haven't placed any orders yet.</p>
                    <Button 
                    onClick={() => router.push('/products')}
                    className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300"
                    >
                    Start Shopping
                    </Button>
                </div>
                ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                    <div 
                        key={order.id} 
                        className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                    >
                        {/* Order Header */}
                        <div 
                        className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer"
                        onClick={() => toggleOrderDetails(order.id)}
                        >
                        <div className="flex items-start mb-3 sm:mb-0">
                            <div className="bg-white/10 rounded-lg p-2 mr-4">
                            <Package className="w-8 h-8 text-pink-300" />
                            </div>
                            <div>
                            <p className="text-white font-medium">Order #{order.id.substring(0, 8)}</p>
                            <div className="flex items-center mt-1">
                                <Clock className="w-4 h-4 text-pink-300 mr-1.5" />
                                <span className="text-pink-200 text-sm">{formatDate(order.createdAt)}</span>
                            </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                            <div className="sm:mr-6">
                            <span className="text-white font-medium">${order.total.toFixed(2)}</span>
                            <div className="flex items-center mt-1.5">
                                <span className={`${getStatusColor(order.status)} w-2 h-2 rounded-full mr-1.5`}></span>
                                <span className="text-pink-200 text-sm">{order.status}</span>
                            </div>
                            </div>
                            
                            <div>
                            {expandedOrderId === order.id ? (
                                <ChevronUp className="w-5 h-5 text-pink-200" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-pink-200" />
                            )}
                            </div>
                        </div>
                        </div>
                        
                        {/* Order Details */}
                        {expandedOrderId === order.id && (
                        <div className="border-t border-white/10 p-4 sm:p-6">
                            <div className="space-y-6">
                            {/* Items */}
                            <div>
                                <h4 className="text-pink-200 font-medium mb-3">Items</h4>
                                <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center bg-white/5 rounded-lg p-3">
                                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-white/10 mr-4 flex-shrink-0">
                                        <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Product'
                                        }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                        <p className="text-white font-medium">{item.name}</p>
                                        <p className="text-white font-medium">${Number(item.price).toFixed(2)}</p>
                                        </div>
                                        <p className="text-pink-200 text-sm mt-1">Quantity: {item.quantity}</p>
                                    </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                            
                            {/* Shipping Information */}
                            <div>
                                <h4 className="text-pink-200 font-medium mb-3">Shipping Address</h4>
                                <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-white">{order.address.street}</p>
                                <p className="text-white">
                                    {order.address.city}, {order.address.state} {order.address.postalCode}
                                </p>
                                <p className="text-white">{order.address.country}</p>
                                </div>
                            </div>
                            
                            {/* Order Summary */}
                            <div className="flex justify-between pt-4 border-t border-white/10">
                                <span className="text-white font-medium">Total</span>
                                <span className="text-white font-bold">${order.total.toFixed(2)}</span>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex justify-end space-x-3">
                                <Button 
                                variant="primary"
                                className="text-pink-200 hover:text-white border border-white/10 hover:bg-white/5 flex items-center"
                                onClick={() => {
                                    if (order.items.length > 0) {
                                    router.push(`/products/${order.items[0].productId}`)
                                    }
                                }}
                                >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Product
                                </Button>
                            </div>
                            </div>
                        </div>
                        )}
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