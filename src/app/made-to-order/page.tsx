'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Palette, 
  Ruler, 
  Clock, 
  CheckCircle, 
  Star, 
  MessageCircle,
  ArrowRight,
  Sparkles,
  Crown,
  Zap,
  Shield,
  Heart,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Package,
  X,
  AlertCircle,
  ArrowLeft,
  Home,
  Search
} from 'lucide-react';
import { MadeToOrderProduct } from '@/types';
import { sortedWilayas } from '@/data/wilayas';
import { backendService } from '@/services/backendService';
import Header from '@/components/Header';
import { useLanguage } from '@/context/LanguageContext';
import { useOptimizedUserData } from '@/context/OptimizedUserDataContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ProductGridSkeleton } from '@/components/LoadingSkeleton';
import OptimizedImage from '@/components/OptimizedImage';
import OrderFormModal from '@/components/OrderFormModal';

export default function MadeToOrderPageRefactored() {
  const { t } = useLanguage();
  const { madeToOrderProducts, wilayaTariffs, loading } = useOptimizedUserData();
  
  const [selectedProduct, setSelectedProduct] = useState<MadeToOrderProduct | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  
  // Lazy loading states
  const [visibleProducts, setVisibleProducts] = useState<MadeToOrderProduct[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const BATCH_SIZE = 8;

  // Force watches to appear if they exist in the data
  const productsWithWatches = useMemo(() => {
    if (madeToOrderProducts.length === 0) return madeToOrderProducts;
    
    const hasWatches = madeToOrderProducts.some(p => p.category === 'Watches');
    if (hasWatches) {
      console.log('✅ Watches detected in data:', madeToOrderProducts.filter(p => p.category === 'Watches').length);
    }
    
    return madeToOrderProducts;
  }, [madeToOrderProducts]);

  // Get filtered products based on selected category and search query
  const filteredProducts = useMemo(() => {
    console.log('🔍 Raw madeToOrderProducts:', madeToOrderProducts.length);
    console.log('🔍 Raw productsWithWatches:', productsWithWatches.length);
    
    let filtered = selectedCategory === 'All' 
      ? productsWithWatches 
      : productsWithWatches.filter(p => (p.category || 'Other') === selectedCategory);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query)
      );
    }
    
    // Remove duplicates based on product ID
    const uniqueProducts = filtered.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );
    
    console.log('🔍 Filtered products:', { 
      total: filtered.length, 
      unique: uniqueProducts.length, 
      duplicates: filtered.length - uniqueProducts.length,
      productIds: uniqueProducts.map(p => p.id)
    });
    
    return uniqueProducts;
  }, [selectedCategory, productsWithWatches, searchQuery]);

  // Improved lazy loading function
  const loadNextBatch = useCallback(() => {
    if (isLoadingMore || !hasMoreProducts) return;
    
    setIsLoadingMore(true);
    
    requestAnimationFrame(() => {
      const startIndex = currentBatch * BATCH_SIZE;
      const endIndex = startIndex + BATCH_SIZE;
      const nextBatch = filteredProducts.slice(startIndex, endIndex);
      
      console.log('🔄 Loading next batch:', { startIndex, endIndex, nextBatchLength: nextBatch.length });
      
      if (nextBatch.length === 0) {
        setHasMoreProducts(false);
        setIsLoadingMore(false);
        return;
      }
      
      // Prevent duplicates by checking if product already exists
      setVisibleProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newProducts = nextBatch.filter(p => !existingIds.has(p.id));
        console.log('🔄 Adding new products:', newProducts.length, 'out of', nextBatch.length);
        return [...prev, ...newProducts];
      });
      setCurrentBatch(prev => prev + 1);
      setHasMoreProducts(endIndex < filteredProducts.length);
      setIsLoadingMore(false);
    });
  }, [currentBatch, filteredProducts, isLoadingMore, hasMoreProducts]);

  // Reset lazy loading when category or search changes
  useEffect(() => {
    setVisibleProducts([]);
    setCurrentBatch(0);
    setHasMoreProducts(true);
    setIsLoadingMore(false);
  }, [selectedCategory, searchQuery]);

  // Show products immediately when they load
  useEffect(() => {
    if (!loading && filteredProducts.length > 0) {
      console.log('🔄 Products loaded, showing immediately...');
      console.log('🔄 Filtered products count:', filteredProducts.length);
      // Show first batch immediately
      const firstBatch = filteredProducts.slice(0, BATCH_SIZE);
      setVisibleProducts(firstBatch);
      setCurrentBatch(1);
      setHasMoreProducts(filteredProducts.length > BATCH_SIZE);
    }
  }, [loading, filteredProducts.length]);

  // Auto-load more products when user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || !hasMoreProducts) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollTop + windowHeight >= documentHeight - 200) {
        loadNextBatch();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMoreProducts, loadNextBatch]);

  // Manage loading states
  useEffect(() => {
    if (loading) {
      setIsPageLoading(true);
    } else if (!loading && productsWithWatches.length > 0) {
      setIsPageLoading(false);
    }
  }, [loading, productsWithWatches.length]);

  const handleOrderSubmit = async (orderData: any) => {
    try {
      console.log('📝 Submitting made-to-order:', orderData);
      
      const response = await fetch('/api/made-to-order/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Order submitted successfully:', result);
        
        // Close the modal
        setShowOrderForm(false);
        setSelectedProduct(null);
        
        // Create WhatsApp message
        const whatsappMessage = `Hello! I want to place a special order:

Product: ${orderData.productId}
Size: ${orderData.selectedSize}
Color: ${orderData.selectedColor}
Quantity: ${orderData.quantity}
Price: ${orderData.unitPrice} DZD

Customer Details:
Name: ${orderData.customerName}
Phone: ${orderData.customerPhone}
Email: ${orderData.customerEmail}
Address: ${orderData.customerAddress}
Wilaya: ${orderData.wilayaName}

Notes: ${orderData.notes || 'None'}

Please confirm my order and provide payment details.`;

        // Encode the message for URL
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/213672536920?text=${encodedMessage}`;
        
        // Redirect to WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Show success message
        alert('Order submitted successfully! Redirecting to WhatsApp for confirmation...');
        
      } else {
        const errorData = await response.json();
        console.error('❌ Order submission failed:', errorData);
        throw new Error(errorData.error || 'Failed to submit order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to submit order: ${errorMessage}. Please try again or contact us directly via WhatsApp.`);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            <span className="text-white text-sm font-medium">Special Order Service</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
            {t('madeToOrder.title')}
          </h1>
          
          <p className="text-base text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
            Découvrez une sélection de vêtements, chaussures et accessoires fabriqués en Chine.
          </p>
          
          <p className="text-sm text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Large choix de modèles tendance • Livraison estimée entre 18 et 20 jours • Des produits choisis pour leur style et leur qualité
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center mb-3 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-2 text-sm">Fast Delivery</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Livraison estimée entre 18 et 20 jours</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg flex items-center justify-center mb-3 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                <CreditCard className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-white font-bold mb-2 text-sm">Easy Payment</h3>
              <p className="text-gray-400 text-xs leading-relaxed">50% deposit required</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center mb-3 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                <MessageCircle className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-bold mb-2 text-sm">Direct Contact</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Order via WhatsApp</p>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  productsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                  });
                }
              }}
              className="group bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center mx-auto transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Package className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              View Our Products
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="py-16 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              <span className="text-white text-xs font-medium">Premium Collection</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
              {t('madeToOrder.ourProducts')}
            </h2>
            <p className="text-base text-gray-400 max-w-2xl mx-auto">
              Discover our curated selection of premium items available for special order
            </p>
          </div>
          
            {madeToOrderProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">{t('madeToOrder.noProducts')}</h3>
              <p className="text-gray-400 text-sm">{t('madeToOrder.noProductsDesc')}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 px-4">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 border border-white/20"
                >
                  <Search className="w-4 h-4" />
                  {showSearch ? 'Hide Search' : 'Search Products'}
                </button>
                
                {showSearch && (
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                      />
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Category Filter Buttons */}
              <div className="flex flex-wrap justify-center gap-2 mb-8 px-4">
                <div className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-auto pb-2">
                {(() => {
                  const availableCategories = Array.from(new Set(productsWithWatches.map(p => p.category || 'Other')));
                  
                  const categoryNames: Record<string, string> = {
                    'Shoes': '👟 Chaussures',
                    'T-Shirts': '👕 T-Shirts', 
                    'Hoodies': '🧥 Sweats à Capuche',
                    'Jackets': '🧥 Vestes',
                    'Pants': '👖 Pantalons',
                    'Accessories': '👜 Accessoires',
                    'Watches': '⌚ Montres',
                    'Other': '📦 Autres'
                  };

                  return (
                    <>
                      <button
                        onClick={() => setSelectedCategory('All')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          selectedCategory === 'All'
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Tous
                      </button>
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            selectedCategory === category
                              ? 'bg-white text-black'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {categoryNames[category] || category}
                        </button>
                      ))}
                    </>
                  );
                })()}
                </div>
              </div>

              {/* Search Results Info */}
              {searchQuery && (
                <div className="text-center py-4">
                  <p className="text-gray-400">
                    {filteredProducts.length > 0 
                      ? `Found ${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} for "${searchQuery}"`
                      : `No products found for "${searchQuery}"`
                    }
                  </p>
                </div>
              )}

              {/* Products Display */}
              <div className="space-y-12">
                {(() => {
                  const displayProducts = visibleProducts;

                  if (displayProducts.length === 0 && !isLoadingMore) {
                    return (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                          {searchQuery ? 'No products found' : 'Aucun produit trouvé'}
                        </h3>
                        <p className="text-gray-400">
                          {searchQuery 
                            ? `No products match your search "${searchQuery}"`
                            : 'Aucun produit dans cette catégorie pour le moment.'
                          }
                        </p>
                      </div>
                    );
                  }

                  // Group display products by category
                  const productsByCategory = displayProducts.reduce((acc, product) => {
                    const category = product.category || 'Other';
                    if (!acc[category]) {
                      acc[category] = [];
                    }
                    acc[category].push(product);
                    return acc;
                  }, {} as Record<string, MadeToOrderProduct[]>);

                  const categoryOrder = ['Shoes', 'T-Shirts', 'Hoodies', 'Jackets', 'Pants', 'Watches', 'Accessories', 'Other'];
                  const categoryNames: Record<string, string> = {
                    'Shoes': '👟 Chaussures',
                    'T-Shirts': '👕 T-Shirts',
                    'Hoodies': '🧥 Sweats à Capuche',
                    'Jackets': '🧥 Vestes',
                    'Pants': '👖 Pantalons',
                    'Watches': '⌚ Montres',
                    'Accessories': '👜 Accessoires',
                    'Other': '📦 Autres'
                  };

                  return categoryOrder
                    .filter(category => productsByCategory[category]?.length > 0)
                    .map((category, categoryIndex) => (
                    <div key={category} className="space-y-4 sm:space-y-6">
                      <div className="text-center px-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                          {categoryNames[category] || category}
                        </h2>
                        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {productsByCategory[category].map((product, index) => (
                <div 
                  key={`${product.id}-${category}-${index}`} 
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-101"
                >
                  <div className="relative overflow-hidden">
                                <OptimizedImage
                                  src={product.image || product.images?.[0] || ''}
                              alt={product.name}
                              priority={index < 4}
                                />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {t('madeToOrder.customOrder')}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1">
                          <Star className="w-4 h-4 text-white mr-1" />
                          <span className="text-white text-sm font-semibold">{t('madeToOrder.premium')}</span>
                        </div>
                      </div>
                    </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-bold text-white mb-2 group-hover:text-white transition-colors line-clamp-1">{product.name}</h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg sm:text-xl font-black text-white">{Number(product.price).toFixed(0)} DZD</div>
                      <div className="text-xs text-gray-400 hidden sm:block">Starting from</div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-gray-300 text-xs font-medium mb-1">{t('madeToOrder.colors')}</div>
                      <div className="flex flex-wrap gap-1">
                        {(product.colors || []).slice(0, 4).map((color) => (
                          <span key={color} className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {color}
                          </span>
                        ))}
                        {(product.colors || []).length > 4 && (
                          <span className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            +{(product.colors || []).length - 4}
                          </span>
                        )}
                        {(product.colors || []).length === 0 && (
                          <span className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Multiple colors available
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-gray-300 text-xs font-medium mb-1">{t('madeToOrder.sizes')}</div>
                      <div className="flex flex-wrap gap-1">
                        {(product.sizes || []).map((size) => (
                          <span key={size} className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {size}
                          </span>
                        ))}
                        {(product.sizes || []).length === 0 && (
                          <span className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Multiple sizes available
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <a
                        href={`/made-to-order/${product.id}`}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-300 hover:scale-102 border border-white/20"
                      >
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">Details</span>
                      </a>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowOrderForm(true);
                        }}
                        className="flex-1 bg-white hover:bg-gray-100 text-black py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-300 hover:scale-102"
                      >
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Order</span>
                        <span className="sm:hidden">Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Load More Button */}
              {hasMoreProducts && !isLoadingMore && (
                <div className="text-center py-8">
                  <button
                    onClick={loadNextBatch}
                    className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center mx-auto transition-all duration-300 hover:scale-105 border border-white/20"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Load More Products
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              )}

              {/* Loading More Indicator */}
              {isLoadingMore && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-white/10 rounded-full mb-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                  <p className="text-sm text-gray-400">Loading more products...</p>
                </div>
              )}

              {/* No More Products Message */}
              {!hasMoreProducts && visibleProducts.length > 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-gray-400 text-sm">All products loaded</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              <span className="text-white text-xs font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              {t('madeToOrder.whyChoose')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-xl flex items-center justify-center mx-auto group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all duration-300 group-hover:scale-105">
                  <Palette className="w-8 h-8 text-orange-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.totalCustomization')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                {t('madeToOrder.totalCustomizationDesc')}
              </p>
            </div>
            
            <div className="group text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl flex items-center justify-center mx-auto group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all duration-300 group-hover:scale-105">
                  <Shield className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.premiumQuality')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                {t('madeToOrder.premiumQualityDesc')}
              </p>
            </div>
            
            <div className="group text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-sm border border-rose-500/30 rounded-xl flex items-center justify-center mx-auto group-hover:from-rose-500/30 group-hover:to-pink-500/30 transition-all duration-300 group-hover:scale-105">
                  <Heart className="w-8 h-8 text-rose-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.uniquePiece')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                {t('madeToOrder.uniquePieceDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              <span className="text-white text-sm font-medium">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              {t('madeToOrder.howItWorks')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get your special order in just 4 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center relative">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto group-hover:from-blue-500/30 group-hover:to-indigo-500/30 transition-all duration-300 group-hover:scale-110">
                  <span className="text-2xl font-black text-blue-400">1</span>
                </div>
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/30 to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.step3')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('madeToOrder.step3Desc')}
              </p>
            </div>
            
            <div className="group text-center relative">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300 group-hover:scale-110">
                  <span className="text-2xl font-black text-green-400">2</span>
                </div>
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-green-500/30 to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.step1')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('madeToOrder.step1Desc')}
              </p>
            </div>
            
            <div className="group text-center relative">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto group-hover:from-yellow-500/30 group-hover:to-orange-500/30 transition-all duration-300 group-hover:scale-110">
                  <span className="text-2xl font-black text-yellow-400">3</span>
                </div>
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-yellow-500/30 to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.step2')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('madeToOrder.step2Desc')}
              </p>
            </div>
            
            <div className="group text-center relative">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300 group-hover:scale-110">
                  <span className="text-2xl font-black text-purple-400">4</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.step4')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('madeToOrder.step4Desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            <span className="text-white text-sm font-medium">Ready to Start?</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            {t('madeToOrder.readyToCreate')}
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Contact us now to discuss your special order and get started on your unique piece
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#products';
                }
              }}
              className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <Package className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              {t('madeToOrder.viewCollection')}
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <Home className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              {t('madeToOrder.backToHome')}
            </button>
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
        <OrderFormModal
          product={selectedProduct!}
          isOpen={showOrderForm}
          onClose={() => {
            setShowOrderForm(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleOrderSubmit}
          wilayaTariffs={wilayaTariffs || []}
                />
              </div>
    </ErrorBoundary>
  );
}
