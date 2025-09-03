'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { products as initialProducts } from '@/data/products';
import { dataService } from '@/services/dataService';

interface ProductContextType {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load products from shared data service
    const loadProducts = () => {
      const savedProducts = dataService.getProducts();
      if (savedProducts.length > 0) {
        setProducts(savedProducts);
      } else {
        // Initialize with default products if none exist
        setProducts(initialProducts);
        // Save initial products to shared storage
        initialProducts.forEach(product => {
          dataService.addProduct(product);
        });
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

  const addProduct = (product: Product) => {
    const newProduct = dataService.addProduct(product);
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
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
    
    const result = dataService.updateProduct(id, syncedProduct);
    setProducts(prev => prev.map(p => p.id === id ? result : p));
  };

  const deleteProduct = (id: string) => {
    dataService.deleteProduct(id);
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  return (
    <ProductContext.Provider value={{
      products,
      setProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct
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
