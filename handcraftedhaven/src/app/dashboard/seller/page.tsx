'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { 
    Plus, Package, LineChart, User, ShoppingBag,
    AlertTriangle, ChevronRight, Star, Store, Heart, 
    BarChart3, Zap, Layers
} from 'lucide-react'


// Profile Notice Component
function ProfileNotice() {
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-10 border border-white/10 text-center">
            <div className="flex justify-center mb-6">
                <AlertTriangle size={64} className="text-pink-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Seller Profile Required</h3>
            <p className="text-pink-100 mb-6">You need to create a seller profile before you can manage your store.</p>
            <Link href="/dashboard/seller/profile/new">
                <Button className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
                    Create Seller Profile
                </Button>
            </Link>
        </div>
    )
}



// LoadingState Component (Shown while checking profile status)
function LoadingState() {
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-white/10 animate-pulse">
            <div className="space-y-4">
                <div className="bg-white/20 h-6 w-1/3 rounded"></div>
                <div className="bg-white/20 h-4 w-2/3 rounded"></div>
                <div className="bg-white/20 h-10 w-32 rounded"></div>
            </div>
        </div>
    )
}

// Dashboard card component
function DashboardCard({ 
    title, 
    description, 
    icon: Icon, 
    color,
    linkPath,
    buttonText
}: { 
    title: string; 
    description: string; 
    icon: any; 
    color: string;
    linkPath: string;
    buttonText: string;
}) {
    return (
        <Link href={linkPath} className="block">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02] group">
                <div className={`w-14 h-14 ${color} rounded-lg flex items-center justify-center mb-5`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-pink-100 mb-6">{description}</p>
                
                <Button 
                    variant="primary" 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md group-hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700"                    >
                    {buttonText}
                    <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
            </div>
        </Link>
    )
}

