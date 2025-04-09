'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { 
    AlertTriangle, 
    ArrowLeft, 
    Clock, 
    Download, 
    Package, 
    Truck, 
    CheckCircle,
    User,
    Mail,
    MapPin,
    DollarSign
    } from 'lucide-react'
    import { getSellerOrderById, updateOrderStatus } from '@/services/sellerOrderServices'

    // Convert status to title case
    const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
    }

    export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [order, setOrder] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'SELLER') {
        router.push('/')
        return
        }

        const fetchOrder = async () => {
        try {
            const orderId = parseInt(params.id)
            if (isNaN(orderId)) {
            throw new Error('Invalid order ID')
            }

            const orderData = await getSellerOrderById(orderId)
            if (!orderData) {
            setError('Order not found')
            } else {
            setOrder(orderData)
            setError(null)
            }
        } catch (error) {
            console.error('Error fetching order:', error)
            setError('Could not load order details. Please try again.')
        } finally {
            setLoading(false)
        }
        }

        if (status === 'authenticated') {
        fetchOrder()
        }
    }, [params.id, session, router, status])

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
            return <Clock className="w-5 h-5" />
        case 'processing':
            return <Package className="w-5 h-5" />
        case 'shipped':
            return <Truck className="w-5 h-5" />
        case 'delivered':
            return <CheckCircle className="w-5 h-5" />
        case 'cancelled':
            return <AlertTriangle className="w-5 h-5" />
        default:
            return <Clock className="w-5 h-5" />
        }
    }

    const handleUpdateStatus = async (newStatus: string) => {
        if (!order) return
        
        setIsSubmitting(true)
        try {
        const updatedOrder = await updateOrderStatus(order.id, newStatus)
        if (updatedOrder) {
            setOrder(updatedOrder)
        }
        } catch (error) {
        console.error('Error updating order status:', error)
        alert('Failed to update status. Please try again.')
        } finally {
        setIsSubmitting(false)
        }
    }

    if (status === 'loading' || loading) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
            <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 animate-pulse border border-white/10">
                <div className="flex justify-between mb-8">
                <div className="bg-white/20 h-8 rounded-lg w-1/3"></div>
                <div className="bg-white/20 h-8 rounded-lg w-1/4"></div>
                </div>
                <div className="grid gap-6">
                <div className="bg-white/20 h-24 rounded-lg"></div>
                <div className="bg-white/20 h-24 rounded-lg"></div>
                <div className="bg-white/20 h-32 rounded-lg"></div>
                </div>
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
            <h3 className="text-xl font-bold text-white mb-3">
                {error === 'Order not found' ? 'Order Not Found' : 'Something Went Wrong'}
            </h3>
            <p className="text-pink-100 mb-6">
                {error === 'Order not found' 
                ? "We couldn't find the order you're looking for."
                : error
                }
            </p>
            <Button 
                variant="primary" 
                onClick={() => router.push('/dashboard/seller/orders')}
                className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
            >
                Back to Orders
            </Button>
            </div>
        </div>
        )
    }

    if (!order) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
        <div className="max-w-4xl mx-auto">
            <button 
            onClick={() => router.push('/dashboard/seller/orders')}
            className="flex items-center text-pink-200 hover:text-white mb-6 transition duration-300"
            >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Orders
            </button>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-white/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    Order #{order.orderNumber}
                    </h1>
                    <p className="text-pink-200 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                </div>
                
                <div className={`flex items-center px-4 py-2 rounded-lg ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-2 font-semibold">{formatStatus(order.status)}</span>
                </div>
                </div>
            </div>
            
            {/* Order Timeline */}
            <div className="p-8 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Order Progress</h2>
                <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10"></div>
                
                <div className="grid gap-6">
                    {/* Pending */}
                    <div className="relative pl-12">
                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center 
                        ${order.status.toLowerCase() !== 'cancelled' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/50'}`}
                    >
                        <Clock className="w-4 h-4" />
                    </div>
                    <h3 className={`font-semibold ${order.status.toLowerCase() !== 'cancelled' ? 'text-white' : 'text-white/50'}`}>
                        Order Received
                    </h3>
                    <p className={`text-sm ${order.status.toLowerCase() !== 'cancelled' ? 'text-pink-200' : 'text-white/30'}`}>
                        Order has been received and is awaiting processing
                    </p>
                    </div>
                    
                    {/* Processing */}
                    <div className="relative pl-12">
                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center 
                        ${['processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/50'}`}
                    >
                        <Package className="w-4 h-4" />
                    </div>
                    <h3 className={`font-semibold ${['processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'text-white' : 'text-white/50'}`}>
                        Processing
                    </h3>
                    <p className={`text-sm ${['processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'text-pink-200' : 'text-white/30'}`}>
                        Order is being prepared for shipping
                    </p>
                    </div>
                    
                    {/* Shipped */}
                    <div className="relative pl-12">
                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center 
                        ${['shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/50'}`}
                    >
                        <Truck className="w-4 h-4" />
                    </div>
                    <h3 className={`font-semibold ${['shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'text-white' : 'text-white/50'}`}>
                        Shipped
                    </h3>
                    <p className={`text-sm ${['shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'text-pink-200' : 'text-white/30'}`}>
                        Order has been shipped and is on its way
                    </p>
                    </div>
                    
                    {/* Delivered */}
                    <div className="relative pl-12">
                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center 
                        ${order.status.toLowerCase() === 'delivered' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/50'}`}
                    >
                        <CheckCircle className="w-4 h-4" />
                    </div>
                    <h3 className={`font-semibold ${order.status.toLowerCase() === 'delivered' ? 'text-white' : 'text-white/50'}`}>
                        Delivered
                    </h3>
                    <p className={`text-sm ${order.status.toLowerCase() === 'delivered' ? 'text-pink-200' : 'text-white/30'}`}>
                        Order has been delivered successfully
                    </p>
                    </div>
                </div>
                </div>
            </div>
            
            {/* Customer Info */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-white/10">
                <div>
                <h2 className="text-xl font-semibold text-white mb-4">Customer Information</h2>
                <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-pink-300" />
                    <div>
                        <p className="text-white font-medium">{order.customerName}</p>
                        <p className="text-pink-200 text-sm">Customer</p>
                    </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-pink-300" />
                    <div>
                        <p className="text-white font-medium">{order.customerEmail}</p>
                        <p className="text-pink-200 text-sm">Email</p>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            
            {/* Order Items */}
            <div className="p-8 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Order Items</h2>
                <div className="space-y-4">
                {order.orderItems.map((item: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-white/10">
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
                        <h3 className="text-white font-medium">{item.productName}</h3>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-pink-200 text-sm">Price: ${item.price.toFixed(2)}</p>
                            <p className="text-pink-200 text-sm">Qty: {item.quantity}</p>
                        </div>
                        </div>
                    </div>
                    <div className="text-white font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            
            {/* Order Summary */}
            <div className="p-8 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
                <div className="bg-white/5 rounded-lg p-6">
                <div className="flex justify-between pt-3">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-white font-bold text-xl">${order.totalAmount.toFixed(2)}</span>
                </div>
                </div>
            </div>
            
            {/* Actions */}
            <div className="p-8 flex flex-wrap gap-4 justify-between">
                <Button
                onClick={() => window.print()}
                className="bg-indigo-600/60 hover:bg-indigo-500 text-white flex items-center gap-2 transition duration-300"
                >
                <Download className="w-4 h-4" />
                Print Order
                </Button>
                
                <div className="space-x-3">
                {order.status.toLowerCase() === 'pending' && (
                    <>
                    <Button
                        onClick={() => handleUpdateStatus('processing')}
                        disabled={isSubmitting}
                        className="bg-indigo-600/60 hover:bg-indigo-500 text-white transition duration-300"
                    >
                        Process Order
                    </Button>
                    <Button
                        onClick={() => handleUpdateStatus('cancelled')}
                        disabled={isSubmitting}
                        className="bg-pink-600/60 hover:bg-pink-500 text-white transition duration-300"
                    >
                        Cancel Order
                    </Button>
                    </>
                )}
                
                {order.status.toLowerCase() === 'processing' && (
                    <Button
                    onClick={() => handleUpdateStatus('shipped')}
                    disabled={isSubmitting}
                    className="bg-indigo-600/60 hover:bg-indigo-500 text-white transition duration-300"
                    >
                    Mark as Shipped
                    </Button>
                )}
                
                {order.status.toLowerCase() === 'shipped' && (
                    <Button
                    onClick={() => handleUpdateStatus('delivered')}
                    disabled={isSubmitting}
                    className="bg-indigo-600/60 hover:bg-indigo-500 text-white transition duration-300"
                    >
                    Mark as Delivered
                    </Button>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
    )
}