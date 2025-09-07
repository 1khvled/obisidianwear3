import { NextResponse } from 'next/server';
import { addProduct } from '@/lib/supabaseDatabase';

export async function POST() {
  try {
    console.log('🔧 Testing addProduct directly...');
    
    const testProduct = {
      id: 'test-' + Date.now(),
      name: 'Test Product',
      price: 100,
      originalPrice: 120,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop',
      images: [],
      description: 'Test product description',
      category: 'T-Shirts',
      sizes: ['S', 'M', 'L'],
      colors: ['Black'],
      inStock: true,
      rating: 0,
      reviews: 0,
      stock: {
        S: { Black: 10 },
        M: { Black: 15 },
        L: { Black: 12 }
      },
      sku: 'TEST-001',
      weight: 0.2,
      dimensions: '30x40',
      tags: ['test'],
      featured: false,
      sizeChartCategory: 'T-Shirts',
      customSizeChart: null,
      useCustomSizeChart: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('🔧 Test product:', JSON.stringify(testProduct, null, 2));
    
    const result = await addProduct(testProduct);
    console.log('🔧 Add product result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Test product added successfully',
      product: result
    });
    
  } catch (error) {
    console.error('❌ Test addProduct error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
