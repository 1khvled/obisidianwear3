// Test Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zrmxcjklkthpyanfslsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybXhjamtsa3RocHlhbmZzbHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDYxMzAsImV4cCI6MjA3MjQ4MjEzMH0.2Tjh9pPzc6BUGoV3lDUBymXzE_dvAGs1O_WewTdetE0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection by querying a simple table
    const { data, error } = await supabase
      .from('maintenance_status')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('Supabase connection successful:', data);
    }
  } catch (error) {
    console.error('Connection error:', error);
  }
}

testSupabase();
