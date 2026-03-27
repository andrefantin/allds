import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(_req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes
        const { pathname } = req.nextUrl
        if (pathname === '/') return true
        if (pathname.startsWith('/api/auth')) return true
        if (pathname.startsWith('/login')) return true
        if (pathname.startsWith('/api/tenants') && req.method === 'GET') return true
        return !!token
      },
    },
    pages: { signIn: '/login' },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
