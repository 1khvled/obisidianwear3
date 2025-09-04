// Script to add inventory to Supabase via API
// Run this with: node add-inventory-script.js

const inventoryData = {
  // Example inventory data
  "PROD-123": {
    stock: {
      "S": { "Black": 10, "White": 5, "Red": 8 },
      "M": { "Black": 15, "White": 12, "Red": 10 },
      "L": { "Black": 20, "White": 18, "Red": 15 },
      "XL": { "Black": 8, "White": 6, "Red": 5 }
    },
    inStock: true
  },
  "PROD-456": {
    stock: {
      "S": { "Black": 25, "White": 20 },
      "M": { "Black": 30, "White": 25 },
      "L": { "Black": 35, "White": 30 },
      "XL": { "Black": 20, "White": 15 }
    },
    inStock: true
  }
};

async function addInventory() {
  const baseUrl = 'https://obsidian-wear.vercel.app'; // Replace with your URL
  
  for (const [productId, data] of Object.entries(inventoryData)) {
    try {
      console.log(`Adding inventory for product ${productId}...`);
      
      const response = await fetch(`${baseUrl}/api/inventory/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Successfully added inventory for ${productId}`);
        console.log(`   Total stock: ${result.data.totalStock}`);
      } else {
        console.error(`❌ Failed to add inventory for ${productId}:`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error adding inventory for ${productId}:`, error.message);
    }
  }
}

// Run the script
addInventory();
