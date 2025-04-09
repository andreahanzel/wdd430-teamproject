'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Star, MapPin, Phone, Edit, ArrowLeft, AlertTriangle, Box } from 'lucide-react'

export default function ProfileSection() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated' || (status === 'authenticated' && session?.user.role !== 'SELLER')) {
            router.push('/')
            return
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/seller/profile')
                if (res.status === 404) {
                    setError('profile_not_found')
                    setLoading(false)
                    return
                }
                if (!res.ok) throw new Error('Failed to fetch profile')

                const data = await res.json()
                setProfile(data)
                setError(null)
            } catch (error) {
                setError('Failed to load profile')
            } finally {
                setLoading(false)
            }
        }

        if (status === 'authenticated' && session?.user.role === 'SELLER') {
            fetchProfile()
        }
    }, [session, status, router])

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-8">
                <div className="w-16 h-16 border-t-4 border-white rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error === 'profile_not_found') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-8">
                <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-10 border border-white/10 text-center">
                    <div className="flex justify-center mb-6">
                        <AlertTriangle size={64} className="text-pink-300" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Seller Profile Required</h3>
                    <p className="text-pink-100 mb-6">You need to create a seller profile before you can view it.</p>
                    <Link href="/dashboard/seller/profile/new">
                        <Button 
                            variant="primary"
                            className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                        >
                            Create Seller Profile
                        </Button>
                    </Link>
                </div>
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
                    <h3 className="text-xl font-bold text-white mb-3">Something went wrong</h3>
                    <p className="text-pink-100 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (!profile) {
        return null
    }

    return (
        <main id="main-content" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => router.push('/dashboard/seller')}
                    className="flex items-center text-pink-200 hover:text-white mb-6 transition duration-300"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </button>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/10 overflow-hidden">
                    {/* Header with profile image and main info */}
                    <div className="relative">
                        {/* Background decorative gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-pink-600/20"></div>
                        
                        <div className="relative flex flex-col md:flex-row items-center p-8 md:p-10 space-y-6 md:space-y-0 md:space-x-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
                                    <img
                                        src={profile?.profileImage || '/placeholder-user.jpg'}
                                        alt={profile?.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-user.jpg'
                                        }}
                                    />
                                </div>
                                {/* Rating badge */}
                                <div className="absolute -bottom-2 -right-2 bg-indigo-600/80 backdrop-blur-sm text-white text-xs font-bold rounded-full h-10 w-10 flex items-center justify-center border-2 border-white/10">
                                    <Star className="w-3 h-3 inline-block mr-0.5 text-yellow-300" />
                                    <span>{profile?.rating || '0'}</span>
                                </div>
                            </div>
                            
                            <div className="text-center md:text-left flex-1">
                                <h2 className="text-3xl font-bold text-white mb-1">{profile?.name}</h2>
                                <div className="text-pink-200 text-xl mb-3">{profile?.shopName}</div>
                                
                                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 text-white/80 text-sm">
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1.5 text-pink-300" />
                                        <span>{profile?.location}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-1.5 text-pink-300" />
                                        <span>{profile?.contact}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Box className="w-4 h-4 mr-1.5 text-pink-300" />
                                        <span><strong>{profile?.sales || '0'}</strong> Sales</span>
                                    </div>
                                </div>
                            </div>
                            
                            <Link href="/dashboard/seller/profile/edit" className="md:self-start">
                                <Button 
                                    variant="primary" 
                                    className="bg-pink-600/80 hover:bg-pink-500 text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Profile
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Bio and Story Section */}
                    <div className="p-8 md:p-10 border-t border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold text-pink-200 mb-3 flex items-center">
                                    <span className="w-8 h-8 rounded-full bg-pink-600/30 flex items-center justify-center mr-2">
                                        <span className="text-white">1</span>
                                    </span>
                                    About
                                </h3>
                                <div className="text-white leading-relaxed">
                                    {profile?.bio}
                                </div>
                            </div>
                            
                            {profile?.story && (
                                <div>
                                    <h3 className="text-lg font-semibold text-pink-200 mb-3 flex items-center">
                                        <span className="w-8 h-8 rounded-full bg-pink-600/30 flex items-center justify-center mr-2">
                                            <span className="text-white">2</span>
                                        </span>
                                        My Story
                                    </h3>
                                    <div className="text-white leading-relaxed">
                                        {profile?.story}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Action Footer */}
                    <div className="bg-white/5 px-8 py-6 border-t border-white/10 flex justify-between items-center">
                        <div className="text-pink-200">Joined on {new Date(profile?.createdAt).toLocaleDateString()}</div>
                        <Link href="/dashboard/seller/products">
                            <Button 
                                variant="primary" 
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg shadow-lg transition duration-300"
                            >
                                Manage Products
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            </main>
    )
}