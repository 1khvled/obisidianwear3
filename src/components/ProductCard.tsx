'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Heart, 
  Eye, 
  Star,
  Zap,
  Crown,
  Flame,
  Package
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useDesign } from '@/context/DesignContext';
import SizeSelectionModal from './SizeSelectionModal';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isStreetwear } = useDesign();
  const { addToCart } = useCart();
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  const handleAddToCart = (size: string, color: string, quantity: number) => {
    addToCart(product, size, color, quantity);
    setShowSizeModal(false);
  };

  if (isStreetwear) {
    return (
      <>
        <div className="group relative bg-black border-2 border-white/30 overflow-hidden hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority={priority}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="bg-purple-500 text-black px-3 py-1 text-xs font-black uppercase tracking-wider border border-white">
                NEW DROP
              </div>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 border border-white/20 transition-all duration-300 ${
                  isLiked 
                    ? 'bg-purple-500 text-white border-purple-500' 
                    : 'bg-black/40 text-gray-300 hover:text-purple-400 hover:bg-purple-500/20'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="bg-black border border-white px-3 py-1">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">
                    {product.category || 'STREETWEAR'}
                  </span>
                </div>
                {product.inStock === false && (
                  <div className="bg-purple-500 text-black px-3 py-1 border border-white">
                    <span className="text-black text-xs font-black uppercase">LOW STOCK</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="flex gap-3">
                <button className="bg-white/20 border border-white hover:bg-white hover:text-black text-white p-3 transition-all duration-300 hover:scale-110">
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSizeModal(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-black p-3 transition-all duration-300 hover:scale-110 border border-white"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-black text-white uppercase tracking-wide line-clamp-1 flex-1">
                {product.name}
              </h3>
              <div className="text-right ml-3">
                <div className="text-2xl font-black text-purple-500 font-mono">
                  {product.price?.toFixed(0)}
                </div>
                <div className="text-xs text-gray-400 font-mono uppercase">DZD</div>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {/* Size indicators */}
            <div className="flex items-center gap-1 mb-4">
              <span className="text-xs text-gray-500">SIZES:</span>
              <div className="flex gap-1 flex-wrap">
                {product.sizes?.slice(0, 4).map((size) => (
                  <span key={size} className="bg-black border border-white text-white px-2 py-1 text-xs font-bold uppercase">
                    {size}
                  </span>
                ))}
                {product.sizes && product.sizes.length > 4 && (
                  <span className="bg-purple-500 text-black px-2 py-1 text-xs font-black border border-white">
                    +{product.sizes.length - 4}
                  </span>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={async () => {
                  console.log('🔄 BUY NOW button clicked - setting loading state');
                  setIsBuyNowLoading(true);
                  try {
                    // Simulate buy now action
                    await new Promise(resolve => setTimeout(resolve, 300));
                    setShowSizeModal(true);
                  } finally {
                    console.log('✅ BUY NOW loading complete');
                    setIsBuyNowLoading(false);
                  }
                }}
                disabled={isViewLoading || isCartLoading || isBuyNowLoading}
                className="group w-full bg-purple-500 hover:bg-purple-600 text-black py-3 px-4 text-sm font-black uppercase tracking-wider transition-all duration-300 border-2 border-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {isBuyNowLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Package className="w-4 h-4 group-hover:animate-pulse" />
                    {/* Hover loading effect */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 border border-black/50 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </>
                )}
                {isBuyNowLoading ? 'Loading...' : 'BUY NOW'}
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={async () => {
                    console.log('🔄 CART button clicked - setting loading state');
                    setIsCartLoading(true);
                    try {
                      // Simulate cart action - you can replace this with actual cart logic
                      await new Promise(resolve => setTimeout(resolve, 300));
                      // Add to cart logic here
                    } finally {
                      console.log('✅ CART loading complete');
                      setIsCartLoading(false);
                    }
                  }}
                  disabled={isViewLoading || isCartLoading || isBuyNowLoading}
                  className="group flex-1 bg-black border-2 border-white text-white hover:bg-white hover:text-black py-2 px-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {isCartLoading ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag className="w-3 h-3 group-hover:animate-pulse" />
                      {/* Hover loading effect */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 border border-white/50 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    </>
                  )}
                  {isCartLoading ? 'Loading...' : 'CART'}
                </button>
                <button 
                  onClick={async () => {
                    console.log('🔄 VIEW button clicked - setting loading state');
                    setIsViewLoading(true);
                    try {
                      // Simulate view action - you can replace this with actual view logic
                      await new Promise(resolve => setTimeout(resolve, 300));
                      // Navigate to product page or open modal
                    } finally {
                      console.log('✅ VIEW loading complete');
                      setIsViewLoading(false);
                    }
                  }}
                  disabled={isViewLoading || isCartLoading || isBuyNowLoading}
                  className="group flex-1 bg-black border-2 border-white text-white hover:bg-white hover:text-black py-2 px-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {isViewLoading ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Eye className="w-3 h-3 group-hover:animate-pulse" />
                      {/* Hover loading effect */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 border border-white/50 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    </>
                  )}
                  {isViewLoading ? 'Loading...' : 'VIEW'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <SizeSelectionModal
          isOpen={showSizeModal}
          onClose={() => setShowSizeModal(false)}
          onBuy={handleAddToCart}
          product={product}
        />
      </>
    );
  }

  // Classic design
  return (
    <>
      <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:from-gray-800/50 hover:to-gray-700/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority={priority}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-t-2xl"></div>
          )}
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
              <Zap className="w-3 h-3 inline mr-1" />
              New
            </div>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 border border-white/20 ${
                isLiked 
                  ? 'bg-purple-500/80 text-white' 
                  : 'bg-black/40 text-gray-300 hover:text-purple-400 hover:bg-purple-500/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                <Star className="w-4 h-4 text-yellow-400 inline mr-1" />
                <span className="text-white text-sm font-medium">{product.category}</span>
              </div>
              {product.inStock === false && (
                <div className="bg-purple-500/90 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                  <span className="text-white text-xs font-bold">Low Stock</span>
                </div>
              )}
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="flex gap-3">
              <button 
                onClick={async () => {
                  console.log('🔄 Classic VIEW button clicked - setting loading state');
                  setIsViewLoading(true);
                  try {
                    // Simulate view action - you can replace this with actual view logic
                    await new Promise(resolve => setTimeout(resolve, 300));
                    // Navigate to product page or open modal
                  } finally {
                    console.log('✅ Classic VIEW loading complete');
                    setIsViewLoading(false);
                  }
                }}
                disabled={isViewLoading || isCartLoading || isBuyNowLoading}
                className="group bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden"
              >
                {isViewLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Eye className="w-5 h-5 group-hover:animate-pulse" />
                    {/* Hover loading effect */}
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 border border-white/70 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </>
                )}
              </button>
              <button
                onClick={async () => {
                  console.log('🔄 Classic CART button clicked - setting loading state');
                  setIsCartLoading(true);
                  try {
                    // Simulate cart action - you can replace this with actual cart logic
                    await new Promise(resolve => setTimeout(resolve, 300));
                    setShowSizeModal(true);
                  } finally {
                    console.log('✅ Classic CART loading complete');
                    setIsCartLoading(false);
                  }
                }}
                disabled={isViewLoading || isCartLoading || isBuyNowLoading}
                className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden"
              >
                {isCartLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 group-hover:animate-pulse" />
                    {/* Hover loading effect */}
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 border border-white/70 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Product info */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 flex-1">
              {product.name}
            </h3>
            <div className="text-right ml-3">
              <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {product.price?.toFixed(0)}
              </div>
              <div className="text-xs text-gray-400">DZD</div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Size badges */}
          <div className="flex items-center gap-1 mb-4">
            <span className="text-xs text-gray-500">Sizes:</span>
            <div className="flex gap-1 flex-wrap">
              {product.sizes?.slice(0, 4).map((size) => (
                <span key={size} className="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-2 py-1 rounded-md text-xs font-medium border border-gray-600">
                  {size}
                </span>
              ))}
              {product.sizes && product.sizes.length > 4 && (
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 border border-gray-600 flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              Details
            </button>
            <button
              onClick={() => setShowSizeModal(true)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <SizeSelectionModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        onBuy={handleAddToCart}
        product={product}
      />
    </>
  );
}