'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CustomerSidebar from '@/components/CustomerSidebar'

export default function CustomerDashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        // Redirect if not logged in
        if (status === 'unauthenticated') {
        router.push('/login')
        }
        
        // Redirect if not a customer
        if (session && session.user.role !== 'CUSTOMER') {
        router.push('/')
        }
    }, [session, status, router])

    if (status === 'loading') {
        return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-8">
            <div className="max-w-6xl w-full mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-white/10 animate-pulse">
                <div className="h-8 bg-white/20 rounded-lg w-1/3 mb-10"></div>
                <div className="grid grid-cols-1 gap-8">
                <div className="h-64 bg-white/20 rounded-lg"></div>
                </div>
            </div>
            </div>
        </div>
        )
    }

    // If not authenticated or not a customer, don't render anything
    // (useEffect will handle the redirect)
    if (status === 'unauthenticated' || (session && session.user.role !== 'CUSTOMER')) {
        return null
    }

    return (
        <div id="main-content" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Customer Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
                <CustomerSidebar activePage="dashboard" />
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-3 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Welcome Back!</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-medium text-pink-200 mb-3">Recent Orders</h3>
                    <p className="text-white mb-4">Check the status of your recent purchases.</p>
                    <button 
                    onClick={() => router.push('/dashboard/customer/orders')}
                    className="text-sm text-pink-400 hover:text-pink-300 transition"
                    >
                    View Order History →
                    </button>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-medium text-pink-200 mb-3">Saved Products</h3>
                    <p className="text-white mb-4">Browse products you've saved for later.</p>
                    <button 
                    onClick={() => router.push('/dashboard/customer/saved')}
                    className="text-sm text-pink-400 hover:text-pink-300 transition"
                    >
                    View Saved Items →
                    </button>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-medium text-pink-200 mb-3">Profile Settings</h3>
                    <p className="text-white mb-4">Update your personal and payment information.</p>
                    <button 
                    onClick={() => router.push('/dashboard/customer/profile')}
                    className="text-sm text-pink-400 hover:text-pink-300 transition"
                    >
                    Manage Profile →
                    </button>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-medium text-pink-200 mb-3">Need Help?</h3>
                    <p className="text-white mb-4">Contact our support team with any questions.</p>
                    <button 
                    onClick={() => router.push('/dashboard/customer/contact')}
                    className="text-sm text-pink-400 hover:text-pink-300 transition"
                    >
                    Contact Us →
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    )
}