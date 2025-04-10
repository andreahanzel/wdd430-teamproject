'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
    User, 
    CreditCard, 
    Home, 
    Mail, 
    Phone, 
    Save,
    AlertTriangle,
    Loader2
    } from 'lucide-react'
    import CustomerSidebar from '@/components/CustomerSidebar'
    import { Button } from '@/components/ui/Button'

    interface UserProfile {
    id: string
    name: string
    email: string
    phone: string
    address: {
        street: string
        city: string
        state: string
        postalCode: string
        country: string
    }
    paymentInfo: {
        cardNumber: string
        cardName: string
        expiryMonth: number
        expiryYear: number
    }
    }

    export default function ProfilePage() {
    const { data: session, status, update: updateSession } = useSession()
    const router = useRouter()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [activeTab, setActiveTab] = useState('personal')
    const [isSubmitting, setIsSubmitting] = useState(false)

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

        const fetchProfile = async () => {
        try {
            const response = await fetch('/api/customer/profile')
            
            if (!response.ok) {
            throw new Error('Failed to fetch profile')
            }
            
            const data = await response.json()
            setProfile(data)
        } catch (err) {
            console.error('Error fetching profile:', err)
            setError('Failed to load your profile. Please try again later.')
        } finally {
            setLoading(false)
        }
        }

        fetchProfile()
    }, [session, status, router])

    const handlePersonalInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')
        setSuccess('')

        const formData = new FormData(e.currentTarget)
        const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        }

        try {
        const response = await fetch('/api/customer/profile', {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error('Failed to update personal information')
        }

        // Update session data with new name
        if (data.name !== session?.user.name) {
            await updateSession({ name: data.name as string })
        }

        setSuccess('Personal information updated successfully!')
        // Update local state
        setProfile(prev => prev ? { 
            ...prev, 
            name: data.name as string, 
            email: data.email as string, 
            phone: data.phone as string 
        } : null)
        } catch (err) {
        console.error('Error updating profile:', err)
        setError('Failed to update personal information. Please try again.')
        } finally {
        setIsSubmitting(false)
        }
    }

    const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')
        setSuccess('')

        const formData = new FormData(e.currentTarget)
        const data = {
        address: {
            street: formData.get('street'),
            city: formData.get('city'),
            state: formData.get('state'),
            postalCode: formData.get('postalCode'),
            country: formData.get('country'),
        }
        }

        try {
        const response = await fetch('/api/customer/profile/address', {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error('Failed to update address information')
        }

        setSuccess('Address information updated successfully!')
        // Update local state
        setProfile(prev => prev ? { ...prev, address: data.address as any } : null)
        } catch (err) {
        console.error('Error updating address:', err)
        setError('Failed to update address information. Please try again.')
        } finally {
        setIsSubmitting(false)
        }
    }

    const handlePaymentInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')
        setSuccess('')

        const formData = new FormData(e.currentTarget)
        const data = {
        paymentInfo: {
            cardNumber: formData.get('cardNumber'),
            cardName: formData.get('cardName'),
            expiryMonth: Number(formData.get('expiryMonth')),
            expiryYear: Number(formData.get('expiryYear')),
        }
        }

        try {
        const response = await fetch('/api/customer/profile/payment', {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error('Failed to update payment information')
        }

        setSuccess('Payment information updated successfully!')
        // Update local state
        setProfile(prev => prev ? { ...prev, paymentInfo: data.paymentInfo as any } : null)
        } catch (err) {
        console.error('Error updating payment info:', err)
        setError('Failed to update payment information. Please try again.')
        } finally {
        setIsSubmitting(false)
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
                <CustomerSidebar activePage="profile" />
                </div>
                
                {/* Main Content */}
                <div className="md:col-span-3 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10 flex items-center justify-center">
                <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 text-pink-400 mx-auto animate-spin" />
                    <p className="mt-4 text-lg text-white">Loading your profile...</p>
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
                <CustomerSidebar activePage="profile" />
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-3 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
                
                {/* Error & Success Messages */}
                {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-white rounded-lg p-4 mb-6 flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
                )}
                
                {success && (
                <div className="bg-green-500/20 border border-green-500/30 text-white rounded-lg p-4 mb-6">
                    {success}
                </div>
                )}
                
                {/* Profile Tabs */}
                <div className="mb-6 border-b border-white/10">
                <div className="flex space-x-2">
                    <button
                    onClick={() => setActiveTab('personal')}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                        activeTab === 'personal' 
                        ? 'border-pink-500 text-white' 
                        : 'border-transparent text-pink-200 hover:text-white'
                    }`}
                    >
                    <span className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Personal
                    </span>
                    </button>
                    
                    <button
                    onClick={() => setActiveTab('address')}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                        activeTab === 'address' 
                        ? 'border-pink-500 text-white' 
                        : 'border-transparent text-pink-200 hover:text-white'
                    }`}
                    >
                    <span className="flex items-center">
                        <Home className="w-4 h-4 mr-2" />
                        Address
                    </span>
                    </button>
                    
                    <button
                    onClick={() => setActiveTab('payment')}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                        activeTab === 'payment' 
                        ? 'border-pink-500 text-white' 
                        : 'border-transparent text-pink-200 hover:text-white'
                    }`}
                    >
                    <span className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payment
                    </span>
                    </button>
                </div>
                </div>
                
                {/* Personal Information Form */}
                {activeTab === 'personal' && (
                <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                    <div>
                    <label htmlFor="name" className="block text-sm font-medium text-pink-200 mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={profile?.name || ''}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                    />
                    </div>
                    
                    <div>
                    <label htmlFor="email" className="block text-sm font-medium text-pink-200 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        defaultValue={profile?.email || ''}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                    />
                    </div>
                    
                    <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-pink-200 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        defaultValue={profile?.phone || ''}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                    />
                    </div>
                    
                    <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg transition duration-300"
                    >
                        {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                        ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                        )}
                    </Button>
                    </div>
                </form>
                )}
                
                {/* Address Form */}
                {activeTab === 'address' && (
                <form onSubmit={handleAddressSubmit} className="space-y-6">
                    <div>
                    <label htmlFor="street" className="block text-sm font-medium text-pink-200 mb-2">
                        Street Address
                    </label>
                    <input
                        type="text"
                        id="street"
                        name="street"
                        defaultValue={profile?.address?.street || ''}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                    />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-pink-200 mb-2">
                        City
                        </label>
                        <input
                        type="text"
                        id="city"
                        name="city"
                        defaultValue={profile?.address?.city || ''}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-pink-200 mb-2">
                        State/Province
                        </label>
                        <input
                        type="text"
                        id="state"
                        name="state"
                        defaultValue={profile?.address?.state || ''}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                        />
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-pink-200 mb-2">
                        Postal/ZIP Code
                        </label>
                        <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        defaultValue={profile?.address?.postalCode || ''}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-pink-200 mb-2">
                        Country
                        </label>
                        <input
                        type="text"
                        id="country"
                        name="country"
                        defaultValue={profile?.address?.country || ''}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                        />
                    </div>
                    </div>
                    
                    <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg transition duration-300"
                    >
                        {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                        ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Address
                        </>
                        )}
                    </Button>
                    </div>
                </form>
                )}
                
                {/* Payment Information Form */}
                {activeTab === 'payment' && (
                <form onSubmit={handlePaymentInfoSubmit} className="space-y-6">
                    <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-pink-200 mb-2">
                        Card Number
                    </label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        defaultValue={profile?.paymentInfo?.cardNumber || ''}
                        placeholder="•••• •••• •••• ••••"
                        maxLength={19}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                    />
                    </div>
                    
                    <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-pink-200 mb-2">
                        Name on Card
                    </label>
                    <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        defaultValue={profile?.paymentInfo?.cardName || ''}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                    />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="expiryMonth" className="block text-sm font-medium text-pink-200 mb-2">
                        Expiry Month
                        </label>
                        <select
                        id="expiryMonth"
                        name="expiryMonth"
                        defaultValue={profile?.paymentInfo?.expiryMonth || ''}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                        >
                        <option value="" className="bg-gray-800">Month</option>
                        {[...Array(12)].map((_, i) => (
                            <option key={i} value={i + 1} className="bg-gray-800">
                            {(i + 1).toString().padStart(2, '0')}
                            </option>
                        ))}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="expiryYear" className="block text-sm font-medium text-pink-200 mb-2">
                        Expiry Year
                        </label>
                        <select
                        id="expiryYear"
                        name="expiryYear"
                        defaultValue={profile?.paymentInfo?.expiryYear || ''}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                        >
                        <option value="" className="bg-gray-800">Year</option>
                        {[...Array(10)].map((_, i) => {
                            const year = new Date().getFullYear() + i
                            return (
                            <option key={year} value={year} className="bg-gray-800">
                                {year}
                            </option>
                            )
                        })}
                        </select>
                    </div>
                    </div>
                    
                    <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg transition duration-300"
                    >
                        {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                        ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Payment Information
                        </>
                        )}
                    </Button>
                    </div>
                </form>
                )}
            </div>
            </div>
        </div>
        </div>
    )
}