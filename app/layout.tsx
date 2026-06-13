// app/layout.tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, DM_Mono } from 'next/font/google'

import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/providers/query-provider'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Grand Hôtel PMS',
  description: 'Système de gestion hôtelière — Grand Hôtel Lumière',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full" style={{ background: '#FAF7F2', color: '#3D1F0F' }}>
        <QueryProvider>
          <>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#FFFFFF',
                  color: '#3D1F0F',
                  border: '1px solid #EDE8DF',
                  borderRadius: 12,
                  fontSize: 13,
                  boxShadow: '0 4px 24px rgba(61,31,15,0.1)',
                },
                success: { iconTheme: { primary: '#B5924C', secondary: '#FAF7F2' } },
                error:   { iconTheme: { primary: '#8B1A2F', secondary: '#FAF7F2' } },
              }}
            />
          </>
        </QueryProvider>
      </body>
    </html>
  )
}
