import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/supabaseDatabase';
import ProductPageClient from './ProductPageClient';

interface ProductPageProps {
  params: { id: string };
}

// Server-side data fetching
async function getProduct(id: string) {
  try {
    const products = await getProducts();
    const product = products.find(p => p.id === id);
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    };
  }

  return {
    title: `${product.name} - OBSIDIAN WEAR`,
    description: product.description || `Shop ${product.name} at OBSIDIAN WEAR. Premium quality clothing and accessories.`,
    keywords: `${product.name}, ${product.category}, obsidian wear, clothing, fashion`,
    openGraph: {
      title: `${product.name} - OBSIDIAN WEAR`,
      description: product.description || `Shop ${product.name} at OBSIDIAN WEAR.`,
      images: [
        {
          url: product.image || '/placeholder-product.jpg',
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - OBSIDIAN WEAR`,
      description: product.description || `Shop ${product.name} at OBSIDIAN WEAR.`,
      images: [product.image || '/placeholder-product.jpg'],
    },
  };
}

// Server-side rendered page
export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  // Pass server-fetched data to client component
  return <ProductPageClient product={product} />;
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((product) => ({
      id: product.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
