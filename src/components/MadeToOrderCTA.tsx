'use client';

import Link from 'next/link';
import { ArrowRight, Star, Package, Clock, Shield } from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { useState } from 'react';

export default function MadeToOrderCTA() {
  const { isStreetwear } = useDesign();
  const [isLoading, setIsLoading] = useState(false);

  if (isStreetwear) {
    return (
      <section className="py-20 bg-black border-t-2 border-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-6xl lg:text-8xl font-black text-white mb-8 uppercase tracking-wider">
              CUSTOM
              <div className="text-red-500">ORDERS</div>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-12 font-mono uppercase tracking-wide">
              MADE FOR YOU • EXCLUSIVE DESIGNS • NO COMPROMISES
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-black border-2 border-white p-6 hover:border-red-500 transition-colors">
                <div className="text-red-500 font-black text-4xl mb-2 font-mono">100%</div>
                <div className="text-white font-bold text-sm uppercase tracking-widest">CUSTOM</div>
                <div className="text-gray-400 text-xs mt-1 font-mono">YOUR VISION</div>
              </div>
              
              <div className="bg-black border-2 border-white p-6 hover:border-red-500 transition-colors">
                <div className="text-red-500 font-black text-4xl mb-2 font-mono">18-20</div>
                <div className="text-white font-bold text-sm uppercase tracking-widest">DAYS</div>
                <div className="text-gray-400 text-xs mt-1 font-mono">PRODUCTION</div>
              </div>
              
              <div className="bg-black border-2 border-white p-6 hover:border-red-500 transition-colors">
                <div className="text-red-500 font-black text-4xl mb-2 font-mono">PREMIUM</div>
                <div className="text-white font-bold text-sm uppercase tracking-widest">QUALITY</div>
                <div className="text-gray-400 text-xs mt-1 font-mono">GUARANTEED</div>
              </div>
            </div>

            <button
              onClick={async () => {
                console.log('🔄 START YOUR ORDER button clicked - setting loading state');
                setIsLoading(true);
                try {
                  // Simulate navigation delay
                  await new Promise(resolve => setTimeout(resolve, 300));
                  window.location.href = '/made-to-order';
                } finally {
                  console.log('✅ START YOUR ORDER loading complete');
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="group inline-flex items-center bg-red-500 hover:bg-red-600 text-black px-12 py-4 font-black text-xl uppercase tracking-wider transition-all duration-300 hover:scale-105 border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mr-3" />
                  LOADING...
                </>
              ) : (
                <>
                  <span className="group-hover:animate-pulse">START YOUR ORDER</span>
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:animate-pulse" />
                  {/* Hover loading effect */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border border-black/50 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Classic design
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                MADE TO ORDER
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Unique pieces created specially for you. Customize every detail according to your vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Customization</h3>
              <p className="text-gray-400">
                Choose colors, sizes and finishes according to your preferences.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Craftsmanship</h3>
              <p className="text-gray-400">
                Each piece is handcrafted with attention to detail.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Quality</h3>
              <p className="text-gray-400">
                Premium materials and impeccable finishes guaranteed.
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              console.log('🔄 Discover Made to Order button clicked - setting loading state');
              setIsLoading(true);
              try {
                // Simulate navigation delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                window.location.href = '/made-to-order';
              } finally {
                console.log('✅ Discover Made to Order loading complete');
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="group inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 shadow-2xl shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                LOADING...
              </>
            ) : (
              <>
                <Star className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                <span className="group-hover:animate-pulse">Discover Made to Order</span>
                <ArrowRight className="w-6 h-6 ml-3 group-hover:animate-pulse" />
                {/* Hover loading effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border border-white/50 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}