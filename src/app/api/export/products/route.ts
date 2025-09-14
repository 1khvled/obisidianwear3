import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('📊 Export Products API: Starting export...');
    
    const products = await getProducts();
    console.log(`📊 Export Products API: Found ${products.length} products`);
    
    // Create CSV header
    const headers = [
      'ID',
      'Name',
      'Price',
      'Category',
      'Description',
      'Sizes',
      'Colors',
      'Stock (S-Black)',
      'Stock (S-White)',
      'Stock (M-Black)',
      'Stock (M-White)',
      'Stock (L-Black)',
      'Stock (L-White)',
      'In Stock',
      'Rating',
      'Reviews',
      'Created At',
      'Updated At'
    ];
    
    // Create CSV rows
    const rows = products.map(product => {
      const stock = product.stock || {};
      const sizes = product.sizes || [];
      const colors = product.colors || [];
      
      // Extract stock values for common combinations
      const stockSBlack = stock['S']?.['Black'] || 0;
      const stockSWhite = stock['S']?.['White'] || 0;
      const stockMBlack = stock['M']?.['Black'] || 0;
      const stockMWhite = stock['M']?.['White'] || 0;
      const stockLBlack = stock['L']?.['Black'] || 0;
      const stockLWhite = stock['L']?.['White'] || 0;
      
      return [
        product.id,
        `"${product.name}"`,
        product.price,
        product.category,
        `"${product.description}"`,
        `"${sizes.join(', ')}"`,
        `"${colors.join(', ')}"`,
        stockSBlack,
        stockSWhite,
        stockMBlack,
        stockMWhite,
        stockLBlack,
        stockLWhite,
        product.inStock ? 'Yes' : 'No',
        product.rating,
        product.reviews,
        product.createdAt ? new Date(product.createdAt).toISOString() : '',
        product.updatedAt ? new Date(product.updatedAt).toISOString() : ''
      ];
    });
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    console.log('✅ Export Products API: CSV generated successfully');
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
    
  } catch (error) {
    console.error('❌ Export Products API: Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export products' },
      { status: 500 }
    );
  }
}
