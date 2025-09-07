'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Clock } from 'lucide-react';
import { Product } from '@/types';
import { recentlyViewedService } from '@/lib/recentlyViewed';
import { useLanguage } from '@/context/LanguageContext';

export default function RecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const products = recentlyViewedService.getRecentlyViewed();
    setRecentProducts(products);
  }, []);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4 bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-white">
              {t('recentlyViewed.title') || 'Recently Viewed'}
            </h2>
          </div>
          <button
            onClick={() => {
              recentlyViewedService.clearRecentlyViewed();
              setRecentProducts([]);
            }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:scale-105"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-xs">
                  {Number(product.price).toFixed(0)} DA
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
