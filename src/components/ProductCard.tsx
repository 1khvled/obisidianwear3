'use client';

import { Product } from '@/types';
import { Star, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useMobileOptimizations } from './MobileOptimized';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { onTouchStart, onTouchMove, onTouchEnd } = useMobileOptimizations();
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.inStock && product.colors && product.colors.length > 0) {
      addToCart(product, 'M', product.colors[0], 1);
    }
  };

  return (
    <div 
      className="group bg-gray-900/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-white/5 active:scale-[0.98] sm:active:scale-100"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative overflow-hidden">
        <Link href={`/product/${product.id}`} className="block">
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={500}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}

        {/* Add to Cart Button - Hidden on mobile for better UX */}
        <div className="hidden sm:flex absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 items-center justify-center opacity-0 group-hover:opacity-100">
          <button 
            onClick={handleAddToCart}
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm"
            disabled={!product.inStock}
          >
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-white font-semibold text-base sm:text-lg mb-2 hover:text-gray-300 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={`sm:w-4 sm:h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-white font-bold text-lg sm:text-xl">
            {product.price} DA
          </span>
          {product.originalPrice && (
            <span className="text-gray-500 line-through text-sm">
              {product.originalPrice} DA
            </span>
          )}
        </div>

        {/* Buy Now Button */}
        <div className="space-y-2">
          <Link href={`/product/${product.id}`}>
            <button 
              className="w-full bg-white text-black py-2.5 sm:py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed text-sm sm:text-base touch-target"
              disabled={!product.inStock}
            >
              {product.inStock ? 'View Product' : 'Out of Stock'}
            </button>
          </Link>
          {product.inStock && (
            <button 
              onClick={handleAddToCart}
              className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 active:bg-gray-600 transition-colors text-sm sm:text-base touch-target"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
