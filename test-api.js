// Test script to debug API endpoints
// Using built-in fetch in Node.js 18+

async function testAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing API endpoints...\n');
  
  // Test database initialization
  try {
    console.log('1. Testing database initialization...');
    const initResponse = await fetch(`${baseUrl}/api/init-db`, { method: 'POST' });
    const initData = await initResponse.json();
    console.log('Init DB Response:', initData);
  } catch (error) {
    console.error('Init DB Error:', error.message);
  }
  
  // Test orders API
  try {
    console.log('\n2. Testing orders API...');
    const ordersResponse = await fetch(`${baseUrl}/api/orders`);
    const ordersData = await ordersResponse.json();
    console.log('Orders Response:', ordersData);
  } catch (error) {
    console.error('Orders Error:', error.message);
  }
  
  // Test products API
  try {
    console.log('\n3. Testing products API...');
    const productsResponse = await fetch(`${baseUrl}/api/products`);
    const productsData = await productsResponse.json();
    console.log('Products Response:', productsData);
  } catch (error) {
    console.error('Products Error:', error.message);
  }
  
  // Test maintenance API
  try {
    console.log('\n4. Testing maintenance API...');
    const maintenanceResponse = await fetch(`${baseUrl}/api/maintenance`);
    const maintenanceData = await maintenanceResponse.json();
    console.log('Maintenance Response:', maintenanceData);
  } catch (error) {
    console.error('Maintenance Error:', error.message);
  }
}

testAPI().catch(console.error);
