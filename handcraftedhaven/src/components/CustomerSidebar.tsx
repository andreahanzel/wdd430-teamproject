'use client'

import { useRouter } from 'next/navigation'
import { 
    Clock, 
    Heart, 
    User, 
    MessageSquare, 
    ShoppingBag,
    LogOut 
    } from 'lucide-react'
    import { signOut } from 'next-auth/react'
    import { Button } from '@/components/ui/Button'

    interface CustomerSidebarProps {
    activePage: string
    }

    export default function CustomerSidebar({ activePage }: CustomerSidebarProps) {
    const router = useRouter()

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10 h-fit">
        <nav className="space-y-2">
            <button
            onClick={() => router.push('/dashboard/customer')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-300 ${
                activePage === 'dashboard' 
                ? 'bg-pink-600 text-white' 
                : 'text-pink-200 hover:bg-white/5'
            }`}
            >
            <ShoppingBag className="w-5 h-5" />
            <span>Dashboard</span>
            </button>
            
            <button
            onClick={() => router.push('/dashboard/customer/orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-300 ${
                activePage === 'orders' 
                ? 'bg-pink-600 text-white' 
                : 'text-pink-200 hover:bg-white/5'
            }`}
            >
            <Clock className="w-5 h-5" />
            <span>Order History</span>
            </button>
            
            <button
            onClick={() => router.push('/dashboard/customer/saved')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-300 ${
                activePage === 'saved' 
                ? 'bg-pink-600 text-white' 
                : 'text-pink-200 hover:bg-white/5'
            }`}
            >
            <Heart className="w-5 h-5" />
            <span>Saved Products</span>
            </button>
            
            <button
            onClick={() => router.push('/dashboard/customer/profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-300 ${
                activePage === 'profile' 
                ? 'bg-pink-600 text-white' 
                : 'text-pink-200 hover:bg-white/5'
            }`}
            >
            <User className="w-5 h-5" />
            <span>Personal Information</span>
            </button>
            
            <button
            onClick={() => router.push('/dashboard/customer/contact')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-300 ${
                activePage === 'contact' 
                ? 'bg-pink-600 text-white' 
                : 'text-pink-200 hover:bg-white/5'
            }`}
            >
            <MessageSquare className="w-5 h-5" />
            <span>Contact Us</span>
            </button>
        </nav>
        
        <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col space-y-2">
            <Button
                variant="primary"
                onClick={() => router.push('/products')}
                className="text-pink-200 hover:text-white border border-white/10 hover:bg-white/5"
            >
                Continue Shopping
            </Button>
            
            <Button
                variant="primary"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center justify-center text-pink-200 hover:text-white border border-white/10 hover:bg-white/5"
            >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
            </Button>
            </div>
        </div>
        </div>
    )
}