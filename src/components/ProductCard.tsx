'use client';

import { Product } from '@/types';
import { Star, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:shadow-white/10">
      <div className="relative overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={500}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute top-3 right-3 bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}

        {/* Quick Add to Cart Button */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button 
            className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-2"
            disabled={!product.inStock}
          >
            <ShoppingCart size={16} />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-white font-semibold text-lg mb-2 hover:text-gray-300 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-400 text-sm">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-white font-bold text-xl">
            {product.price} DZD
          </span>
          {product.originalPrice && (
            <span className="text-gray-500 line-through text-sm">
              {product.originalPrice} DZD
            </span>
          )}
        </div>

        {/* Buy Now Button */}
        <Link href={`/product/${product.id}`}>
          <button 
            className="w-full bg-white text-black py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={!product.inStock}
          >
            {product.inStock ? 'Buy Now' : 'Out of Stock'}
          </button>
        </Link>
      </div>
    </div>
  );
}
