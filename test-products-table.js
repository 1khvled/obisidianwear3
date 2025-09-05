// Test products table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zrmxcjklkthpyanfslsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybXhjamtsa3RocHlhbmZzbHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDYxMzAsImV4cCI6MjA3MjQ4MjEzMH0.2Tjh9pPzc6BUGoV3lDUBymXzE_dvAGs1O_WewTdetE0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductsTable() {
  console.log('Testing products table...');
  
  try {
    // Test if products table exists
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Products table error:', error);
    } else {
      console.log('Products table exists, data:', data);
    }
  } catch (error) {
    console.error('Products table connection error:', error);
  }
}

testProductsTable();
