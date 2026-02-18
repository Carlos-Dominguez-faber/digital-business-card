import type { Metadata, Viewport } from 'next'
import { PWAProvider } from '@/components/PWAProvider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Tarjeta Digital',
    template: '%s | Tarjeta Digital',
  },
  description: 'Tarjeta de presentacion digital. Comparte tu informacion de contacto con un toque.',
  keywords: ['tarjeta digital', 'contacto', 'networking', 'vcard', 'QR code'],
  applicationName: 'Tarjeta Digital',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tarjeta Digital',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Tarjeta Digital',
    title: 'Tarjeta Digital',
    description: 'Tarjeta de presentacion digital.',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <PWAProvider>{children}</PWAProvider>
      </body>
    </html>
  )
}
