'use client';

import Link from 'next/link';
import { ArrowRight, Star, Package, Clock, Shield } from 'lucide-react';

export default function MadeToOrderCTA() {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header - Streetwear Style */}
          <div className="mb-16">
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 uppercase tracking-tight">
              MADE TO ORDER
            </h2>
            <p className="text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium">
              UNIQUE PIECES CREATED SPECIALLY FOR YOU. CUSTOMIZE EVERY DETAIL.
            </p>
          </div>

          {/* Features Grid - Streetwear Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-black border-4 border-white p-8">
              <div className="w-16 h-16 bg-white rounded-sm flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wide">CUSTOMIZATION</h3>
              <p className="text-gray-400 font-medium">
                Choose your colors, sizes and finishes according to your preferences.
              </p>
            </div>

            <div className="bg-black border-4 border-white p-8">
              <div className="w-16 h-16 bg-white rounded-sm flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wide">CRAFTSMANSHIP</h3>
              <p className="text-gray-400 font-medium">
                Each piece is handcrafted with attention to detail.
              </p>
            </div>

            <div className="bg-black border-4 border-white p-8">
              <div className="w-16 h-16 bg-white rounded-sm flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wide">QUALITY</h3>
              <p className="text-gray-400 font-medium">
                Premium materials and impeccable finishes guaranteed.
              </p>
            </div>
          </div>

          {/* CTA Buttons - Streetwear Style */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/made-to-order"
              className="group bg-white text-black px-12 py-6 font-black text-2xl uppercase tracking-wider hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-3 border-4 border-black"
            >
              ORDER NOW
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/made-to-order-collection"
              className="group border-4 border-white text-white px-12 py-6 font-black text-2xl uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center gap-3"
            >
              VIEW COLLECTION
              <Star className="w-6 h-6" />
            </Link>
          </div>

          {/* Stats - Streetwear Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-8 border-t-4 border-white">
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-2">500+</div>
              <div className="text-gray-400 text-lg font-bold uppercase tracking-wide">PIECES CREATED</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-2">98%</div>
              <div className="text-gray-400 text-lg font-bold uppercase tracking-wide">CLIENT SATISFACTION</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-2">24H</div>
              <div className="text-gray-400 text-lg font-bold uppercase tracking-wide">RESPONSE TIME</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-2">5★</div>
              <div className="text-gray-400 text-lg font-bold uppercase tracking-wide">AVERAGE RATING</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
