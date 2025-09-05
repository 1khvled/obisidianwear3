// Test script to add a product with SOON status
// Run this in your browser console or as a Node.js script

const testProduct = {
  name: "Test SOON Product",
  description: "This is a test product with SOON status",
  price: 1500,
  originalPrice: 2000,
  image: "https://via.placeholder.com/400x500/1a1a1a/ffffff?text=SOON+PRODUCT",
  images: ["https://via.placeholder.com/400x500/1a1a1a/ffffff?text=SOON+PRODUCT"],
  category: "Test",
  sizes: ["S", "M", "L", "XL"],
  colors: ["Black", "White"],
  inStock: false, // SOON products should not be in stock
  status: "soon", // This is the key field
  rating: 0,
  reviews: 0,
  stock: {
    "S": { "Black": 0, "White": 0 },
    "M": { "Black": 0, "White": 0 },
    "L": { "Black": 0, "White": 0 },
    "XL": { "Black": 0, "White": 0 }
  },
  sku: "TEST-SOON-001",
  weight: 0.5,
  dimensions: { length: 30, width: 25, height: 2 },
  tags: ["test", "soon", "coming-soon"],
  featured: false
};

console.log('Test product with SOON status:', testProduct);
