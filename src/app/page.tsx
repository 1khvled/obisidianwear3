'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { categories } from '@/data/products';
import { Product } from '@/types';
import { ChevronRight, Star, Truck, Shield, RotateCcw, ShoppingBag, Package, Search, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { MobileProductGridSkeleton, FeatureGridSkeleton, DataLoadingAnimation, CacheLoadingAnimation, NetworkLoadingAnimation } from '@/components/LoadingSkeleton';
import { useOptimizedUserData } from '@/context/OptimizedUserDataContext';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const { products, madeToOrderProducts, loading } = useOptimizedUserData();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    console.log('🛒 Products state:', { products, loading, isArray: Array.isArray(products), length: products?.length });
    
    // Ensure products is an array before filtering
    if (Array.isArray(products)) {
      let filtered = products;
      
      // Apply category filter
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(product => product.category === selectedCategory);
      }
      
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      }
      
      setFilteredProducts(filtered);
    }
  }, [products, selectedCategory, searchQuery]);

  // Show loading state only if still loading or no products are available yet
  if (loading || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <DataLoadingAnimation message="Loading your collection..." />
        </div>
        <Footer />
      </div>
    );
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Premium Collection Hero Section */}
      <section className="relative bg-black py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          {/* Premium Collection Tag */}
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full px-6 py-3 mb-12">
            <span className="w-3 h-3 bg-yellow-400 rounded-full mr-3 animate-pulse"></span>
            <span className="text-yellow-300 text-lg font-bold tracking-wide">Premium Collection</span>
          </div>
          
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/Logo Obsidian Wear sur fond noir.png"
              alt="OBSIDIAN WEAR Logo"
              width={280}
              height={280}
              priority
              className="w-32 sm:w-40 md:w-56 h-auto mx-auto mb-6"
            />
          </div>
          
          {/* Main Tagline */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
              Plus qu'un vêtement,<br />
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                une attitude.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Découvrez notre collection exclusive...
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
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
              className="group bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black px-10 py-4 rounded-2xl text-xl font-black flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-white/30 border-2 border-white/30 hover:border-white/50"
            >
              <ShoppingBag className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              {t('home.viewCollection')}
              <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a
              href="/made-to-order"
              className="group bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-800 text-white px-10 py-4 rounded-2xl text-xl font-black flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-2xl border-2 border-white/20 hover:border-white/40"
            >
              <Package className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              {t('home.madeToOrder')}
              <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Truck className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-2 text-lg">{t('home.fastDelivery')}</h3>
              <p className="text-gray-400 text-sm">{t('home.fastDeliveryDesc')}</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg flex items-center justify-center mb-4 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-bold mb-2 text-lg">{t('home.quality')}</h3>
              <p className="text-gray-400 text-sm">{t('home.qualityDesc')}</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center mb-4 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                <RotateCcw className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-bold mb-2 text-lg">{t('home.easy')}</h3>
              <p className="text-gray-400 text-sm">{t('home.easyDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              <span className="text-white text-xs font-medium">Our Collection</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
              {t('products.title')}
            </h2>
            <p className="text-base text-gray-400 max-w-2xl mx-auto">
              Discover our curated selection of premium clothing and accessories
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 px-4">
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <Search className="w-4 h-4" />
              {showSearch ? 'Hide Search' : 'Search Products'}
            </button>
            
            {/* Search Input */}
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

          {/* Search Results Info */}
          {searchQuery && (
            <div className="text-center py-4 mb-4">
              <p className="text-gray-400">
                {filteredProducts.length > 0 
                  ? `Found ${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} for "${searchQuery}"`
                  : `No products found for "${searchQuery}"`
                }
              </p>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 px-4">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 text-xs transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <MobileProductGridSkeleton count={6} />
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? 'No products found' : t('products.empty')}
              </h3>
              <p className="text-gray-400 text-sm">
                {searchQuery 
                  ? `No products match your search "${searchQuery}"`
                  : t('products.empty.desc')
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Made-to-Order CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            <span className="text-white text-sm font-medium">Special Orders</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
            Need Something Custom?
          </h2>
          
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create your perfect piece with our made-to-order service. Custom designs, premium quality, and personal attention to detail.
          </p>
          
          <a
            href="/made-to-order-collection"
            className="inline-flex items-center bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 shadow-2xl"
          >
            <Package className="w-6 h-6 mr-3" />
            View Made-to-Order Collection
            <ChevronRight className="w-6 h-6 ml-3" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}