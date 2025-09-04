'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';

import { backendService } from '@/services/backendService';

interface ProductContextType {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  initializeDefaultProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load products from backend service
    const loadProducts = async () => {
      try {
        console.log('ProductContext: Loading products...');
        const savedProducts = await backendService.getProducts();
        console.log('ProductContext: Loaded products:', savedProducts.length);
        setProducts(savedProducts);
      } catch (error) {
        console.error('ProductContext: Error loading products:', error);
        // Don't set empty array immediately, keep existing products if any
        if (products.length === 0) {
          setProducts([]);
        }
      }
    };

    loadProducts();

    // Listen for data updates from other tabs/users
    const handleDataUpdate = (event: CustomEvent) => {
      const data = event.detail;
      if (data && data.products) {
        setProducts(data.products);
      }
    };

    const handleDataSync = (event: CustomEvent) => {
      const data = event.detail;
      if (data && data.products) {
        setProducts(data.products);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('data-updated', handleDataUpdate as EventListener);
      window.addEventListener('data-sync', handleDataSync as EventListener);
      
      return () => {
        window.removeEventListener('data-updated', handleDataUpdate as EventListener);
        window.removeEventListener('data-sync', handleDataSync as EventListener);
      };
    }
  }, []);

  const addProduct = async (product: Product) => {
    const newProduct = await backendService.addProduct(product);
    if (newProduct) {
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const updateProduct = async (id: string, updatedProduct: Product) => {
    // Auto-sync inStock status based on actual stock levels
    const totalStock = updatedProduct.stock ? 
      Object.values(updatedProduct.stock).reduce((total, colorStock) => {
        return total + Object.values(colorStock).reduce((sum, qty) => sum + qty, 0);
      }, 0) : 0;
    
    const syncedProduct = {
      ...updatedProduct,
      inStock: totalStock > 0
    };
    
    console.log('ProductContext: Updating product', id, syncedProduct.name, 'Stock:', totalStock, 'InStock:', syncedProduct.inStock);
    
    const result = await backendService.updateProduct(id, syncedProduct);
    if (result) {
      setProducts(prev => prev.map(p => p.id === id ? result : p));
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('ProductContext: Deleting product:', id);
      const success = await backendService.deleteProduct(id);
      if (success) {
        console.log('ProductContext: Product deleted successfully:', id);
        setProducts(prev => prev.filter(product => product.id !== id));
      } else {
        console.error('ProductContext: Failed to delete product:', id);
      }
    } catch (error) {
      console.error('ProductContext: Error deleting product:', error);
    }
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const initializeDefaultProducts = async () => {
    // Only initialize if no products exist
    if (products.length === 0) {
      const defaultProducts: Product[] = [
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
            'S': { 'Black': 15 },
            'M': { 'Black': 20 },
            'L': { 'Black': 18 },
            'XL': { 'Black': 12 }
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
            'S': { 'White': 25, 'Black': 20 },
            'M': { 'White': 30, 'Black': 25 },
            'L': { 'White': 22, 'Black': 18 },
            'XL': { 'White': 18, 'Black': 15 }
          },
          sku: 'OBS-TEE-002',
          weight: 0.3,
          tags: ['tshirt', 'white', 'black'],
          featured: false,
          createdAt: new Date('2025-01-05'),
          updatedAt: new Date('2025-01-10')
        }
      ];
      
      for (const product of defaultProducts) {
        const { id, ...productWithoutId } = product;
        await backendService.addProduct(productWithoutId);
      }
      
      setProducts(defaultProducts);
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      setProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      initializeDefaultProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
