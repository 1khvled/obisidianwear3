'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import OptimizedProductImage from '@/components/OptimizedProductImage';
import { ShoppingBag, Heart, Share2, ArrowLeft } from 'lucide-react';
import { useOptimizedApp } from '@/context/OptimizedAppProvider';

interface ProductPageClientProps {
  product: Product;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const router = useRouter();
  const { addToCart } = useOptimizedApp();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    setIsAddingToCart(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity
    });
    
    setIsAddingToCart(false);
    alert('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    // Store product data for checkout
    sessionStorage.setItem('checkoutProduct', JSON.stringify({
      ...product,
      selectedSize,
      selectedColor,
      quantity,
      type: 'collection'
    }));
    
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-300 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              
              <button className="p-2 text-gray-300 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              <OptimizedProductImage
                src={product.image || '/placeholder-product.jpg'}
                alt={product.name}
                width={600}
                height={600}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Additional Images */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                    <OptimizedProductImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
              <p className="text-2xl font-semibold text-purple-400">
                {product.price.toLocaleString()} DZD
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-lg text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()} DZD
                </p>
              )}
            </div>

            <div>
              <p className="text-gray-300 leading-relaxed">
                {product.description || 'Premium quality product from OBSIDIAN WEAR.'}
              </p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedSize === size
                          ? 'border-purple-500 bg-purple-500 text-white'
                          : 'border-gray-600 text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedColor === color
                          ? 'border-purple-500 bg-purple-500 text-white'
                          : 'border-gray-600 text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center text-gray-300 hover:border-gray-400"
                >
                  -
                </button>
                <span className="text-xl font-semibold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center text-gray-300 hover:border-gray-400"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedSize || !selectedColor}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={!selectedSize || !selectedColor}
                className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-4 rounded-lg font-semibold transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Product Info */}
            <div className="border-t border-gray-800 pt-6 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Category</h4>
                <p className="text-gray-300">{product.category}</p>
              </div>
              
              {product.sku && (
                <div>
                  <h4 className="font-semibold text-white mb-2">SKU</h4>
                  <p className="text-gray-300">{product.sku}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold text-white mb-2">Availability</h4>
                <p className={`${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
