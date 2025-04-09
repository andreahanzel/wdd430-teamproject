'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { 
    AlertTriangle, 
    ArrowLeft, 
    Clock, 
    Package, 
    ShoppingBag, 
    Truck, 
    CheckCircle,
    Filter,
    Search
    } from 'lucide-react'
    import { getSellerOrders, updateOrderStatus } from '@/services/sellerOrderServices'

    // Convert status to title case
    const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
    }

    export default function OrdersSection() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>('ALL')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'SELLER') {
        router.push('/')
        return
        }

        const fetchOrders = async () => {
        try {
            const ordersData = await getSellerOrders()
            setOrders(ordersData)
            setError(null)
        } catch (error) {
            console.error('Error fetching orders:', error)
            setError('Could not load orders. Please try again.')
        } finally {
            setLoading(false)
        }
        }

        if (status === 'authenticated') {
        fetchOrders()
        }
    }, [session, router, status])

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        case 'processing':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        case 'shipped':
            return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
        case 'delivered':
            return 'bg-green-500/20 text-green-400 border-green-500/30'
        case 'cancelled':
            return 'bg-red-500/20 text-red-400 border-red-500/30'
        default:
            return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
        case 'pending':
            return <Clock className="w-4 h-4" />
        case 'processing':
            return <Package className="w-4 h-4" />
        case 'shipped':
            return <Truck className="w-4 h-4" />
        case 'delivered':
            return <CheckCircle className="w-4 h-4" />
        case 'cancelled':
            return <AlertTriangle className="w-4 h-4" />
        default:
            return <Clock className="w-4 h-4" />
        }
    }

    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        try {
        await updateOrderStatus(orderId, newStatus)
        
        // Update local state
        setOrders(orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ))
        } catch (error) {
        console.error('Error updating order status:', error)
        alert('Failed to update status. Please try again.')
        }
    }

    const filteredOrders = orders
        .filter(order => filterStatus === 'ALL' || order.status.toLowerCase() === filterStatus.toLowerCase())
        .filter(order => 
        searchTerm === '' || 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderItems.some((item: any) => 
            item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        )

    if (status === 'loading' || loading) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
            <div className="max-w-7xl mx-auto">
            <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 animate-pulse border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                    <div className="bg-white/20 h-5 rounded-full w-1/4"></div>
                    <div className="bg-white/20 h-8 rounded-lg w-1/6"></div>
                    </div>
                    <div className="bg-white/20 h-4 rounded-full w-3/4 mb-3"></div>
                    <div className="bg-white/20 h-4 rounded-full w-1/2 mb-4"></div>
                    <div className="flex justify-between">
                    <div className="bg-white/20 h-8 rounded-lg w-1/5"></div>
                    <div className="bg-white/20 h-8 rounded-lg w-1/5"></div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>
        )
    }

    if (error) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-10 max-w-md border border-white/10 text-center">
            <div className="flex justify-center mb-6">
                <AlertTriangle size={64} className="text-pink-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Something went wrong</h3>
            <p className="text-pink-100 mb-6">{error}</p>
            <Button 
                variant="primary" 
                onClick={() => window.location.reload()}
                className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
            >
                Try Again
            </Button>
            </div>
        </div>
        )
    }

    return (
        <main id="main-content" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-6">
            <button 
                onClick={() => router.push('/dashboard/seller')}
                className="flex items-center text-pink-200 hover:text-white transition duration-300 mr-4"
            >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Orders</h1>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 mb-8 border border-white/10">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center mb-6">
                <div className="relative w-full md:w-1/2">
                <input
                    type="text"
                    placeholder="Search orders, products or customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                </div>
                
                <div className="flex items-center space-x-2 w-full md:w-auto">
                <Filter className="h-4 w-4 text-white/70" />
                <label htmlFor="filterStatus" className="sr-only">Filter Orders</label>
                <select
                    id="filterStatus"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                >
                    <option value="ALL">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                </div>
            </div>
            
            <div className="text-white/70 mb-2 text-sm">
                Showing {filteredOrders.length} of {orders.length} orders
            </div>
            </div>

            {filteredOrders.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-10 border border-white/10 text-center">
                <div className="flex justify-center mb-6">
                <ShoppingBag size={64} className="text-pink-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No orders found</h3>
                <p className="text-pink-100 mb-6">
                {orders.length > 0 
                    ? "No orders match your current filters. Try adjusting your search criteria."
                    : "You don't have any orders yet. Once customers purchase your products, they'll appear here."
                }
                </p>
                <Button 
                variant="primary"
                onClick={() => {
                    setFilterStatus('ALL');
                    setSearchTerm('');
                }}
                className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                >
                Clear Filters
                </Button>
            </div>
            ) : (
            <div className="grid gap-6">
                {filteredOrders.map((order) => (
                <div 
                    key={order.id}
                    className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border border-white/10 transition-all duration-300 hover:shadow-2xl"
                >
                    <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                        <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-xl">Order #{order.orderNumber}</h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} backdrop-blur-sm`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{formatStatus(order.status)}</span>
                            </span>
                        </div>
                        <p className="text-pink-200 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                        </div>
                        <div className="text-right">
                        <p className="text-white font-bold text-lg">${order.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/10 py-4 mb-4">
                        <div className="text-pink-100 mb-2">Customer: <span className="text-white">{order.customerName}</span></div>
                        <div className="text-pink-100 mb-2">Email: <span className="text-white">{order.customerEmail}</span></div>
                    </div>
                    
                    <div className="border-t border-white/10 py-4">
                        <h4 className="font-semibold text-white mb-3">Order Items</h4>
                        <div className="space-y-3">
                        {order.orderItems.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-md overflow-hidden bg-white/10">
                                <img 
                                    src={item.productImage || '/placeholder-product.jpg'} 
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                                    }}
                                />
                                </div>
                                <div>
                                <div className="text-white font-medium">{item.productName}</div>
                                <div className="text-pink-200 text-sm">Qty: {item.quantity}</div>
                                </div>
                            </div>
                            <div className="text-white font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-4 mt-4 flex flex-wrap gap-2 justify-end">
                        {order.status === 'pending' && (
                        <>
                            <Button
                            onClick={() => handleUpdateStatus(order.id, 'processing')}
                            className="bg-indigo-600/60 hover:bg-indigo-500 text-white transition duration-300"
                            >
                            Process Order
                            </Button>
                            <Button
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            className="bg-pink-600/60 hover:bg-pink-500 text-white transition duration-300"
                            >
                            Cancel
                            </Button>
                        </>
                        )}
                        
                        {order.status === 'processing' && (
                        <Button
                            onClick={() => handleUpdateStatus(order.id, 'shipped')}
                            className="bg-indigo-600/60 hover:bg-indigo-500 text-white transition duration-300"
                        >
                            Mark as Shipped
                        </Button>
                        )}
                        
                        {order.status === 'shipped' && (
                        <Button
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="bg-indigo-600/60 hover:bg-indigo-500 text-white transition duration-300"
                        >
                            Mark as Delivered
                        </Button>
                        )}
                        
                        <Link href={`/dashboard/seller/orders/${order.id}`}>
                        <Button 
                            variant="secondary" 
                            className="border border-white/20 text-white hover:bg-white/10 transition duration-300"
                        >
                            View Details
                        </Button>
                        </Link>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </main>
    )
}