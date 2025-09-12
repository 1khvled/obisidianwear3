'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { Search, Filter, Star, ShoppingBag, Eye } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading = false }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
    return cats;
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="products-section" className="space-y-8">
      {/* Search and Filters - Streetwear Style */}
      <div className="bg-black border-4 border-white p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-4 bg-white text-black border-4 border-black font-bold placeholder-gray-600 focus:outline-none focus:border-gray-400 transition-colors uppercase tracking-wide"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2">
            <Filter className="w-5 h-5 text-white mt-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-4 bg-white text-black border-4 border-black font-bold focus:outline-none focus:border-gray-400 transition-colors uppercase tracking-wide"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-4 bg-white text-black border-4 border-black font-bold focus:outline-none focus:border-gray-400 transition-colors uppercase tracking-wide"
          >
            <option value="name">NAME</option>
            <option value="price-low">PRICE: LOW TO HIGH</option>
            <option value="price-high">PRICE: HIGH TO LOW</option>
            <option value="newest">NEWEST</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-black border-4 border-white overflow-hidden hover:bg-gray-900 transition-all duration-200 hover:scale-105"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.image || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Quick Actions */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Category Badge - Streetwear Style */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white text-black text-xs font-black uppercase tracking-wide">
                  {product.category?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Product Info - Streetwear Style */}
            <div className="p-6">
              <h3 className="text-xl font-black text-white mb-3 group-hover:text-white transition-colors line-clamp-2 uppercase tracking-wide">
                {product.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2 font-medium">
                {product.description}
              </p>
              
              {/* Price and Rating */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-black text-white">
                  {product.price.toFixed(0)} DA
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-white fill-current" />
                  <span className="text-sm text-gray-400 font-bold">4.8</span>
                </div>
              </div>

              {/* CTA Button - Streetwear Style */}
              <Link
                href={`/product/${product.id}`}
                className="w-full bg-white text-black py-4 font-black text-center hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 border-4 border-black uppercase tracking-wide text-lg"
              >
                VIEW PRODUCT
                <ShoppingBag className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-400">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
}
