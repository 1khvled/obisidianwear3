import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ProductProvider } from '@/context/ProductContext'
import { LanguageProvider } from '@/context/LanguageContext'

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
  keywords: 'obsidian wear, clothing, fashion, style, apparel, algeria, dz, premium',
  authors: [{ name: 'OBSIDIAN WEAR' }],
  openGraph: {
    title: 'OBSIDIAN WEAR - Plus qu\'un vêtement, une attitude',
    description: 'Découvrez notre collection exclusive OBSIDIAN WEAR. Plus qu\'un vêtement, une attitude.',
    type: 'website',
    locale: 'fr_DZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OBSIDIAN WEAR - Plus qu\'un vêtement, une attitude',
    description: 'Découvrez notre collection exclusive OBSIDIAN WEAR. Plus qu\'un vêtement, une attitude.',
  },
  robots: {
    index: true,
    follow: true,
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
      </head>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <LanguageProvider>
          <ProductProvider>
            {children}
          </ProductProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
