import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token as { role?: string; tenant?: string } | null

    if (!token) return NextResponse.next()

    const role = token.role
    const tenant = token.tenant

    // Platform editors have full access
    if (role === 'platform_editor') return NextResponse.next()

    // Tenant users: restrict to their own tenant
    if ((role === 'viewer' || role === 'editor') && tenant) {
      const tenantPrefix = `/${tenant}`
      const isOnTenantRoute = pathname.startsWith(tenantPrefix + '/') || pathname === tenantPrefix
      const isAllowedApi = pathname.startsWith('/api/auth')
      if (!isOnTenantRoute && !isAllowedApi) {
        return NextResponse.redirect(new URL(tenantPrefix, req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        if (pathname.startsWith('/api/auth')) return true
        if (pathname.startsWith('/login')) return true
        return !!token
      },
    },
    pages: { signIn: '/login' },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
