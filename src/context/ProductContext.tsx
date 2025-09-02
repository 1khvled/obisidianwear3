'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { products as initialProducts } from '@/data/products';

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
    // Load products from localStorage or use initial products
    if (typeof window !== 'undefined') {
      const savedProducts = localStorage.getItem('obsidian-products');
      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts));
        } catch (error) {
          console.error('Error loading products from localStorage:', error);
          setProducts(initialProducts);
        }
      } else {
        setProducts(initialProducts);
      }
    } else {
      setProducts(initialProducts);
    }
  }, []);

  const addProduct = (product: Product) => {
    const newProducts = [...products, product];
    setProducts(newProducts);
    if (typeof window !== 'undefined') {
      localStorage.setItem('obsidian-products', JSON.stringify(newProducts));
    }
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    const newProducts = products.map(product => 
      product.id === id ? updatedProduct : product
    );
    setProducts(newProducts);
    if (typeof window !== 'undefined') {
      localStorage.setItem('obsidian-products', JSON.stringify(newProducts));
    }
  };

  const deleteProduct = (id: string) => {
    const newProducts = products.filter(product => product.id !== id);
    setProducts(newProducts);
    if (typeof window !== 'undefined') {
      localStorage.setItem('obsidian-products', JSON.stringify(newProducts));
    }
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
