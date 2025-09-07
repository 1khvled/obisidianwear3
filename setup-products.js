const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupProductsTable() {
  try {
    console.log('🔧 Setting up products table...');
    
    // Read the SQL schema
    const sqlSchema = fs.readFileSync('sql/products-schema.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlSchema });
    
    if (error) {
      console.error('❌ Error creating products table:', error);
      
      // Try alternative approach - execute SQL directly
      console.log('🔧 Trying alternative approach...');
      const { data: altData, error: altError } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      if (altError) {
        console.error('❌ Products table does not exist:', altError.message);
        console.log('📝 Please run the following SQL in your Supabase SQL editor:');
        console.log('---');
        console.log(sqlSchema);
        console.log('---');
        return;
      } else {
        console.log('✅ Products table already exists');
      }
    } else {
      console.log('✅ Products table created successfully');
    }
    
    // Test the table
    console.log('🔧 Testing products table...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error testing products table:', testError);
    } else {
      console.log('✅ Products table is working');
      console.log('📊 Current products count:', testData?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

setupProductsTable();
