import { NextRequest, NextResponse } from 'next/server'

/**
 * Route protection middleware.
 *
 * Display routes (/output, /stage) are always public — no auth.
 * Operator routes require a valid Supabase session when
 * NEXT_PUBLIC_AUTH_ENABLED=true is set.
 *
 * To enable auth:
 *   1. Set NEXT_PUBLIC_AUTH_ENABLED=true in .env.local
 *   2. Uncomment the session check block below
 *   3. Run: supabase gen types typescript --local > lib/database.types.ts
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always public — kiosk screens, projectors
  if (
    pathname.startsWith('/output') ||
    pathname.startsWith('/stage') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/login'
  ) {
    return NextResponse.next()
  }

  // ── Auth guard (enable by setting NEXT_PUBLIC_AUTH_ENABLED) ──
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true'

  if (authEnabled) {
    // Check for Supabase session cookie
    const accessToken  = req.cookies.get('sb-access-token')?.value
    const refreshToken = req.cookies.get('sb-refresh-token')?.value

    if (!accessToken && !refreshToken) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icons/|screenshots/).*)',
  ],
}
