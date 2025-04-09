'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function EditSellerProfilePage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        if (!session || session.user.role !== 'SELLER') {
        router.push('/')
        return
        }

        const fetchProfile = async () => {
        try {
            const res = await fetch('/api/seller/profile')
            if (!res.ok) throw new Error('Failed to fetch profile')
            const data = await res.json()
            setProfile(data)
        } catch (err) {
            console.error('Error fetching profile:', err)
            setError('Failed to load profile')
            router.push('/dashboard/seller/profile')
        }
        }

        fetchProfile()
    }, [session, router])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        const formData = new FormData(e.currentTarget as HTMLFormElement)

        try {
        const response = await fetch('/api/seller/profile', {
            method: 'PUT',
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to update profile')
        }

        router.push('/dashboard/seller/profile')
        } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile')
        console.error('Error updating profile:', err)
        } finally {
        setIsSubmitting(false)
        }
    }

    if (!profile) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-4 py-10">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md text-white rounded-2xl shadow-2xl p-10 border border-white/20">
            <h1 className="text-3xl font-bold mb-10 text-center">Edit Your Seller Profile</h1>

            {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400 text-red-100 rounded-md text-center">
                {error}
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Your Name *
                    </label>
                    <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={profile.name}
                    required
                    className="block w-full rounded-lg bg-white/10 text-white placeholder-gray-300 border border-white/30 shadow-sm focus:border-indigo-400 focus:ring-indigo-400 p-3"
                    />
                </div>

                <div>
                    <label htmlFor="shopName" className="block text-sm font-medium mb-1">
                    Shop Name *
                    </label>
                    <input
                    type="text"
                    id="shopName"
                    name="shopName"
                    defaultValue={profile.shopName}
                    required
                    className="block w-full rounded-lg bg-white/10 text-white placeholder-gray-300 border border-white/30 shadow-sm focus:border-indigo-400 focus:ring-indigo-400 p-3"
                    />
                </div>

                <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Location *
                    </label>
                    <input
                    type="text"
                    id="location"
                    name="location"
                    defaultValue={profile.location}
                    required
                    className="block w-full rounded-lg bg-white/10 text-white placeholder-gray-300 border border-white/30 shadow-sm focus:border-indigo-400 focus:ring-indigo-400 p-3"
                    />
                </div>
                </div>

                <div className="space-y-6">
                <div>
                    <label htmlFor="profileImage" className="block text-sm font-medium mb-1">
                    Profile Image
                    </label>
                    <div className="flex items-center mt-2">
                    <img
                        src={profile.profileImage}
                        alt="Current profile"
                        className="w-16 h-16 rounded-full object-cover mr-4 border border-white/40"
                    />
                    <input
                        type="file"
                        id="profileImage"
                        name="profileImage"
                        accept="image/*"
                        className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-800 hover:file:bg-indigo-200"
                    />
                    </div>
                </div>

                <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">
                    Bio *
                    </label>
                    <textarea
                    id="bio"
                    name="bio"
                    rows={5}
                    defaultValue={profile.bio}
                    required
                    className="block w-full rounded-lg bg-white/10 text-white placeholder-gray-300 border border-white/30 shadow-sm focus:border-indigo-400 focus:ring-indigo-400 p-3 resize-none"
                    />
                </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
                <button
                type="button"
                onClick={() => router.push('/dashboard/seller/profile')}
                className="px-5 py-2 border border-white/30 rounded-lg text-white hover:bg-white/10 transition"
                >
                Cancel
                </button>
                <Button
                type="submit"
                variant="primary"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg shadow-md transition"
                disabled={isSubmitting}
                >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
            </form>
        </div>
        </div>
    )
}
