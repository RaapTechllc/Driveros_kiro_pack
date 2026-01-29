import { type NextRequest, NextResponse } from 'next/server'
import { updateSession, isProtectedRoute } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes that handle their own auth
  const { pathname } = request.nextUrl

  // Skip for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }

  // Check if demo mode is enabled (bypass auth)
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  if (demoMode) {
    return NextResponse.next()
  }

  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Supabase not configured - allow access (demo mode fallback)
    return NextResponse.next()
  }

  try {
    // Update session and get user
    const { user, response } = await updateSession(request)

    // Check if route requires authentication
    if (isProtectedRoute(pathname) && !user) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // User is logged in but trying to access auth pages
    if (user && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch {
    // If session update fails, allow access to public routes only
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
