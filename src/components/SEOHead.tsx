'use client';

import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEOHead({
  title = 'OBSIDIAN WEAR - Plus qu\'un vêtement, une attitude',
  description = 'Découvrez notre collection exclusive OBSIDIAN WEAR. Plus qu\'un vêtement, une attitude. Style unique et pièces premium.',
  keywords = 'obsidian wear, clothing, fashion, style, apparel, algeria, dz, premium, ecommerce, boutique',
  image = '/Logo Obsidian Wear sur fond noir.png',
  url = 'https://obsidian-wear.vercel.app',
  type = 'website'
}: SEOHeadProps) {
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="OBSIDIAN WEAR" />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="OBSIDIAN WEAR" />
      <meta property="og:locale" content="fr_DZ" />
      
      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "OBSIDIAN WEAR",
            "description": description,
            "url": url,
            "logo": image,
            "sameAs": [
              "https://www.instagram.com/obsidianwear",
              "https://www.facebook.com/obsidianwear"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+213-XXX-XXX-XXX",
              "contactType": "customer service",
              "availableLanguage": ["French", "English"]
            }
          })
        }}
      />
    </Head>
  );
}
