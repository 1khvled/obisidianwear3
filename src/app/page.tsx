'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { categories } from '@/data/products';
import { Product } from '@/types';
import { ChevronRight, Star, Truck, Shield, RotateCcw, ShoppingBag, Package } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { MobileProductGridSkeleton, FeatureGridSkeleton, DataLoadingAnimation, CacheLoadingAnimation, NetworkLoadingAnimation } from '@/components/LoadingSkeleton';
import { useOptimizedUserData } from '@/context/OptimizedUserDataContext';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { products, madeToOrderProducts, loading } = useOptimizedUserData();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    console.log('🛒 Products state:', { products, loading, isArray: Array.isArray(products), length: products?.length });
    
    // Ensure products is an array before filtering
    if (Array.isArray(products)) {
      if (selectedCategory === 'All') {
        setFilteredProducts(products);
      } else {
        setFilteredProducts(products.filter(product => product.category === selectedCategory));
      }
      
      // Products are loaded and filtered
    }
  }, [products, selectedCategory]);

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
      
      {/* Hero Section */}
      <section className="relative bg-black py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            <span className="text-white text-sm font-medium">Premium Collection</span>
          </div>
          
          <div className="mb-6">
            <Image
              src="/Logo Obsidian Wear sur fond noir.png"
              alt="OBSIDIAN WEAR Logo"
              width={220}
              height={220}
              priority
              className="w-24 sm:w-32 md:w-48 h-auto mx-auto mb-4"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
              {t('hero.title')}
              <span className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {t('hero.title2')}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>
          
          {/* Main CTA Button - Right Under Hero Content */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                console.log('🚀 Main CTA clicked');
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  console.log('✅ Products section found, scrolling...');
                  productsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                  });
                } else {
                  console.log('❌ Products section not found');
                  window.scrollTo({ top: 800, behavior: 'smooth' });
                }
              }}
              className="group bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black px-12 py-6 rounded-2xl text-2xl font-black flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-white/30 border-4 border-white/30 hover:border-white/50 w-fit"
            >
              <ShoppingBag className="w-8 h-8 mr-3 group-hover:scale-110 transition-transform" />
              {t('hero.cta')}
              <ChevronRight className="w-8 h-8 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-4xl mx-auto mb-6">
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-2 hover:bg-white/10 transition-all duration-300">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-md flex items-center justify-center mb-1 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Truck className="w-3 h-3 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-1 text-xs">Fast Delivery</h3>
              <p className="text-gray-400 text-xs">Quick & reliable</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-2 hover:bg-white/10 transition-all duration-300">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-md flex items-center justify-center mb-1 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                <Shield className="w-3 h-3 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-1 text-xs">Quality Guarantee</h3>
              <p className="text-gray-400 text-xs">Premium materials</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-2 hover:bg-white/10 transition-all duration-300">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-md flex items-center justify-center mb-1 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                <RotateCcw className="w-3 h-3 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-1 text-xs">Easy Returns</h3>
              <p className="text-gray-400 text-xs">3-day policy</p>
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
              <h3 className="text-lg font-semibold text-white mb-2">{t('products.empty')}</h3>
              <p className="text-gray-400 text-sm">{t('products.empty.desc')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Made-to-Order Products Section */}
      {madeToOrderProducts && madeToOrderProducts.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                <span className="text-white text-xs font-medium">Made-to-Order</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
                Custom Collection
              </h2>
              <p className="text-base text-gray-400 max-w-2xl mx-auto">
                Personalized pieces crafted just for you
              </p>
            </div>

            {/* Made-to-Order Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {madeToOrderProducts.map((mtoProduct, index) => {
                // Convert MadeToOrderProduct to Product format for ProductCard
                const product: Product = {
                  id: mtoProduct.id,
                  name: mtoProduct.name,
                  price: mtoProduct.price,
                  image: mtoProduct.image,
                  images: mtoProduct.images || [],
                  description: mtoProduct.description,
                  category: mtoProduct.category,
                  sizes: mtoProduct.sizes,
                  colors: mtoProduct.colors,
                  inStock: mtoProduct.isActive,
                  rating: 5, // Default rating for made-to-order
                  reviews: 0, // Default reviews
                  stock: {}, // Empty stock for made-to-order
                  tags: mtoProduct.tags,
                  customSizeChart: mtoProduct.customSizeChart,
                  useCustomSizeChart: mtoProduct.useCustomSizeChart,
                  createdAt: mtoProduct.createdAt,
                  updatedAt: mtoProduct.updatedAt
                };
                
                return (
                  <div
                    key={mtoProduct.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                );
              })}
            </div>

            {/* View More Button */}
            <div className="text-center mt-8">
              <a
                href="/made-to-order-collection"
                className="inline-flex items-center bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
              >
                <Package className="w-5 h-5 mr-2" />
                View All Made-to-Order
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </section>
      )}

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
