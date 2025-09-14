import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('📊 Export Inventory API: Starting export...');
    
    const products = await getProducts();
    console.log(`📊 Export Inventory API: Found ${products.length} products`);
    
    // Create CSV header
    const headers = [
      'Product ID',
      'Product Name',
      'Category',
      'Size',
      'Color',
      'Quantity',
      'In Stock',
      'Last Updated'
    ];
    
    // Create CSV rows for each size/color combination
    const rows: string[][] = [];
    
    products.forEach(product => {
      const stock = product.stock || {};
      const sizes = product.sizes || [];
      const colors = product.colors || [];
      
      sizes.forEach(size => {
        colors.forEach(color => {
          const quantity = stock[size]?.[color] || 0;
          rows.push([
            product.id,
            `"${product.name}"`,
            product.category,
            size,
            color,
            quantity.toString(),
            quantity > 0 ? 'Yes' : 'No',
            product.updatedAt ? new Date(product.updatedAt).toISOString() : ''
          ]);
        });
      });
    });
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    console.log(`✅ Export Inventory API: CSV generated successfully with ${rows.length} inventory records`);
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="inventory-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
    
  } catch (error) {
    console.error('❌ Export Inventory API: Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export inventory' },
      { status: 500 }
    );
  }
}
