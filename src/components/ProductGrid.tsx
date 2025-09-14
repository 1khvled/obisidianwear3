'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDesign } from '@/context/DesignContext';
import { Product } from '@/types';
import { Search, Filter, Star, ShoppingBag, Eye, Loader2, Grid, List } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading = false }: ProductGridProps) {
  const { isStreetwear } = useDesign();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const handleProductClick = (productId: string) => {
    setNavigatingTo(productId);
    router.push(`/product/${productId}`);
  };

  const categories = useMemo(() => {
    const cats = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  if (isStreetwear) {
    return (
      <section id="products" className="py-16 bg-black border-t-2 border-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-6xl md:text-8xl font-black text-white mb-4 uppercase tracking-wider">
              LATEST <span className="text-purple-500">DROPS</span>
            </h2>
            <p className="text-gray-400 font-mono uppercase tracking-wide text-lg">
              FRESH HEAT • LIMITED STOCK • NO RESTOCKS
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="SEARCH PRODUCTS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border-2 border-white text-white pl-12 pr-4 py-3 font-bold uppercase tracking-wider placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black border-2 border-white text-white px-6 py-3 font-bold uppercase tracking-wider focus:outline-none focus:border-purple-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black border-2 border-white text-white px-6 py-3 font-bold uppercase tracking-wider focus:outline-none focus:border-purple-500"
            >
              <option value="name">NAME A-Z</option>
              <option value="price-low">PRICE LOW</option>
              <option value="price-high">PRICE HIGH</option>
            </select>

            {/* View Toggle */}
            <div className="flex border-2 border-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-500 text-black' : 'bg-black text-white hover:bg-white hover:text-black'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors border-l-2 border-white ${
                  viewMode === 'list' ? 'bg-purple-500 text-black' : 'bg-black text-white hover:bg-white hover:text-black'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-white font-black uppercase tracking-wider">LOADING HEAT...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-black border-2 border-white p-12 max-w-md mx-auto">
                <h3 className="text-2xl font-black text-white mb-4 uppercase">NO PRODUCTS FOUND</h3>
                <p className="text-gray-400 font-mono">TRY DIFFERENT SEARCH TERMS</p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-gray-400 font-mono uppercase tracking-wider">
                  {filteredProducts.length} PRODUCTS FOUND
                </p>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group relative bg-black border-2 border-white overflow-hidden hover:border-purple-500 transition-all duration-300 hover:scale-105 cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      {navigatingTo === product.id && (
                        <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                        </div>
                      )}

                      <div className="aspect-square relative overflow-hidden">
                        <Image
                          src={product.image || product.images?.[0] || ''}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        
                        {/* Badge */}
                        <div className="absolute top-4 left-4">
                          <div className="bg-purple-500 text-black px-3 py-1 text-xs font-black uppercase tracking-wider border border-white">
                            NEW DROP
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-2">
                            <button className="flex-1 bg-black border border-white text-white hover:bg-white hover:text-black py-2 px-3 text-xs font-bold uppercase transition-colors">
                              <Eye className="w-4 h-4 mx-auto" />
                            </button>
                            <button className="flex-1 bg-purple-500 border border-white text-black py-2 px-3 text-xs font-black uppercase">
                              BUY
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-black text-white uppercase tracking-wide line-clamp-1 mb-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-500 font-black text-xl font-mono">
                            {product.price?.toFixed(0)} DZD
                          </span>
                          <span className="text-gray-400 text-xs font-mono uppercase">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex gap-6 bg-black border-2 border-white p-6 hover:border-purple-500 transition-colors cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <div className="w-32 h-32 flex-shrink-0">
                        <Image
                          src={product.image || product.images?.[0] || ''}
                          alt={product.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-500 font-black text-3xl font-mono">
                            {product.price?.toFixed(0)} DZD
                          </span>
                          <button className="bg-purple-500 text-black px-6 py-2 font-black uppercase border border-white hover:bg-purple-600 transition-colors">
                            BUY NOW
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    );
  }

  // Classic design
  return (
    <section id="products" className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Collection</span>
          </h2>
          <p className="text-gray-400 text-lg">Discover our premium products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-900/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-900/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-white mb-4">No products found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="text-gray-400">{filteredProducts.length} products found</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:from-gray-800/50 hover:to-gray-700/50 transition-all duration-500 hover:scale-105 cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  {navigatingTo === product.id && (
                    <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center rounded-2xl">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                  )}

                  <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                    <Image
                      src={product.image || product.images?.[0] || ''}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    <div className="absolute top-4 left-4">
                      <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                        <Star className="w-3 h-3 inline mr-1" />
                        New
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <button className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-2 px-3 rounded-lg text-sm font-bold transition-all border border-white/20">
                          <Eye className="w-4 h-4 mx-auto" />
                        </button>
                        <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-3 rounded-lg text-sm font-bold transition-all">
                          <ShoppingBag className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {product.price?.toFixed(0)} DZD
                      </span>
                      <span className="text-gray-400 text-sm">{product.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}