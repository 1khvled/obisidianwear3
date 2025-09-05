'use client';

import { Product } from '@/types';
import { Star, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useMobileOptimizations } from './MobileOptimized';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { onTouchStart, onTouchMove, onTouchEnd } = useMobileOptimizations();
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.inStock && product.status !== 'soon' && product.colors && product.colors.length > 0) {
      setSelectedSize(product.sizes[0] || '');
      setSelectedColor(product.colors[0] || '');
      setShowSizeModal(true);
    }
  };

  const handleConfirmAddToCart = () => {
    if (selectedSize && selectedColor) {
      addToCart(product, selectedSize, selectedColor, 1);
      setShowSizeModal(false);
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
        {product.status === 'soon' && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-yellow-600 text-white text-xs font-semibold px-2 py-1 rounded">
            Coming Soon
          </div>
        )}
        {!product.inStock && product.status !== 'soon' && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}

        {/* Add to Cart Button - Hidden on mobile for better UX */}
        <div className="hidden sm:flex absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 items-center justify-center opacity-0 group-hover:opacity-100">
          <button 
            onClick={handleAddToCart}
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm"
            disabled={!product.inStock || product.status === 'soon'}
          >
            <ShoppingCart size={16} />
            <span>{product.status === 'soon' ? 'Coming Soon' : 'Add to Cart'}</span>
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
              disabled={!product.inStock && product.status !== 'soon'}
            >
              {product.status === 'soon' ? 'Coming Soon' : product.inStock ? 'View Product' : 'Out of Stock'}
            </button>
          </Link>
          {product.inStock && product.status !== 'soon' && (
            <button 
              onClick={handleAddToCart}
              className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 active:bg-gray-600 transition-colors text-sm sm:text-base touch-target"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* Size Selection Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">Select Size & Color</h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-white text-sm font-medium mb-2">Size</h4>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-white text-sm font-medium mb-2">Color</h4>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedColor === color
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSizeModal(false)}
                className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddToCart}
                disabled={!selectedSize || !selectedColor}
                className="flex-1 bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
