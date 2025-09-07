'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    setIsCheckingOut(true);
    // For now, redirect to first product checkout
    // In a real app, you'd create a multi-item checkout
    const firstItem = items[0];
    router.push(`/checkout?productId=${firstItem.productId}&size=${firstItem.selectedSize}&color=${firstItem.selectedColor}&quantity=${firstItem.quantity}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-7xl mx-auto container-padding py-8 sm:py-16">
          <div className="text-center py-12 sm:py-20 px-4">
            <ShoppingBag size={60} className="text-gray-600 mx-auto mb-4 sm:mb-6 sm:w-20 sm:h-20" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">Add some items to get started!</p>
            <Link
              href="/#products"
              className="inline-flex items-center px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-colors touch-target text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-7xl mx-auto container-padding py-8 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Shopping Cart</h1>
          </div>
          <button
            onClick={clearCart}
            className="text-red-400 hover:text-red-300 transition-colors flex items-center touch-target self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base sm:text-lg truncate">{item.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {item.selectedSize} - {item.selectedColor}
                    </p>
                    <p className="text-white font-semibold text-sm sm:text-base">{item.price} DA</p>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors touch-target"
                    >
                      <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <span className="text-white font-semibold w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors touch-target"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold text-lg">
                      {item.price * item.quantity} DA
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 transition-colors mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 sticky top-24">
              <h2 className="text-white font-semibold text-xl mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Items ({getTotalItems()})</span>
                  <span>{getTotalPrice()} DA</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between text-white font-semibold text-lg">
                    <span>Total</span>
                    <span>{getTotalPrice()} DA</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-white text-black py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <Link
                href="/#products"
                className="block w-full text-center text-gray-400 hover:text-white transition-colors mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
