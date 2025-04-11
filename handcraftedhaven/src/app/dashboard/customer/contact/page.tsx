'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
    Send, 
    Mail, 
    AlertTriangle,
    Loader2,
    CheckCircle,
    MessageSquare
    } from 'lucide-react'
    import CustomerSidebar from '@/components/CustomerSidebar'
    import { Button } from '@/components/ui/Button'
    import { useNotification } from "@/contexts/NotificationContext"

    export default function ContactPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { showNotification } = useNotification()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
    })

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
        
        // Just set loading to false since we don't need to fetch data for this page
        setLoading(false)
    }, [session, status, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prevData => ({
        ...prevData,
        [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')
        setSuccess(false)

        try {
        const response = await fetch('/api/customer/contact', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            subject: formData.subject,
            message: formData.message,
            email: session?.user.email,
            name: session?.user.name,
            }),
        })

        if (!response.ok) {
            throw new Error('Failed to send message')
        }

        setSuccess(true)
        showNotification('Message sent successfully!', 'success')
        // Reset form after successful submission
        setFormData({
            subject: '',
            message: '',
        })
        } catch (err) {
        console.error('Error sending message:', err)
        setError('Failed to send message. Please try again later.')
        showNotification('Failed to send message', 'error')
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
                <CustomerSidebar activePage="contact" />
                </div>
                
                {/* Main Content */}
                <div className="md:col-span-3 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10 flex items-center justify-center">
                <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 text-pink-400 mx-auto animate-spin" />
                    <p className="mt-4 text-lg text-white">Loading...</p>
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
                <CustomerSidebar activePage="contact" />
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-3 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
                
                {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-white rounded-lg p-4 mb-6 flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
                )}
                
                {success ? (
                <div className="bg-white/5 rounded-lg p-8 text-center border border-white/10">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Message Sent Successfully</h3>
                    <p className="text-pink-200 mb-6">Thank you for contacting us. We'll get back to you as soon as possible.</p>
                    <Button 
                    onClick={() => setSuccess(false)}
                    className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300"
                    >
                    Send Another Message
                    </Button>
                </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-pink-200 mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                            placeholder="What can we help you with?"
                        />
                        </div>
                        
                        <div>
                        <label htmlFor="message" className="block text-sm font-medium text-pink-200 mb-2">
                            Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={8}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                            placeholder="Please provide as much detail as possible..."
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
                                Sending...
                            </>
                            ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Send Message
                            </>
                            )}
                        </Button>
                        </div>
                    </form>
                    </div>
                    
                    {/* Contact Information */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-start">
                        <Mail className="w-5 h-5 text-pink-300 mt-1 mr-3" />
                        <div>
                            <p className="text-pink-200 text-sm">Email</p>
                            <p className="text-white">support@hhandcrafted.com</p>
                        </div>
                        </div>
                        
                        <div className="flex items-start">
                        <MessageSquare className="w-5 h-5 text-pink-300 mt-1 mr-3" />
                        <div>
                            <p className="text-pink-200 text-sm">Live Chat</p>
                            <p className="text-white">Available Mon-Fri, 9am-5pm EST</p>
                        </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <h4 className="text-white font-medium mb-2">Response Time</h4>
                        <p className="text-pink-200 text-sm">
                        We typically respond to inquiries within 24-48 hours during business days.
                        </p>
                    </div>
                    </div>
                </div>
                )}
            </div>
            </div>
        </div>
        </div>
    )
}