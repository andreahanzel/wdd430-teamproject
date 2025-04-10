'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Save, Camera, Package } from 'lucide-react'

export default function NewProductPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch('/api/seller/products', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(errorText || 'Failed to create product')
            }

            await response.json()
            router.push('/dashboard/seller/products')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create product')
            console.error('Error creating product:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedFile(file)
            
            // Create preview URL
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center p-8">
                <div className="w-16 h-16 border-t-4 border-white rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div id="main-content" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-8">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-pink-200 hover:text-white mb-6 transition duration-300"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
                </button>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-white/10">
                    <div className="flex items-center mb-8">
                        <Package className="w-8 h-8 text-pink-400 mr-3" />
                        <h1 className="text-3xl font-bold text-white">Create New Product</h1>
                    </div>
                    
                    {error && (
                        <div className="mb-8 p-4 bg-pink-600/40 border border-pink-400/30 text-white rounded-lg">
                            {error}
                        </div>
                    )}

                    <form 
                        onSubmit={handleSubmit}
                        encType="multipart/form-data"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-pink-200 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="Enter product name"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-pink-200 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        required
                                        placeholder="Describe your product in detail"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-pink-200 mb-2">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        step="0.01"
                                        min="0"
                                        required
                                        placeholder="0.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-pink-200 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                                        >
                                        <option value="">Select a category</option>
                                        <option value="Home Decor">Home Decor</option>
                                        <option value="Jewelry">Jewelry</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Art">Art</option>
                                        <option value="Furniture">Furniture</option>
                                        <option value="Other">Other</option>
                                    </select>

                                </div>

                                <div>
                                    <label htmlFor="color" className="block text-sm font-medium text-pink-200 mb-2">
                                        Color
                                    </label>
                                    <input
                                        type="text"
                                        id="color"
                                        name="color"
                                        placeholder="e.g. Red, Blue, Multi-color"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="material" className="block text-sm font-medium text-pink-200 mb-2">
                                        Material
                                    </label>
                                    <input
                                        type="text"
                                        id="material"
                                        name="material"
                                        placeholder="e.g. Wood, Cotton, Silver"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                        <span className="block text-sm font-medium text-pink-200 mb-2">
                            Product Image *
                        </span>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                {imagePreview ? (
                                    <div className="relative group w-32 h-32 rounded-xl overflow-hidden border-2 border-white/20">
                                        <img 
                                            src={imagePreview} 
                                            alt="Product preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 flex items-center justify-center bg-white/5 border-2 border-white/20 border-dashed rounded-xl">
                                        <Camera className="w-8 h-8 text-pink-300/50" />
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <label 
                                        htmlFor="image" 
                                        className="flex items-center justify-center w-full bg-white/5 border border-white/10 border-dashed rounded-lg px-4 py-6 text-pink-200 cursor-pointer hover:bg-white/10 transition duration-300"
                                    >
                                        <Camera className="w-6 h-6 mr-3" />
                                        <span>Choose an image</span>
                                        <input
                                            type="file"
                                            id="image"
                                            name="image"
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
                                        Upload a high-quality image of your product. Recommended size: 800x600px.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/seller/products')}
                                className="px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 transition duration-300"
                            >
                                Cancel
                            </button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                                className="bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                            >
                                <Save className="w-5 h-5" />
                                {isSubmitting ? 'Creating...' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}