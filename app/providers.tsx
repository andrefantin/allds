'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#07272c',
              color: '#eaf0ee',
              borderRadius: '0.8rem',
              fontSize: '1.4rem',
              fontFamily: 'var(--font-cera), Inter, system-ui, sans-serif',
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  )
}
