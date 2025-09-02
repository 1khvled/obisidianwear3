import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'OBSIDIAN HOODIE BLACK',
    price: 4500,
    originalPrice: 5000,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=600&fit=crop',
    description: 'Hoodie oversize premium en coton 100%. Design minimaliste avec logo OBSIDIAN brodé.',
    category: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black'],
    inStock: true,
    rating: 4.9,
    reviews: 127,
    stock: {
      S: 15,
      M: 20,
      L: 18,
      XL: 12
    }
  },
  {
    id: '2',
    name: 'OBSIDIAN TEE WHITE',
    price: 2500,
    originalPrice: 3000,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop',
    description: 'T-shirt premium en coton 100%. Coupe oversize avec logo OBSIDIAN discret.',
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black'],
    inStock: true,
    rating: 4.8,
    reviews: 89,
    stock: {
      S: 25,
      M: 30,
      L: 22,
      XL: 18
    }
  },
  {
    id: '3',
    name: 'OBSIDIAN JOGGERS BLACK',
    price: 3500,
    originalPrice: 4000,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop',
    description: 'Joggers confortables en coton mélangé. Coupe moderne avec logo OBSIDIAN.',
    category: 'Pants',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray'],
    inStock: true,
    rating: 4.7,
    reviews: 56,
    stock: {
      S: 10,
      M: 15,
      L: 12,
      XL: 8
    }
  }
];

export const categories = [
  'All',
  'Hoodies',
  'T-Shirts',
  'Pants'
];
