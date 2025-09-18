'use client';

import React, { useState, useEffect, lazy, Suspense, memo, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLightweight } from '@/context/LightweightProvider';
import { useSmartPreload } from '@/hooks/useSmartPreload';
import { useMobileOptimizedPreload } from '@/hooks/useMobileOptimizedPreload';
import { ShoppingBag, Eye, Search, Heart } from 'lucide-react';

// Lazy load components
const Header = lazy(() => import('@/components/Header'));
const Footer = lazy(() => import('@/components/Footer'));

// Loading skeleton
const ProductSkeleton = () => (
  <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-800"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-800 rounded mb-2"></div>
      <div className="h-3 bg-gray-800 rounded mb-4 w-2/3"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-gray-800 rounded flex-1"></div>
        <div className="h-8 bg-gray-800 rounded flex-1"></div>
      </div>
    </div>
  </div>
);

// Memoized product card
const ProductCard = memo(({ 
  product, 
  onViewDetails, 
  onOrder 
}: { 
  product: any; 
  onViewDetails: (product: any) => void;
  onOrder: (product: any) => void;
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isOrderLoading, setIsOrderLoading] = useState(false);

  const handleViewClick = useCallback(async () => {
    setIsViewLoading(true);
    try {
      await onViewDetails(product);
    } finally {
      setIsViewLoading(false);
    }
  }, [product, onViewDetails]);

  const handleOrderClick = useCallback(async () => {
    setIsOrderLoading(true);
    try {
      await onOrder(product);
    } finally {
      setIsOrderLoading(false);
    }
  }, [product, onOrder]);

  return (
    <div className="bg-black border border-white/20 rounded-lg overflow-hidden hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image || product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isLiked 
              ? 'bg-white text-black' 
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white line-clamp-2">
              {product.name}
            </h3>
            {product.category && (
              <span className="text-xs text-purple-400 font-medium uppercase tracking-wider">
                {product.category}
              </span>
            )}
          </div>
          <span className="text-xl font-bold text-white">{Number(product.price).toFixed(0)} DZD</span>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewClick}
              disabled={isViewLoading || isOrderLoading}
              className="px-3 py-2 bg-white text-black rounded text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isViewLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {isViewLoading ? 'Loading...' : 'View'}
            </button>
            <button
              onClick={handleOrderClick}
              disabled={isViewLoading || isOrderLoading}
              className="px-3 py-2 bg-purple-600 text-white rounded text-sm font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors duration-200 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isOrderLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
              {isOrderLoading ? 'Loading...' : 'Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default function HomePage() {
  const router = useRouter();
  const { products, loading } = useLightweight();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCustomOrderLoading, setIsCustomOrderLoading] = useState(false);
  const [isHomePageLoaded, setIsHomePageLoaded] = useState(false);

  // Mobile-optimized preloading
  const { 
    isPreloading: isMobilePreloading, 
    isPreloaded: isMobilePreloaded, 
    preloadProgress: mobilePreloadProgress,
    isMobile,
    connectionType,
    scheduleMobilePreload, 
    startMobilePreload 
  } = useMobileOptimizedPreload();

  // Smart preloading for made-to-order page (desktop)
  const { 
    isPreloading, 
    isPreloaded, 
    preloadProgress, 
    schedulePreload, 
    startPreload 
  } = useSmartPreload({
    delay: 3000, // Start preloading 3 seconds after home page loads
    priority: 'high',
    onComplete: () => {
      console.log('🚀 Made-to-order page preloaded successfully!');
    },
    onError: (error) => {
      console.error('❌ Preload failed:', error);
    }
  });

  // Use mobile or desktop preloading based on device
  const finalIsPreloading = isMobile ? isMobilePreloading : isPreloading;
  const finalIsPreloaded = isMobile ? isMobilePreloaded : isPreloaded;
  const finalPreloadProgress = isMobile ? mobilePreloadProgress : preloadProgress;
  const finalSchedulePreload = isMobile ? scheduleMobilePreload : schedulePreload;
  const finalStartPreload = isMobile ? startMobilePreload : startPreload;

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return products.filter(product => {
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Memoize unique categories
  const categories = useMemo(() => {
    if (!products || products.length === 0) return [];
    return Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  }, [products]);

  const handleViewDetails = useCallback((product: any) => {
    router.push(`/product/${product.id}`);
  }, [router]);

  const handleOrderClick = useCallback((product: any) => {
    const productData = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.images?.[0],
      description: product.description,
      colors: product.colors,
      sizes: product.sizes,
      category: product.category,
      type: 'collection'
    };

    sessionStorage.setItem('checkoutProduct', JSON.stringify(productData));
    router.push('/checkout');
  }, [router]);

  const handleCustomOrder = useCallback(async () => {
    setIsCustomOrderLoading(true);
    try {
      // If preloaded, navigate immediately; otherwise, start preload and navigate
      if (finalIsPreloaded) {
        await router.push('/made-to-order');
      } else {
        // Start preload and navigate
        finalStartPreload();
        await router.push('/made-to-order');
      }
    } finally {
      setIsCustomOrderLoading(false);
    }
  }, [router, finalIsPreloaded, finalStartPreload]);

  // Effect to detect when home page is fully loaded and start preloading
  useEffect(() => {
    if (!loading && products && products.length > 0 && !isHomePageLoaded) {
      setIsHomePageLoaded(true);
      // Schedule preloading after home page is fully loaded
      finalSchedulePreload();
    }
  }, [loading, products, isHomePageLoaded, finalSchedulePreload]);

  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={<div className="h-20 bg-gray-900 animate-pulse" />}>
        <Header />
      </Suspense>

      {/* Custom Order CTA Section */}
      <div className="pt-20 pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 mx-4 mb-6 border-2 border-violet-500/30">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase tracking-wider">
                Custom Orders Available!
              </h2>
              <p className="text-white/90 mb-6 text-sm md:text-base">
                Can't find what you want in the DROP? Order custom.
              </p>
              
              
              <div className="flex justify-center">
                <button
                  onClick={handleCustomOrder}
                  disabled={isCustomOrderLoading}
                  className="group bg-white text-violet-600 font-black px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 transform uppercase tracking-wider text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isCustomOrderLoading ? (
                    <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="group-hover:animate-pulse">→</span>
                  )}
                  {isCustomOrderLoading ? 'Loading...' : 'Start Custom Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Search */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-300 text-black placeholder-gray-500 w-80 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Category Filters */}
          {products && products.length > 0 && (
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  All Products
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category!)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-white mb-4">No Products Available</h3>
              <p className="text-gray-400">Check back later for new products.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-white mb-4">No Products Match Search</h3>
              <p className="text-gray-400 mb-6">Try a different search term.</p>
              <button
                onClick={handleCustomOrder}
                disabled={isCustomOrderLoading}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCustomOrderLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>→</span>
                )}
                {isCustomOrderLoading ? 'Loading...' : "Can't find what you want? Order custom"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard
                    product={product}
                    onViewDetails={handleViewDetails}
                    onOrder={handleOrderClick}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Suspense fallback={<div className="h-32 bg-gray-900 animate-pulse" />}>
        <Footer />
      </Suspense>

    </div>
  );
}
