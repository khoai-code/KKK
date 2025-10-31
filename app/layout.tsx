import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/context/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Digitization Finder',
    template: '%s | Digitization Finder',
  },
  description: 'AI-Powered Internal Tool for Digitization Discovery - Find client projects, analyze performance metrics, and generate insights instantly.',
  keywords: ['digitization', 'client finder', 'analytics', 'AI reports', 'project management'],
  authors: [{ name: 'Digitization Team' }],
  creator: 'Digitization Team',
  publisher: 'Internal Tools',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'Digitization Finder',
    description: 'AI-Powered Internal Tool for Digitization Discovery',
    url: 'http://localhost:3000',
    siteName: 'Digitization Finder',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