// Main SellerDashboard Component
export default function SellerDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname() // Track route changes
    const [activeSection, setActiveSection] = useState('dashboard')
    const [error, setError] = useState<string | null>(null)
    const [hasProfile, setHasProfile] = useState<boolean>(false)
    const [profileChecked, setProfileChecked] = useState(false)
    const [loading, setLoading] = useState(true)
    const [sellerData, setSellerData] = useState<any>(null)
    type TopProduct = {
        sales: number;
        // Add other properties if needed
    };
    
    const [analytics, setAnalytics] = useState<{
        topProducts: TopProduct[];
        totalOrders: number;
        totalSales: number;
    } | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true)


    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/seller/analytics');
                const data = await res.json();
                setAnalytics(data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setAnalyticsLoading(false);
            }
        };
    
        if (hasProfile) {
            fetchAnalytics();
        }
    }, [hasProfile]);
    

    // Check if the seller has a profile
    const checkProfile = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/seller/profile')
            
            if (res.status === 404) {
                setHasProfile(false)
            } else if (res.ok) {
                setHasProfile(true)
                const data = await res.json()
                setSellerData(data)
            } else {
                throw new Error('Failed to check profile status')
            }
            
            setError(null)
        } catch (err) {
            console.error('Error checking profile:', err)
            setError('Failed to load seller dashboard')
        } finally {
            setProfileChecked(true)
            setLoading(false)
        }
    }

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'SELLER') {
            checkProfile()
        }
    }, [status, session, pathname]) // Add pathname to recheck on route changes

    // Redirect if not a seller
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'SELLER') {
            router.push('/')
        }
    }, [status, session, router])

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center">
                <div className="w-16 h-16 border-t-4 border-white rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-8">
                <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-10 border border-white/10 text-center">
                    <div className="flex justify-center mb-6">
                        <AlertTriangle size={64} className="text-pink-300" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Something Went Wrong</h3>
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

    if (session?.user?.role !== 'SELLER') return null
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700">
            <div className="flex flex-col md:flex-row">
                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 p-6 md:min-h-screen">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white">Seller Dashboard</h2>
                        <p className="text-pink-200 text-sm mt-1">Manage your handcrafted store</p>
                    </div>
                    
                    <nav className="space-y-2">
                        <button 
                            onClick={() => setActiveSection('dashboard')} 
                            className={`flex items-center w-full p-3 rounded-lg ${activeSection === 'dashboard' ? 'bg-white/10 text-white' : 'text-pink-100 hover:bg-white/5'} transition duration-200`}
                        >
                            <Layers className="w-5 h-5 mr-3" />
                            Dashboard
                        </button>
                        
                        <button 
                            onClick={() => setActiveSection('products')} 
                            className={`flex items-center w-full p-3 rounded-lg ${activeSection === 'products' ? 'bg-white/10 text-white' : 'text-pink-100 hover:bg-white/5'} transition duration-200`}
                        >
                            <Package className="w-5 h-5 mr-3" />
                            Products
                        </button>
                        
                        <button 
                            onClick={() => setActiveSection('orders')} 
                            className={`flex items-center w-full p-3 rounded-lg ${activeSection === 'orders' ? 'bg-white/10 text-white' : 'text-pink-100 hover:bg-white/5'} transition duration-200`}
                        >
                            <ShoppingBag className="w-5 h-5 mr-3" />
                            Orders
                        </button>
                        
                        <button 
                            onClick={() => setActiveSection('analytics')} 
                            className={`flex items-center w-full p-3 rounded-lg ${activeSection === 'analytics' ? 'bg-white/10 text-white' : 'text-pink-100 hover:bg-white/5'} transition duration-200`}
                        >
                            <LineChart className="h-5 w-5 mr-3" />
                            Analytics
                        </button>
                        
                        <button 
                            onClick={() => setActiveSection('profile')} 
                            className={`flex items-center w-full p-3 rounded-lg ${activeSection === 'profile' ? 'bg-white/10 text-white' : 'text-pink-100 hover:bg-white/5'} transition duration-200`}
                        >
                            <User className="h-5 w-5 mr-3" />
                            Profile
                        </button>

                    </nav>
                    
                    {hasProfile && sellerData && (
                        <div className="mt-10 pt-6 border-t border-white/10">
                            <div className="flex items-center">
                                <img 
                                    src={sellerData.profileImage || '/placeholder-user.jpg'} 
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full mr-3 border border-white/20"
                                />
                                <div>
                                    <p className="text-white font-medium">{sellerData.name}</p>
                                    <p className="text-pink-200 text-xs">{sellerData.shopName}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main id="main-content" className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto">
                        {activeSection === 'dashboard' && (
                            <>
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome{hasProfile ? `, ${sellerData?.name}` : ""}!</h1>
                                        <p className="text-pink-200">Here's an overview of your store</p>
                                    </div>
                                    
                                    {hasProfile && (
                                        <Link href="/dashboard/seller/products/new">
                                            <Button 
                                                variant="primary" 
                                                className="bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 py-2.5 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 mt-4 md:mt-0"
                                            >
                                                <Plus className="w-5 h-5" />
                                                Add New Product
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                                
                                {loading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10 animate-pulse">
                                                <div className="bg-white/20 w-12 h-12 rounded-lg mb-5"></div>
                                                <div className="bg-white/20 h-5 rounded w-3/4 mb-3"></div>
                                                <div className="bg-white/20 h-4 rounded w-1/2 mb-4"></div>
                                                <div className="bg-white/20 h-8 rounded-lg w-1/3"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !hasProfile ? (
                                        <ProfileNotice />
                                    ) : (
                                        <>
                                            {/* Stats Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                            {/* Total Products */}
                                            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10">
                                                <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-pink-200 text-sm">Total Products</p>
                                                    <h3 className="text-3xl font-bold text-white mt-1">
                                                    {analytics ? analytics.topProducts.reduce((sum: number, p: TopProduct) => sum + p.sales, 0) : 0}
                                                    </h3>
                                                </div>
                                                <div className="w-10 h-10 bg-indigo-600/30 rounded-lg flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-indigo-300" />
                                                </div>
                                                </div>
                                            </div>

                                            {/* Total Sales */}
                                            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10">
                                                <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-pink-200 text-sm">Total Sales</p>
                                                    <h3 className="text-3xl font-bold text-white mt-1">
                                                    {analytics ? analytics.totalOrders : 0}
                                                    </h3>
                                                </div>
                                                <div className="w-10 h-10 bg-pink-600/30 rounded-lg flex items-center justify-center">
                                                    <ShoppingBag className="w-5 h-5 text-pink-300" />
                                                </div>
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10">
                                                <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-pink-200 text-sm">Rating</p>
                                                    <h3 className="text-3xl font-bold text-white mt-1 flex items-center">
                                                    {sellerData?.rating || "0"}
                                                    <Star className="w-5 h-5 ml-1 text-yellow-400" />
                                                    </h3>
                                                </div>
                                                <div className="w-10 h-10 bg-yellow-600/30 rounded-lg flex items-center justify-center">
                                                    <Star className="w-5 h-5 text-yellow-300" />
                                                </div>
                                                </div>
                                            </div>

                                            {/* Revenue */}
                                            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10">
                                                <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-pink-200 text-sm">Revenue</p>
                                                    <h3 className="text-3xl font-bold text-white mt-1">
                                                    ${analytics ? analytics.totalSales.toFixed(2) : "0.00"}
                                                    </h3>
                                                </div>
                                                <div className="w-10 h-10 bg-green-600/30 rounded-lg flex items-center justify-center">
                                                    <BarChart3 className="w-5 h-5 text-green-300" />
                                                </div>
                                                </div>
                                            </div>
                                            </div>

                                            
                                            {/* Quick Access Cards */}
                                            <h2 className="text-2xl font-bold text-white mb-6">Quick Access</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                <DashboardCard
                                                    title="Manage Products"
                                                    description="Add, edit, and delete your product listings"
                                                    icon={Package}
                                                    color="bg-indigo-600/50"
                                                    linkPath="/dashboard/seller/products"
                                                    buttonText="View Products"
                                                />
                                                
                                                <DashboardCard
                                                    title="Process Orders"
                                                    description="View and manage customer orders"
                                                    icon={ShoppingBag}
                                                    color="bg-pink-600/50"
                                                    linkPath="/dashboard/seller/orders"
                                                    buttonText="View Orders"
                                                />
                                                
                                                <DashboardCard
                                                    title="Your Profile"
                                                    description="Update your seller information"
                                                    icon={User}
                                                    color="bg-purple-600/50"
                                                    linkPath="/dashboard/seller/profile"
                                                    buttonText="View Profile"
                                                />
                                            </div>
                                        </>
                                    )
                                )}
                            </>
                        )}
                        
                        {activeSection === 'products' && (
                            hasProfile ? (
                                <div>
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
                                            <p className="text-pink-200">Manage your product listings</p>
                                        </div>
                                        <Link href="/dashboard/seller/products">
                                            <Button 
                                                variant="primary" 
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300"
                                            >
                                                View All Products
                                            </Button>
                                        </Link>
                                    </div>
                                    <DashboardCard
                                        title="Your Products"
                                        description="Add, edit, and remove products from your store"
                                        icon={Package}
                                        color="bg-indigo-600/50"
                                        linkPath="/dashboard/seller/products"
                                        buttonText="View Products"
                                    />
                                </div>
                            ) : (
                                <ProfileNotice />
                            )
                        )}
                        
                        {activeSection === 'orders' && (
                            hasProfile ? (
                                <div>
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
                                            <p className="text-pink-200">Manage customer orders</p>
                                        </div>
                                    </div>
                                    <DashboardCard
                                        title="Your Orders"
                                        description="View and process customer orders"
                                        icon={ShoppingBag}
                                        color="bg-pink-600/50"
                                        linkPath="/dashboard/seller/orders"
                                        buttonText="View Orders"
                                    />
                                </div>
                            ) : (
                                <ProfileNotice />
                            )
                        )}
                        
                        {activeSection === 'analytics' && (
                            hasProfile ? (
                                <div>
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
                                            <p className="text-pink-200">Track your store performance</p>
                                        </div>
                                    </div>
                                    <DashboardCard
                                        title="Analytics Dashboard"
                                        description="View insights and reports about your store"
                                        icon={LineChart}
                                        color="bg-green-600/50"
                                        linkPath="/dashboard/seller/analytics"
                                        buttonText="View Analytics"
                                    />
                                </div>
                            ) : (
                                <ProfileNotice />
                            )
                        )}
                        
                        {activeSection === 'profile' && (
                            hasProfile ? (
                                <div>
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
                                            <p className="text-pink-200">Manage your seller profile</p>
                                        </div>
                                        <Link href="/dashboard/seller/profile">
                                            <Button 
                                                variant="primary" 
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300"
                                            >
                                                View Profile
                                            </Button>
                                        </Link>
                                    </div>
                                    <DashboardCard
                                        title="Your Profile"
                                        description="View and update your seller information"
                                        icon={User}
                                        color="bg-purple-600/50"
                                        linkPath="/dashboard/seller/profile"
                                        buttonText="View Profile"
                                    />
                                </div>
                            ) : (
                                <ProfileNotice />
                            )
                        )}

                    </div>
                </main>
            </div>
        </div>
    )
}