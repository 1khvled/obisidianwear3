'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useOptimizedApp } from '@/context/OptimizedAppProvider';
import OptimizedProductImage from '@/components/OptimizedProductImage';
import { ProductGridSkeleton } from '@/components/LoadingSkeleton';
import { ShoppingBag, Eye, Search, Heart } from 'lucide-react';

// Lazy load heavy components
const ProductGrid = lazy(() => import('@/components/ProductGrid'));
const MadeToOrderCTA = lazy(() => import('@/components/MadeToOrderCTA'));

// Optimized product card with minimal state
const OptimizedProductCard = ({ 
  product, 
  onViewDetails, 
  onOrder 
}: { 
  product: Product; 
  onViewDetails: (product: Product) => void;
  onOrder: (product: Product) => void;
}) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="bg-black border border-white/20 rounded-lg overflow-hidden hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 group">
      <div className="relative aspect-square overflow-hidden">
        <OptimizedProductImage
          src={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay buttons */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
          <button
            onClick={() => onViewDetails(product)}
            className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onOrder(product)}
            className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>

        {/* Like button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-purple-400 font-bold text-lg">
          {product.price.toLocaleString()} DZD
        </p>
        {product.originalPrice && product.originalPrice > product.price && (
          <p className="text-gray-400 text-sm line-through">
            {product.originalPrice.toLocaleString()} DZD
          </p>
        )}
      </div>
    </div>
  );
};

export default function OptimizedHomePage() {
  const router = useRouter();
  const { products, loading } = useOptimizedApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleViewDetails = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleOrderClick = (product: Product) => {
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
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            OBSIDIAN WEAR
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Plus qu'un vêtement, une attitude
          </p>
          <button
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Découvrir la Collection
          </button>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 't-shirts', 'hoodies', 'accessories'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category === 'all' ? 'Tous' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Notre Collection</h2>
          
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <OptimizedProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewDetails}
                  onOrder={handleOrderClick}
                />
              ))}
            </div>
          )}
          
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </section>

      {/* Made-to-Order CTA */}
      <Suspense fallback={<div className="h-64 bg-gray-900 animate-pulse" />}>
        <MadeToOrderCTA />
      </Suspense>

      <Footer />
    </div>
  );
}
