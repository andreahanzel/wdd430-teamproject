'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SaveProductButtonProps {
    productId: number;
    className?: string;
    }

    export default function SaveProductButton({ productId, className = '' }: SaveProductButtonProps) {
    const { data: session, status } = useSession()
    const [isSaved, setIsSaved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isChecking, setIsChecking] = useState(true)
    const [savedItemId, setSavedItemId] = useState<number | null>(null)

    useEffect(() => {
        // Only check if the product is saved when the user is logged in
        if (status === 'authenticated' && session?.user.role === 'CUSTOMER') {
        checkIfSaved()
        } else {
        setIsChecking(false)
        }
    }, [status, session, productId])

    const checkIfSaved = async () => {
        try {
        setIsChecking(true)
        const response = await fetch('/api/customer/saved')
        
        if (response.ok) {
            const savedProducts = await response.json()
            const savedItem = savedProducts.find((item: any) => item.productId === productId)
            
            if (savedItem) {
            setIsSaved(true)
            setSavedItemId(parseInt(savedItem.id))
            } else {
            setIsSaved(false)
            setSavedItemId(null)
            }
        }
        } catch (error) {
        console.error('Error checking if product is saved:', error)
        } finally {
        setIsChecking(false)
        }
    }

    const toggleSave = async () => {
        if (status !== 'authenticated' || session?.user.role !== 'CUSTOMER') {
        // Redirect to login if not authenticated
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
        return
        }

        setIsLoading(true)

        try {
        if (isSaved && savedItemId) {
            // Remove from saved items
            const deleteResponse = await fetch(`/api/customer/saved/${savedItemId}`, {
            method: 'DELETE',
            })
            
            if (deleteResponse.ok) {
            setIsSaved(false)
            setSavedItemId(null)
            }
        } else {
            // Add to saved items
            const response = await fetch('/api/customer/saved', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
            })
            
            if (response.ok) {
            const data = await response.json()
            setIsSaved(true)
            setSavedItemId(data.savedProduct.id)
            }
        }
        } catch (error) {
        console.error('Error toggling save status:', error)
        } finally {
        setIsLoading(false)
        }
    }

    if (isChecking) {
        return (
        <Button
            variant="primary"
            className={`text-pink-200 hover:text-white border border-white/10 hover:bg-white/5 ${className}`}
            disabled
        >
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Checking...
        </Button>
        )
    }

    return (
        <Button
        variant="primary"
        onClick={toggleSave}
        disabled={isLoading}
        className={`${
            isSaved 
            ? 'text-pink-500 border-pink-500/30 hover:bg-pink-500/10' 
            : 'text-pink-200 hover:text-white border border-white/10 hover:bg-white/5'
        } ${className}`}
        >
        {isLoading ? (
            <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {isSaved ? 'Removing...' : 'Saving...'}
            </>
        ) : (
            <>
            <Heart className={`w-5 h-5 mr-2 ${isSaved ? 'fill-pink-500' : ''}`} />
            {isSaved ? 'Saved' : 'Save for Later'}
            </>
        )}
        </Button>
    )
}