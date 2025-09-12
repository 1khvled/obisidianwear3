'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Product } from '@/types';
import { useOptimizedUserData } from '@/context/OptimizedUserDataContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import HeroSection from '@/components/HeroSection';
import ProductGrid from '@/components/ProductGrid';
import MadeToOrderCTA from '@/components/MadeToOrderCTA';
import { HeroSkeleton } from '@/components/ProductGridSkeleton';

export default function HomeRefactored() {
  const { products, loading } = useOptimizedUserData();
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Use only regular products on the main page
  const allProducts = useMemo(() => {
    return products || [];
  }, [products]);

  useEffect(() => {
    if (!loading && allProducts.length > 0) {
      setIsPageLoading(false);
    }
  }, [loading, allProducts.length]);

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <HeroSkeleton />
        <Footer />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">
        <Header />
        <HeroSection />
        <ProductGrid products={allProducts} loading={loading} />
        <MadeToOrderCTA />
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
