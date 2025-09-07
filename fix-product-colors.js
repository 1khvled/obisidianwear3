const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProductColors() {
  try {
    console.log('Fetching products...');
    
    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      return;
    }
    
    console.log(`Found ${products.length} products`);
    
    // Update each product to have default colors and stock if missing
    for (const product of products) {
      const updates = {};
      let needsUpdate = false;
      
      // Fix empty colors array
      if (!product.colors || product.colors.length === 0) {
        updates.colors = ['Black'];
        needsUpdate = true;
        console.log(`Fixing colors for product: ${product.name}`);
      }
      
      // Fix empty stock object
      if (!product.stock || Object.keys(product.stock).length === 0) {
        updates.stock = {
          S: { Black: 10 },
          M: { Black: 15 },
          L: { Black: 12 },
          XL: { Black: 8 }
        };
        needsUpdate = true;
        console.log(`Fixing stock for product: ${product.name}`);
      }
      
      // Fix empty sizes array
      if (!product.sizes || product.sizes.length === 0) {
        updates.sizes = ['S', 'M', 'L', 'XL'];
        needsUpdate = true;
        console.log(`Fixing sizes for product: ${product.name}`);
      }
      
      // Update the product if needed
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('products')
          .update(updates)
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`Error updating product ${product.name}:`, updateError);
        } else {
          console.log(`✅ Updated product: ${product.name}`);
        }
      }
    }
    
    console.log('✅ All products updated successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixProductColors();
