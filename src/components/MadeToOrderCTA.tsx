'use client';

import Link from 'next/link';
import { ArrowRight, Star, Package, Clock, Shield } from 'lucide-react';

export default function MadeToOrderCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">
              MADE TO ORDER
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Des pièces uniques créées spécialement pour vous. Personnalisez chaque détail selon vos préférences.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Personnalisation</h3>
              <p className="text-gray-400">
                Choisissez vos couleurs, tailles et finitions selon vos préférences.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Fabrication</h3>
              <p className="text-gray-400">
                Chaque pièce est fabriquée à la main avec attention aux détails.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Qualité</h3>
              <p className="text-gray-400">
                Matériaux premium et finitions impeccables garantis.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/made-to-order"
              className="group bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Commander maintenant
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/made-to-order-collection"
              className="group border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
            >
              Voir la collection
              <Star className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-gray-800">
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">500+</div>
              <div className="text-gray-400 text-sm">Pièces créées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">98%</div>
              <div className="text-gray-400 text-sm">Satisfaction client</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">24h</div>
              <div className="text-gray-400 text-sm">Temps de réponse</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">5★</div>
              <div className="text-gray-400 text-sm">Note moyenne</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
