// Import inventory from CSV file
// Run with: node import-inventory-from-csv.js

const fs = require('fs');
const csv = require('csv-parser');

async function importInventoryFromCSV() {
  const baseUrl = 'https://obsidian-wear.vercel.app'; // Replace with your URL
  const inventoryMap = new Map();
  
  // Read CSV file
  fs.createReadStream('inventory-template.csv')
    .pipe(csv())
    .on('data', (row) => {
      const { product_id, size, color, quantity } = row;
      
      if (!inventoryMap.has(product_id)) {
        inventoryMap.set(product_id, {});
      }
      
      if (!inventoryMap.get(product_id)[size]) {
        inventoryMap.get(product_id)[size] = {};
      }
      
      inventoryMap.get(product_id)[size][color] = parseInt(quantity);
    })
    .on('end', async () => {
      console.log('CSV data loaded. Updating inventory...');
      
      // Update each product's inventory
      for (const [productId, stock] of inventoryMap) {
        try {
          console.log(`Updating inventory for product ${productId}...`);
          
          const response = await fetch(`${baseUrl}/api/inventory/${productId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              stock: stock,
              inStock: true
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            console.log(`✅ Successfully updated inventory for ${productId}`);
            console.log(`   Total stock: ${result.data.totalStock}`);
          } else {
            console.error(`❌ Failed to update inventory for ${productId}:`, result.error);
          }
        } catch (error) {
          console.error(`❌ Error updating inventory for ${productId}:`, error.message);
        }
      }
      
      console.log('Inventory import completed!');
    });
}

// Run the import
importInventoryFromCSV();
