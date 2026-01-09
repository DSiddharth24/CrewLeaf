import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

const COOKIE_NAME = 'festpilot_session'

export async function middleware(request: NextRequest) {
    const currentUser = request.cookies.get(COOKIE_NAME)?.value

    // Protected Routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!currentUser) {
            return NextResponse.redirect(new URL('/auth/sign-in', request.url))
        }
        const payload = await decrypt(currentUser)
        if (!payload || !payload.user) {
            return NextResponse.redirect(new URL('/auth/sign-in', request.url))
        }

        // Optional: Role checks can be added here
        // if (payload.user.role !== 'club_admin' && ...)
    }

    // Auth Routes (redirect if logged in)
    if (request.nextUrl.pathname.startsWith('/auth') && currentUser) {
        const payload = await decrypt(currentUser)
        if (payload?.user) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*'],
}
