'use client';

import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import GlobalDesignToggle from '@/components/GlobalDesignToggle';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(id);
      return;
    }
    
    setIsUpdating(id);
    await updateQuantity(id, newQuantity);
    setIsUpdating(null);
  };

  const handleRemoveItem = async (id: string) => {
    setIsUpdating(id);
    await removeFromCart(id);
    setIsUpdating(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <Link 
              href="/" 
              className="p-3 border-2 border-white hover:bg-white hover:text-black transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-5xl font-black uppercase tracking-wider">YOUR CART</h1>
              <p className="text-gray-400 font-mono uppercase text-sm tracking-widest mt-2">
                {getTotalItems()} ITEMS • {getTotalPrice()} DZD TOTAL
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-black border-2 border-white p-12 max-w-md mx-auto">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-white mb-4 uppercase">CART IS EMPTY</h2>
                <p className="text-gray-400 mb-8 font-mono">NO ITEMS IN YOUR CART YET</p>
                <Link
                  href="/"
                  className="bg-purple-500 hover:bg-purple-600 text-black px-8 py-3 font-black uppercase tracking-wider transition-colors border-2 border-white"
                >
                  SHOP NOW
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-black border-2 border-white p-6 flex gap-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-white uppercase mb-2">{item.name}</h3>
                      <div className="text-sm text-gray-400 font-mono mb-4">
                        SIZE: {item.selectedSize} • COLOR: {item.selectedColor}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={isUpdating === item.id}
                            className="w-8 h-8 border border-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating === item.id}
                            className="w-8 h-8 border border-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-black text-purple-500 font-mono">
                            {(item.price * item.quantity).toFixed(0)} DZD
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating === item.id}
                            className="p-2 border border-white hover:bg-purple-500 hover:border-purple-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-black border-2 border-white p-6 h-fit">
                <h2 className="text-2xl font-black text-white uppercase mb-6">ORDER SUMMARY</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400">SUBTOTAL:</span>
                    <span className="text-white">{getTotalPrice()} DZD</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400">SHIPPING:</span>
                    <span className="text-white">CALCULATED AT CHECKOUT</span>
                  </div>
                  <div className="border-t border-white pt-4">
                    <div className="flex justify-between">
                      <span className="text-white font-black text-lg">TOTAL:</span>
                      <span className="text-purple-500 font-black text-xl font-mono">{getTotalPrice()} DZD</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/cart/checkout"
                  className="w-full bg-purple-500 hover:bg-purple-600 text-black py-4 px-6 font-black text-center uppercase tracking-wider transition-colors border-2 border-white block"
                >
                  CHECKOUT
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <GlobalDesignToggle />
    </div>
  );
}