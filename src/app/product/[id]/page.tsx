'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProducts } from '@/context/SmartProductProvider';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { recentlyViewedService } from '@/lib/recentlyViewed';
import { Star, ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Ruler } from 'lucide-react';
import SizeChart from '@/components/SizeChart';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getProduct, products } = useProducts();
  const { addToCart } = useCart();
  
  console.log('Cart hook available:', !!addToCart);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [showSizeChart, setShowSizeChart] = useState(false);

  useEffect(() => {
    if (params.id) {
      const foundProduct = getProduct(params.id as string);
      setProduct(foundProduct);
      
      // Add to recently viewed
      if (foundProduct) {
        recentlyViewedService.addProduct(foundProduct);
      }
      
      // Set default color if not selected
      if (foundProduct && foundProduct.colors.length > 0 && !selectedColor) {
        setSelectedColor(foundProduct.colors[0]);
      }
      
      console.log('Product detail page updated:', foundProduct?.name);
    }
  }, [params.id, getProduct, products, selectedColor]); // Added products as dependency

  if (!product) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
            <Link href="/" className="text-white hover:text-gray-300">
              ← Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }
    router.push(`/checkout?productId=${product.id}&size=${selectedSize}&color=${selectedColor}&quantity=${quantity}`);
  };

  const handleAddToCart = () => {
    if (!product) {
      alert('Product not found!');
      return;
    }
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }
    console.log('Adding to cart:', { product, selectedSize, selectedColor, quantity });
    addToCart(product, selectedSize, selectedColor, quantity);
    alert('Added to cart!');
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-white hover:text-gray-300 mb-12 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4 sm:space-y-6">
            <div className="aspect-square bg-gray-900/50 rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            
            {/* Additional Images */}
            <div className="grid grid-cols-4 gap-3 sm:gap-6">
              {(() => {
                // Create array of unique images
                const allImages = [product.image, ...(product.images || [])];
                const uniqueImages = Array.from(new Set(allImages.filter(img => img && img.trim() !== '')));
                
                return uniqueImages.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-900/50 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 active:scale-95 transition-all touch-target"
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h1 className="heading-responsive font-bold font-poppins text-white mb-2">
                {product.name}
              </h1>
              <p className="text-gray-400 text-responsive">{product.category}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-white">
{Number(product.price).toFixed(0)} DA
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {Number(product.originalPrice).toFixed(0)} DA
                  </span>
                  <span className="bg-red-600 text-white text-sm font-semibold px-2 py-1 rounded">
                    Save {(Number(product.originalPrice) - Number(product.price)).toFixed(0)} DA
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Size</h3>
              <div className="flex flex-wrap gap-3">
                {(() => {
                  // Filter sizes based on inventory for selected color
                  const availableSizes = selectedColor 
                    ? product.sizes.filter(size => {
                        const stock = product.stock?.[size]?.[selectedColor] || 0;
                        return stock > 0;
                      })
                    : product.sizes;
                  
                  // If no color selected, show all sizes but with warning
                  const sizesToShow = selectedColor ? availableSizes : product.sizes;
                  
                  return sizesToShow.map((size) => {
                    const sizeStock = selectedColor ? (product.stock?.[size]?.[selectedColor] || 0) : 0;
                    const isOutOfStock = selectedColor && sizeStock === 0;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedSize(size);
                          } else {
                            alert(`❌ Size ${size} in ${selectedColor} is OUT OF STOCK!`);
                          }
                        }}
                        disabled={!!isOutOfStock}
                        className={`px-5 py-3 border rounded-lg font-medium transition-colors ${
                          selectedSize === size
                            ? 'border-white bg-white text-black'
                            : isOutOfStock 
                              ? 'border-red-600 text-red-400 cursor-not-allowed bg-red-900/20'
                              : !selectedColor
                                ? 'border-yellow-600 text-yellow-400 bg-yellow-900/20'
                                : 'border-gray-600 text-white hover:border-gray-400'
                        }`}
                      >
                        {size}
                        {!selectedColor && ' (Select Color)'}
                        {selectedColor && sizeStock > 0 && ` (${sizeStock})`}
                      </button>
                    );
                  });
                })()}
              </div>
              
              {selectedColor && (() => {
                const availableSizes = product.sizes.filter(size => {
                  const stock = product.stock?.[size]?.[selectedColor] || 0;
                  return stock > 0;
                });
                
                if (availableSizes.length === 0) {
                  return (
                    <p className="text-red-400 text-sm mt-2">
                      ❌ No sizes available for {selectedColor}
                    </p>
                  );
                }
                
                const outOfStockSizes = product.sizes.filter(size => {
                  const stock = product.stock?.[size]?.[selectedColor] || 0;
                  return stock === 0;
                });
                
                if (outOfStockSizes.length > 0) {
                  return (
                    <p className="text-gray-400 text-sm mt-2">
                      Sizes {outOfStockSizes.join(', ')} are out of stock for {selectedColor}
                    </p>
                  );
                }
                
                return null;
              })()}
              
              {/* Size Chart Button */}
              <div className="mt-3">
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <Ruler className="w-4 h-4" />
                  View Size Chart
                </button>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Color</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-5 py-3 border rounded-lg font-medium transition-colors ${
                      selectedColor === color
                        ? 'border-white bg-white text-black'
                        : 'border-gray-600 text-white hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-600 rounded-lg flex items-center justify-center text-white hover:border-gray-400"
                >
                  -
                </button>
                <span className="text-white text-lg font-medium w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-600 rounded-lg flex items-center justify-center text-white hover:border-gray-400"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  if (!selectedSize || !selectedColor) {
                    alert('❌ Please select size and color first!');
                    return;
                  }
                  
                  const availableStock = product.stock?.[selectedSize]?.[selectedColor] || 0;
                  if (availableStock === 0) {
                    alert(`❌ Size ${selectedSize} in ${selectedColor} is OUT OF STOCK!`);
                    return;
                  }
                  
                  if (quantity > availableStock) {
                    alert(`❌ Only ${availableStock} items available in ${selectedSize} ${selectedColor}!`);
                    return;
                  }
                  
                  handleBuyNow();
                }}
                disabled={!product.inStock || !selectedSize || !selectedColor}
                className="w-full bg-white text-black py-5 px-8 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-3 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                <ShoppingCart size={20} />
                <span>
                  {!product.inStock ? 'Out of Stock' : 
                   !selectedSize || !selectedColor ? 'Select Size & Color' :
                   `Buy Now - ${(product.price * quantity).toFixed(0)} DA`}
                </span>
              </button>
              
              <button 
                onClick={() => {
                  if (!selectedSize || !selectedColor) {
                    alert('Please select size and color first!');
                    return;
                  }
                  
                  const availableStock = product.stock?.[selectedSize]?.[selectedColor] || 0;
                  if (availableStock === 0) {
                    alert(`❌ Size ${selectedSize} in ${selectedColor} is OUT OF STOCK!`);
                    return;
                  }
                  
                  if (quantity > availableStock) {
                    alert(`❌ Only ${availableStock} items available in ${selectedSize} ${selectedColor}!`);
                    return;
                  }
                  
                  handleAddToCart();
                }}
                disabled={!product.inStock || !selectedSize || !selectedColor}
                className="w-full bg-gray-800 text-white py-4 px-8 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-3 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>
              
              <div className="flex space-x-4">
                <button className="flex-1 bg-gray-800 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-3">
                  <Heart size={20} />
                  <span>Add to Wishlist</span>
                </button>
                <button className="flex-1 bg-gray-800 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-3">
                  <Share2 size={20} />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-gray-800 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="flex items-center space-x-3">
                  <Shield size={20} className="text-gray-400" />
                  <div>
                    <p className="text-white font-medium">Secure Payment</p>
                    <p className="text-gray-400 text-sm">100% secure</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw size={20} className="text-gray-400" />
                  <div>
                    <p className="text-white font-medium">Easy Returns</p>
                    <p className="text-gray-400 text-sm">3-day policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Size Chart Modal */}
      <SizeChart 
        category={product.sizeChartCategory || product.category} 
        isOpen={showSizeChart} 
        onClose={() => setShowSizeChart(false)}
        customSizeChart={product.customSizeChart}
        useCustomSizeChart={product.useCustomSizeChart}
      />
    </div>
  );
}
