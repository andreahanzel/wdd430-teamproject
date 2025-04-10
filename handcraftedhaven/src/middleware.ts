import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request })
    const pathname = request.nextUrl.pathname

    // Redirect to home if not authenticated for protected routes
    if (!token && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Optional redirect only when coming from login and arriving at '/'
    if (
        token && 
        token.role === 'SELLER' && 
        pathname === '/' && 
        request.headers.get('referer')?.includes('/login')
    ) {
        return NextResponse.redirect(new URL('/dashboard/seller', request.url))
    }
    

    // Seller routes protection
    if (pathname.startsWith('/dashboard/seller')) {
        if (token?.role !== 'SELLER') {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Only redirect for product-related actions, not for viewing the dashboard
        // Don't check for profile on the main dashboard or profile pages
        if ((pathname.includes('/products/new') || 
            pathname.includes('/products/edit')) && 
            !pathname.includes('/profile')) {
            
            try {
                // Forward authentication cookies/headers
                const apiUrl = new URL('/api/seller/profile', request.url).toString()
                const sellerRes = await fetch(apiUrl, {
                    headers: {
                        Cookie: request.headers.get('cookie') || '',
                        Authorization: request.headers.get('authorization') || ''
                    }
                })
                
                if (sellerRes.status === 404) {
                    return NextResponse.redirect(new URL('/dashboard/seller/profile/new', request.url))
                }
            } catch (error) {
                console.error('Error checking seller profile:', error)
            }
        }
    }

    // Cart and checkout routes protection
    if (pathname.startsWith('/cart') || pathname.startsWith('/checkout')) {
        if (!token) {
            return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/cart/:path*', '/checkout/:path*'],
}