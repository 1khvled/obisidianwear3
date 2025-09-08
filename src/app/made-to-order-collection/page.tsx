'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useProducts } from '@/context/SmartProductProvider';
import { MadeToOrderProduct } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronRight, Star, ShoppingBag, Package, Clock, CreditCard, MessageCircle, ArrowLeft } from 'lucide-react';
import { DataLoadingAnimation, NetworkLoadingAnimation } from '@/components/LoadingSkeleton';
import { useLanguage } from '@/context/LanguageContext';

export default function MadeToOrderCollectionPage() {
  const productsData = useProducts();
  const productsLoading = 'loading' in productsData ? productsData.loading : false;
  const [madeToOrderProducts, setMadeToOrderProducts] = useState<MadeToOrderProduct[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { t } = useLanguage();
  const [filteredProducts, setFilteredProducts] = useState<MadeToOrderProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Helper function to get the best image source
  const getImageSrc = (product: MadeToOrderProduct) => {
    if (product.image && product.image.length > 100) {
      return product.image;
    }
    if (product.images && product.images.length > 0 && product.images[0].length > 100) {
      return product.images[0];
    }
    return null;
  };

  // Load made-to-order products
  useEffect(() => {
    const loadMadeToOrderProducts = async () => {
      try {
        console.log('🛒 Loading made-to-order products...');
        setDataLoading(true);
        const response = await fetch('/api/made-to-order');
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Loaded made-to-order products:', data.length);
        console.log('🖼️ Product images:', data.map((p: any) => ({ 
          id: p.id, 
          name: p.name, 
          hasImage: !!p.image, 
          imageLength: p.image?.length,
          hasImages: !!(p.images && p.images.length > 0),
          imagesLength: p.images?.length,
          firstImageLength: p.images?.[0]?.length
        })));
        setMadeToOrderProducts(data);
      } catch (error) {
        console.error('❌ Error loading made-to-order products:', error);
        setMadeToOrderProducts([]);
      } finally {
        setDataLoading(false);
      }
    };

    loadMadeToOrderProducts();
  }, []);

  // Get unique categories from made-to-order products
  const categories = ['All', ...Array.from(new Set(madeToOrderProducts.map(p => p.category)))];

  useEffect(() => {
    if (Array.isArray(madeToOrderProducts)) {
      if (selectedCategory === 'All') {
        setFilteredProducts(madeToOrderProducts);
      } else {
        setFilteredProducts(madeToOrderProducts.filter(product => product.category === selectedCategory));
      }
    }
  }, [madeToOrderProducts, selectedCategory]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  if (productsLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <DataLoadingAnimation message="Loading made-to-order products..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            <span className="text-white text-sm font-medium">Special Order Service</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
            Made to Order Collection
          </h1>
          
          <p className="text-base text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
            Premium items crafted to your specifications with exceptional quality and attention to detail
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-md flex items-center justify-center mb-2 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-1 text-xs">Fast Delivery</h3>
              <p className="text-gray-400 text-xs">20-18 days production</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-md flex items-center justify-center mb-2 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                <CreditCard className="w-4 h-4 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-1 text-xs">Easy Payment</h3>
              <p className="text-gray-400 text-xs">50% deposit required</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-md flex items-center justify-center mb-2 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                <MessageCircle className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-1 text-xs">Direct Contact</h3>
              <p className="text-gray-400 text-xs">WhatsApp ordering</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              <span className="text-white text-xs font-medium">Premium Collection</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
              Custom Products
            </h2>
            <p className="text-base text-gray-400 max-w-2xl mx-auto">
              Discover our curated selection of premium items available for special order
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
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
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-101">
                  {getImageSrc(product) && (
                    <div className="relative overflow-hidden">
                      {getImageSrc(product)?.startsWith('data:') ? (
                        <img
                          src={getImageSrc(product)!}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-500"
                          onLoad={() => console.log('✅ Image loaded for product:', product.name)}
                          onError={(e) => console.error('❌ Image failed to load for product:', product.name, e)}
                        />
                      ) : (
                        <Image
                          src={getImageSrc(product)!}
                          alt={product.name}
                          width={400}
                          height={500}
                          className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-500"
                          onLoad={() => console.log('✅ Image loaded for product:', product.name)}
                          onError={(e) => console.error('❌ Image failed to load for product:', product.name, e)}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Custom Order
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1">
                          <Star className="w-4 h-4 text-white mr-1" />
                          <span className="text-white text-sm font-semibold">Premium</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-white transition-colors">{product.name}</h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xl font-black text-white">{Number(product.price).toFixed(0)} DZD</div>
                      <div className="text-xs text-gray-400">Starting from</div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-gray-300 text-xs font-medium mb-1">Colors</div>
                      <div className="flex flex-wrap gap-1">
                        {product.colors.slice(0, 4).map((color) => (
                          <span key={color} className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {color}
                          </span>
                        ))}
                        {product.colors.length > 4 && (
                          <span className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            +{product.colors.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-gray-300 text-xs font-medium mb-1">Sizes</div>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((size) => (
                          <span key={size} className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <a
                      href={`/made-to-order?productId=${product.id}`}
                      className="w-full bg-white hover:bg-gray-100 text-black py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-300 hover:scale-102"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Order Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No products found</h3>
              <p className="text-gray-400 text-sm">No made-to-order products available in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            <span className="text-white text-sm font-medium">Ready to Order?</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Create Your Custom Piece
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Contact us now to discuss your special order and get started on your unique piece
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="/made-to-order"
              className="group bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              <MessageCircle className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Order Via WhatsApp
            </a>
            
            <a
              href="/"
              className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Back to Home
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
