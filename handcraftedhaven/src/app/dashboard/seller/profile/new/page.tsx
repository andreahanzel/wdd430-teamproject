'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Save, Camera, User, Store } from 'lucide-react'

export default function NewSellerProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Check the session in useEffect instead of at the component level
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'SELLER') {
            router.push('/')
        }
    }, [session, status, router])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        
        try {
            // Ensure file is selected
            const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
            if (!fileInput.files || fileInput.files.length === 0) {
                throw new Error('Please select a profile image')
            }

            const response = await fetch('/api/seller/profile', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create profile')
            }

            // On success, redirect to products page
            router.push('/dashboard/seller/products')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create profile')
            console.error('Error creating seller profile:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center">
                <div className="w-16 h-16 border-t-4 border-white rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-pink-200 hover:text-white mb-6 transition duration-300"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </button>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-white/10">
                    <div className="flex items-center mb-8">
                        <Store className="w-8 h-8 text-pink-400 mr-3" />
                        <h1 className="text-3xl font-bold text-white">Create Your Seller Profile</h1>
                    </div>
                    
                    {error && (
                        <div className="mb-8 p-4 bg-pink-600/40 border border-pink-400/30 text-white rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-pink-200 mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="Enter your full name"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="shopName" className="block text-sm font-medium text-pink-200 mb-2">
                                        Shop Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="shopName"
                                        name="shopName"
                                        required
                                        placeholder="Name of your shop or studio"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-pink-200 mb-2">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        required
                                        placeholder="City, State/Province, Country"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact" className="block text-sm font-medium text-pink-200 mb-2">
                                        Contact Email/Phone *
                                    </label>
                                    <input
                                        type="text"
                                        id="contact"
                                        name="contact"
                                        defaultValue={session?.user?.email || ''}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-pink-200 mb-2">
                                        Short Bio *
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={4}
                                        required
                                        placeholder="Tell customers about yourself and your craft"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300 resize-none"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="story" className="block text-sm font-medium text-pink-200 mb-2">
                                        Your Story
                                    </label>
                                    <textarea
                                        id="story"
                                        name="story"
                                        rows={4}
                                        placeholder="Share the story behind your crafts (optional)"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <label htmlFor="profileImage" className="block text-sm font-medium text-pink-200 mb-2">
                                Profile Image *
                            </label>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                {imagePreview ? (
                                    <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-white/20">
                                        <img 
                                            src={imagePreview} 
                                            alt="Profile preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 flex items-center justify-center bg-white/5 border-2 border-white/20 border-dashed rounded-full">
                                        <User className="w-10 h-10 text-pink-300/50" />
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <label 
                                        htmlFor="profileImage" 
                                        className="flex items-center justify-center w-full bg-white/5 border border-white/10 border-dashed rounded-lg px-4 py-6 text-pink-200 cursor-pointer hover:bg-white/10 transition duration-300"
                                    >
                                        <Camera className="w-6 h-6 mr-3" />
                                        <span>Choose profile image</span>
                                        <input
                                            type="file"
                                            id="profileImage"
                                            name="profileImage"
                                            accept="image/*"
                                            required
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    
                                    {selectedFile && (
                                        <p className="mt-3 text-sm text-pink-200">
                                            Selected: {selectedFile.name}
                                        </p>
                                    )}
                                    <p className="mt-3 text-sm text-pink-200/70">
                                        Upload a square image for best results. This will be shown on your profile.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/seller')}
                                className="px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition duration-300"
                            >
                                Cancel
                            </button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                            >
                                <Save className="w-5 h-5" />
                                {isSubmitting ? 'Creating...' : 'Create Profile'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}