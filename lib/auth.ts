import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const editorEmail = process.env.EDITOR_EMAIL
        const editorPassword = process.env.EDITOR_PASSWORD_HASH || process.env.EDITOR_PASSWORD
        if (!editorEmail || !editorPassword) return null
        if (credentials.email !== editorEmail) return null
        let valid = false
        if (editorPassword.startsWith('$2')) {
          valid = await bcrypt.compare(credentials.password, editorPassword)
        } else {
          valid = credentials.password === editorPassword
        }
        if (!valid) return null
        return { id: '1', email: editorEmail, name: 'Editor', role: 'editor' }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as { role?: string }).role = token.role as string
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
}
