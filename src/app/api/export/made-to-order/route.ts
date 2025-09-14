import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function GET() {
  try {
    console.log('📊 Export Made-to-Order API: Starting export...');
    
    // Get made-to-order products
    const { data: products, error } = await supabase
      .from('made_to_order_products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Export Made-to-Order API: Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch made-to-order products' },
        { status: 500 }
      );
    }
    
    console.log(`📊 Export Made-to-Order API: Found ${products?.length || 0} products`);
    
    // Create CSV header
    const headers = [
      'ID',
      'Name',
      'Description',
      'Price',
      'Category',
      'Sizes',
      'Colors',
      'Allow Custom Text',
      'Allow Custom Design',
      'Use Custom Size Chart',
      'Size Chart Category',
      'In Stock',
      'Rating',
      'Reviews',
      'Display Order',
      'Created At',
      'Updated At'
    ];
    
    // Create CSV rows
    const rows = (products || []).map(product => {
      return [
        product.id,
        `"${product.name}"`,
        `"${product.description || ''}"`,
        product.price,
        product.category,
        `"${(product.sizes || []).join(', ')}"`,
        `"${(product.colors || []).join(', ')}"`,
        product.allow_custom_text ? 'Yes' : 'No',
        product.allow_custom_design ? 'Yes' : 'No',
        product.use_custom_size_chart ? 'Yes' : 'No',
        product.size_chart_category || '',
        product.in_stock ? 'Yes' : 'No',
        product.rating || 0,
        product.reviews || 0,
        product.display_order || 0,
        product.created_at ? new Date(product.created_at).toISOString() : '',
        product.updated_at ? new Date(product.updated_at).toISOString() : ''
      ];
    });
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    console.log('✅ Export Made-to-Order API: CSV generated successfully');
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="made-to-order-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
    
  } catch (error) {
    console.error('❌ Export Made-to-Order API: Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export made-to-order products' },
      { status: 500 }
    );
  }
}
