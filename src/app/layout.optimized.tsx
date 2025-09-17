import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Improve font loading
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap', // Improve font loading
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

// Critical CSS inline to prevent layout shift
const criticalCSS = `
  body { 
    margin: 0; 
    padding: 0; 
    background-color: #000; 
    color: #fff; 
    font-family: var(--font-inter), system-ui, sans-serif;
    min-height: 100vh;
  }
  .loading-skeleton {
    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Critical CSS inline */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/Logo Obsidian Wear sur fond noir.png" as="image" />
        <link rel="preload" href="/favicon.ico" as="image" />
        
        {/* Essential meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://vercel.com" />
        
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        {/* Minimal providers - only what's absolutely necessary */}
        <div id="app-root">
          {children}
        </div>
        
        {/* Analytics - load after page content */}
        <Analytics />
        <SpeedInsights />
        
        {/* Service Worker - load after page content */}
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
