import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseDatabase';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: 'OBSIDIAN WEAR - Plus qu\'un vêtement, une attitude',
  description: 'Découvrez notre collection exclusive OBSIDIAN WEAR. Plus qu\'un vêtement, une attitude. Style unique et pièces premium.',
  keywords: 'obsidian wear, clothing, fashion, style, apparel, algeria, dz, premium, ecommerce, boutique',
  openGraph: {
    title: 'OBSIDIAN WEAR - Plus qu\'un vêtement, une attitude',
    description: 'Découvrez notre collection exclusive OBSIDIAN WEAR. Plus qu\'un vêtement, une attitude.',
    images: ['/Logo Obsidian Wear sur fond noir.png'],
  },
};

// Server-side data fetching for better performance
async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('inStock', true)
      .order('createdAt', { ascending: false })
      .limit(20); // Limit for faster loading

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
}

export default async function HomePage() {
  // Fetch products on the server
  const products = await getProducts();

  return <HomePageClient initialProducts={products} />;
}
