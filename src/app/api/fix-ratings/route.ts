import { NextRequest, NextResponse } from 'next/server';
import { getProducts, updateProduct } from '@/lib/supabaseDatabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('Fix Ratings API: POST request started');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Fix Ratings API: Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 500 }
      );
    }

    const products = await getProducts();
    let updatedCount = 0;
    const results = [];

    for (const product of products) {
      // Only update if rating is not already 5
      if (product.rating !== 5) {
        await updateProduct(product.id, { rating: 5 });
        updatedCount++;
        results.push({ product: product.name, oldRating: product.rating, newRating: 5, status: 'updated' });
        console.log(`Fix Ratings API: Updated rating for product: ${product.name} from ${product.rating} to 5`);
      } else {
        results.push({ product: product.name, rating: product.rating, status: 'already_5_stars' });
      }
    }

    console.log(`Fix Ratings API: Updated ${updatedCount} products to 5-star rating.`);
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} products to 5-star rating`,
      totalProducts: products.length,
      updatedCount,
      results,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Fix Ratings API: POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix ratings' },
      { status: 500 }
    );
  }
}
