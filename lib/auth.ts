import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUsers } from '@/lib/users.server'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Check Blob user registry first
        const users = await getUsers()
        const user = users.find((u) => u.email === credentials.email)

        if (user) {
          const valid = user.passwordHash.startsWith('$2')
            ? await bcrypt.compare(credentials.password, user.passwordHash)
            : credentials.password === user.passwordHash
          if (!valid) return null
          return {
            id: user.email,
            email: user.email,
            name: user.email,
            role: user.role,
            tenant: user.tenant,
          }
        }

        // Fallback: platform admin from env vars
        const adminEmail = process.env.EDITOR_EMAIL
        const adminPassword = process.env.EDITOR_PASSWORD_HASH || process.env.EDITOR_PASSWORD
        if (adminEmail && adminPassword && credentials.email === adminEmail) {
          const valid = adminPassword.startsWith('$2')
            ? await bcrypt.compare(credentials.password, adminPassword)
            : credentials.password === adminPassword
          if (!valid) return null
          return { id: adminEmail, email: adminEmail, name: 'Admin', role: 'platform_editor', tenant: undefined }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.tenant = (user as { tenant?: string }).tenant
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string
        ;(session.user as { tenant?: string }).tenant = token.tenant as string | undefined
      }
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
}
