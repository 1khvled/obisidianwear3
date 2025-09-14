'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MadeToOrderProduct } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useFastMadeToOrder } from '@/hooks/useFastMadeToOrder';
import OptimizedImage from '@/components/OptimizedImage';
import { MadeToOrderSkeleton } from '@/components/LoadingSkeleton';
import { ShoppingBag, Eye, Search, Home, ArrowLeft } from 'lucide-react';

// Clean product card with black, white, purple design
const ModernProductCard = ({ 
  product, 
  onViewDetails, 
  onOrder 
}: { 
  product: MadeToOrderProduct; 
  onViewDetails: (product: MadeToOrderProduct) => void;
  onOrder: (product: MadeToOrderProduct) => void;
}) => {
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isOrderLoading, setIsOrderLoading] = useState(false);

  return (
    <div className="bg-black border-2 border-white hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 group">
      <div className="aspect-square overflow-hidden relative">
        <OptimizedImage
          src={product.image || product.images?.[0] || ''}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(product)}
              className="bg-white/90 text-black px-4 py-2 rounded font-black uppercase tracking-wider text-sm hover:bg-white transition-colors"
            >
              Quick View
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              {product.name}
            </h3>
            {product.category && (
              <span className="text-xs text-purple-400 font-black uppercase tracking-wider">
                {product.category}
              </span>
            )}
          </div>
          <span className="text-xl font-black text-white">{Number(product.price).toFixed(0)} DZD</span>
        </div>
        
        <p className="text-white text-sm mb-4">{product.description}</p>
        
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setIsViewLoading(true);
                try {
                  await onViewDetails(product);
                } finally {
                  setIsViewLoading(false);
                }
              }}
              disabled={isViewLoading || isOrderLoading}
              className="px-3 py-2 bg-white text-black text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isViewLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {isViewLoading ? 'Loading...' : 'View'}
            </button>
            <button
              onClick={async () => {
                setIsOrderLoading(true);
                try {
                  await onOrder(product);
                } finally {
                  setIsOrderLoading(false);
                }
              }}
              disabled={isViewLoading || isOrderLoading}
              className="px-3 py-2 bg-purple-500 text-black text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:bg-purple-600 transition-colors duration-200 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isOrderLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
};

export default function MadeToOrderPage() {
  const router = useRouter();
  const { products: madeToOrderProducts, loading } = useFastMadeToOrder();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isReturnHomeLoading, setIsReturnHomeLoading] = useState(false);

  const handleViewDetails = (product: MadeToOrderProduct) => {
    // Navigate to product detail page (NOT new tab)
    router.push(`/made-to-order/${product.id}`);
  };

  const handleOrderClick = (product: MadeToOrderProduct) => {
    // Store product data in sessionStorage to avoid URL size limits
    const productData = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.images?.[0],
      description: product.description,
      colors: product.colors,
      sizes: product.sizes,
      category: product.category,
      type: 'made-to-order'
    };

    // Store in sessionStorage
    sessionStorage.setItem('checkoutProduct', JSON.stringify(productData));
    
    // Navigate to made-to-order checkout page using Next.js router
    router.push('/made-to-order-checkout');
  };


  // Simple search filter
  const filteredProducts = madeToOrderProducts.filter(product => 
    !searchQuery || 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <MadeToOrderSkeleton />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Return Home Section */}
      <div className="pt-20 pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-6">
            <button
              onClick={async () => {
                setIsReturnHomeLoading(true);
                try {
                  await router.push('/');
                } finally {
                  setIsReturnHomeLoading(false);
                }
              }}
              disabled={isReturnHomeLoading}
              className="bg-white text-black font-black px-6 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 transform uppercase tracking-wider text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {isReturnHomeLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
              {isReturnHomeLoading ? 'Loading...' : 'Return to DROP'}
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Search */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                placeholder="Search custom order products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-300 text-black placeholder-gray-500 w-80 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 hover:shadow-lg"
              />
            </div>
          </div>

          {/* Category Filters */}
          {madeToOrderProducts && madeToOrderProducts.length > 0 && (
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  All Products
                </button>
                {Array.from(new Set(madeToOrderProducts.map(p => p.category).filter(Boolean))).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category!)}
                    className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider transition-colors ${
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

          {(() => {
            if (!madeToOrderProducts || madeToOrderProducts.length === 0) {
              return (
                <div className="text-center py-20">
                  <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wider">Loading Products...</h3>
                  <p className="text-white">Please wait while we load the custom order products.</p>
                </div>
              );
            }

            const filteredProducts = madeToOrderProducts.filter(product => {
              const matchesSearch = !searchQuery ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());
              
              const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
              
              return matchesSearch && matchesCategory;
            });

            return filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wider">No Products Match Search</h3>
                <p className="text-white mb-8">Try a different search term.</p>
                <button
                  onClick={() => window.open('https://wa.me/213672536920?text=Hello! I couldn\'t find the product I\'m looking for. Can you help me?', '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase tracking-wider"
                >
                  Can't find your product? Contact us
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ModernProductCard
                      product={product}
                      onViewDetails={handleViewDetails}
                      onOrder={handleOrderClick}
                    />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Contact Us Section */}
        <div className="text-center py-12">
          <h3 className="text-xl font-black text-white mb-4 uppercase tracking-wider">Need Something Custom?</h3>
          <p className="text-white/80 mb-6">Can't find exactly what you're looking for?</p>
          <button
            onClick={() => window.open('https://wa.me/213672536920?text=Hello! I\'m looking for a custom product. Can you help me?', '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase tracking-wider"
          >
            Contact us for custom orders
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
} 