// Test orders table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zrmxcjklkthpyanfslsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybXhjamtsa3RocHlhbmZzbHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDYxMzAsImV4cCI6MjA3MjQ4MjEzMH0.2Tjh9pPzc6BUGoV3lDUBymXzE_dvAGs1O_WewTdetE0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrdersTable() {
  console.log('Testing orders table...');
  
  try {
    // Test if orders table exists
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Orders table error:', error);
    } else {
      console.log('Orders table exists, data:', data);
    }
  } catch (error) {
    console.error('Orders table connection error:', error);
  }
}

testOrdersTable();
