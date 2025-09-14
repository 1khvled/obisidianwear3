'use client';

import { useState, useEffect } from 'react';
import { getCachedData, setCachedData, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export function useFastMadeToOrder() {
  const [products, setProducts] = useState<any[]>([]);
  const [wilayaTariffs, setWilayaTariffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const cachedProducts = getCachedData<any[]>(CACHE_KEYS.MADE_TO_ORDER_PRODUCTS);
        if (cachedProducts) {
          console.log('🚀 Using cached made-to-order products');
          setProducts(cachedProducts);
          setLoading(false);
        }
        
        // Always fetch fresh data in background
        const productsResponse = await fetch('/api/made-to-order');
        const productsData = await productsResponse.json();
        const freshProducts = Array.isArray(productsData) ? productsData : (productsData?.data || []);
        
        // Update cache and UI
        setCachedData(CACHE_KEYS.MADE_TO_ORDER_PRODUCTS, freshProducts, CACHE_TTL.MADE_TO_ORDER_PRODUCTS);
        setProducts(freshProducts);
        setLoading(false);
        
        // Load wilaya tariffs in background (not critical)
        const cachedWilayas = getCachedData<any[]>(CACHE_KEYS.WILAYA_TARIFFS);
        if (cachedWilayas) {
          setWilayaTariffs(cachedWilayas);
        } else {
          try {
            const wilayaResponse = await fetch('/api/wilaya');
            const wilayaData = await wilayaResponse.json();
            const wilayas = wilayaData?.data || [];
            setCachedData(CACHE_KEYS.WILAYA_TARIFFS, wilayas, CACHE_TTL.WILAYA_TARIFFS);
            setWilayaTariffs(wilayas);
          } catch (error) {
            console.error('Wilaya loading failed:', error);
            setWilayaTariffs([]);
          }
        }
        
      } catch (error) {
        console.error('Error loading made-to-order data:', error);
        setProducts([]);
        setWilayaTariffs([]);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { products, wilayaTariffs, loading };
}
