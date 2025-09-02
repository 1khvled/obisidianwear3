'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { products } from '@/data/products';
import { Product } from '@/types';
import { Star, ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product: Product | undefined = products.find(p => p.id === params.id);

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

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-white hover:text-gray-300 mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Additional Images (using same image for demo) */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(index - 1)}
                >
                  <Image
                    src={product.image}
                    alt={`${product.name} ${index}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-poppins text-white mb-2">
                {product.name}
              </h1>
              <p className="text-gray-400 text-lg">{product.category}</p>
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
              <span className="text-gray-400">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-white">
                {product.price} DZD
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {product.originalPrice} DZD
                  </span>
                  <span className="bg-red-600 text-white text-sm font-semibold px-2 py-1 rounded">
                    Save {(product.originalPrice - product.price).toFixed(0)} DZD
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
              <h3 className="text-white font-semibold text-lg mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-white bg-white text-black'
                        : 'border-gray-600 text-white hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
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
              <h3 className="text-white font-semibold text-lg mb-3">Quantity</h3>
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
                onClick={handleBuyNow}
                className="w-full bg-white text-black py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={20} />
                <span>Buy Now - ${(product.price * quantity).toFixed(2)}</span>
              </button>
              
              <div className="flex space-x-4">
                <button className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                  <Heart size={20} />
                  <span>Add to Wishlist</span>
                </button>
                <button className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                  <Share2 size={20} />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-gray-800 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Truck size={20} className="text-gray-400" />
                  <div>
                    <p className="text-white font-medium">Free Shipping</p>
                    <p className="text-gray-400 text-sm">On orders over $50</p>
                  </div>
                </div>
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
                    <p className="text-gray-400 text-sm">30-day policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
