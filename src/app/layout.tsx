import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Eğitim CRM - İstanbul Institute',
    template: '%s | Eğitim CRM'
  },
  description: 'Modern eğitim kurumu yönetim sistemi',
  keywords: ['CRM', 'Eğitim', 'Yönetim', 'İstanbul Institute'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
