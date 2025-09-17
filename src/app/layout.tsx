import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
// Old context imports removed - using compatibility layer
import StoreStatusChecker from '@/components/StoreStatusChecker'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import GlobalDebugger from '@/components/GlobalDebugger'
import CriticalCSS from '@/components/CriticalCSS'
import { SmartProductProvider } from '@/context/SmartProductProvider'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import { DesignProvider } from '@/context/DesignContext'
import { CartProvider } from '@/context/CartContext'
import { ThemeProvider } from '@/context/ThemeContext'
// import ConsoleBlocker from '@/components/ConsoleBlocker' // Disabled for debugging
// import Footer from '@/components/Footer'
// import PerformanceMonitor from '@/components/PerformanceMonitor'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'OBSIDIAN WEAR - Plus qu\'un vêtement, une attitude',
  description: 'Découvrez notre collection exclusive OBSIDIAN WEAR. Plus qu\'un vêtement, une attitude. Style unique et pièces premium.',
  keywords: 'obsidian wear, clothing, fashion, style, apparel, algeria, dz, premium, ecommerce, boutique',
  authors: [{ name: 'OBSIDIAN WEAR' }],
  creator: 'OBSIDIAN WEAR',
  publisher: 'OBSIDIAN WEAR',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://obsidian-wear.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'fr-DZ': '/fr',
    },
  },
  openGraph: {
    title: 'OBSIDIAN WEAR - Plus qu\'un vêtement, une attitude',
    description: 'Découvrez notre collection exclusive OBSIDIAN WEAR. Plus qu\'un vêtement, une attitude.',
    url: 'https://obsidian-wear.vercel.app',
    siteName: 'OBSIDIAN WEAR',
    images: [
      {
        url: '/Logo Obsidian Wear sur fond noir.png',
        width: 1200,
        height: 630,
        alt: 'OBSIDIAN WEAR Logo',
      },
    ],
    locale: 'fr_DZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OBSIDIAN WEAR - Plus qu\'un vêtement, une attitude',
    description: 'Découvrez notre collection exclusive OBSIDIAN WEAR. Plus qu\'un vêtement, une attitude.',
    images: ['/Logo Obsidian Wear sur fond noir.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://vercel.com" />
      </head>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <CriticalCSS />
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <LanguageProvider>
                <DesignProvider>
                  <SmartProductProvider>
                    <CartProvider>
                      {/* <ConsoleBlocker /> */} {/* Disabled for debugging */}
                      <StoreStatusChecker />
                      {/* <PerformanceMonitor /> */}
                      {children}
                      
                      {/* Global Debugger - Only in development */}
                      {process.env.NODE_ENV === 'development' && <GlobalDebugger />}
                    </CartProvider>
                  </SmartProductProvider>
                </DesignProvider>
              </LanguageProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}