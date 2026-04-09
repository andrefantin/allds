import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Base metadata — OG images are set per-page in page.tsx / [tenant]/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://alldesignsystems.vercel.app'),
  title: { default: 'All Design Systems', template: '%s | All Design Systems' },
  description: 'Explore design systems built by All human',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
