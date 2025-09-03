import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'OBSIDIAN HOODIE BLACK',
    price: 4500,
    originalPrice: 5000,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=600&fit=crop',
    description: 'Premium black hoodie with embroidered OBSIDIAN logo. Made from 100% cotton for ultimate comfort.',
    category: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black'],
    inStock: true,
    rating: 4.9,
    reviews: 127,
    stock: {
      S: { Black: 15 },
      M: { Black: 20 },
      L: { Black: 18 },
      XL: { Black: 12 }
    },
    sku: 'OBS-HOODIE-001',
    weight: 0.8,
    tags: ['hoodie', 'black', 'premium'],
    featured: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: '2',
    name: 'OBSIDIAN TEE WHITE',
    price: 2500,
    originalPrice: 3000,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop',
    description: 'Premium white t-shirt with subtle OBSIDIAN branding. 100% cotton oversized fit.',
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black'],
    inStock: true,
    rating: 4.8,
    reviews: 89,
    stock: {
      S: { White: 25, Black: 20 },
      M: { White: 30, Black: 25 },
      L: { White: 22, Black: 18 },
      XL: { White: 18, Black: 15 }
    },
    sku: 'OBS-TEE-002',
    weight: 0.3,
    tags: ['tshirt', 'white', 'black'],
    featured: false,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-10')
  },
  {
    id: '3',
    name: 'OBSIDIAN JOGGERS BLACK',
    price: 3500,
    originalPrice: 4000,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop',
    description: 'Comfortable joggers in cotton blend. Modern fit with OBSIDIAN logo.',
    category: 'Pants',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray'],
    inStock: true,
    rating: 4.7,
    reviews: 56,
    stock: {
      S: { Black: 10, Gray: 8 },
      M: { Black: 15, Gray: 12 },
      L: { Black: 12, Gray: 10 },
      XL: { Black: 8, Gray: 6 }
    },
    sku: 'OBS-JOGGERS-003',
    weight: 0.5,
    tags: ['joggers', 'black', 'gray'],
    featured: true,
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-12')
  },
  {
    id: '4',
    name: 'OBSIDIAN HOODIE GRAY',
    price: 4500,
    originalPrice: 5000,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=600&fit=crop',
    description: 'Premium gray hoodie with embroidered OBSIDIAN logo. Oversized fit, 100% cotton.',
    category: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gray'],
    inStock: true,
    rating: 4.9,
    reviews: 98,
    stock: {
      S: { Gray: 12 },
      M: { Gray: 18 },
      L: { Gray: 15 },
      XL: { Gray: 10 }
    },
    sku: 'OBS-HOODIE-004',
    weight: 0.8,
    tags: ['hoodie', 'gray', 'premium'],
    featured: true,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-18')
  },
  {
    id: '5',
    name: 'OBSIDIAN TEE BLACK',
    price: 2500,
    originalPrice: 3000,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f37f9d3d?w=500&h=600&fit=crop',
    description: 'Classic black t-shirt with OBSIDIAN logo. Essential piece for any wardrobe.',
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black'],
    inStock: true,
    rating: 4.8,
    reviews: 156,
    stock: {
      S: { Black: 20 },
      M: { Black: 30 },
      L: { Black: 25 },
      XL: { Black: 18 }
    },
    sku: 'OBS-TEE-005',
    weight: 0.3,
    tags: ['tshirt', 'black', 'essential'],
    featured: false,
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-20')
  }
];

export const categories = [
  'All',
  'Hoodies',
  'T-Shirts',
  'Pants'
];
