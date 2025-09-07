// Setup script for Made to Order functionality
// This script will help you set up the database tables

console.log('🚀 Made to Order Setup Guide');
console.log('');
console.log('📋 To complete the setup, you need to:');
console.log('');
console.log('1️⃣ Run the SQL script in your Supabase dashboard:');
console.log('   - Go to your Supabase project dashboard');
console.log('   - Navigate to SQL Editor');
console.log('   - Copy and paste the contents of sql/made-to-order-schema.sql');
console.log('   - Click "Run" to create the tables');
console.log('');
console.log('2️⃣ Update your WhatsApp number:');
console.log('   - Open src/app/made-to-order/page.tsx');
console.log('   - Find the line: const phoneNumber = "+213123456789";');
console.log('   - Replace with your actual WhatsApp number');
console.log('');
console.log('3️⃣ Test the functionality:');
console.log('   - Visit http://localhost:3002/made-to-order');
console.log('   - Visit http://localhost:3002/admin');
console.log('   - Try adding a made-to-order product');
console.log('   - Test the order form');
console.log('');
console.log('✅ Features included:');
console.log('   - Made-to-order product management');
console.log('   - Order tracking system');
console.log('   - WhatsApp integration');
console.log('   - Wilaya tariff pricing');
console.log('   - Shipping cost calculation');
console.log('   - 50% deposit system');
console.log('   - Beautiful black theme UI');
console.log('');
console.log('🎯 The system is ready to use once you complete the database setup!');

// Check if we can connect to the API
fetch('/api/made-to-order')
  .then(response => {
    if (response.ok) {
      console.log('✅ Made-to-order API is working!');
    } else {
      console.log('❌ Made-to-order API needs database setup');
    }
  })
  .catch(error => {
    console.log('❌ Made-to-order API not accessible:', error.message);
  });
