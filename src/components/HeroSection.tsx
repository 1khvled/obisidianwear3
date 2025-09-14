'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Zap, Star, Sparkles, Crown, Flame, ArrowRight } from 'lucide-react';
import { useDesign } from '@/context/DesignContext';

export default function HeroSection() {
  const { isStreetwear } = useDesign();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (isStreetwear) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}></div>
        </div>

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`
        }}></div>

        {/* Large brand text background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/5 font-black text-[20vw] leading-none tracking-tighter uppercase select-none">
            OBSIDIAN
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className={`inline-flex items-center bg-purple-500 text-black px-6 py-2 mb-8 border-2 border-white transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <Crown className="w-5 h-5 mr-2" />
            <span className="font-black uppercase tracking-widest text-sm">PREMIUM STREETWEAR</span>
          </div>

          {/* Main Title */}
          <h1 className={`text-7xl md:text-9xl font-black text-white mb-6 tracking-wider uppercase leading-none transition-all duration-1000 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="relative">
              OBSIDIAN
              <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-8 h-8 md:w-12 md:h-12 bg-purple-500 border-2 border-white"></div>
            </div>
            <div className="text-purple-500 text-4xl md:text-6xl mt-4 font-mono">
              × WEAR ×
            </div>
          </h1>

          {/* Subtitle */}
          <p className={`text-white text-lg md:text-xl mb-12 max-w-3xl mx-auto font-mono uppercase tracking-widest transition-all duration-1000 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            EXCLUSIVE DROPS • LIMITED STOCK • NO RESTOCKS
            <br />
            <span className="text-purple-500 font-black">WHEN IT'S GONE, IT'S GONE</span>
          </p>

          {/* Stats */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 transition-all duration-1000 delay-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="bg-black/80 border-2 border-white p-6 group hover:border-purple-500 transition-all duration-300">
              <div className="text-center">
                <div className="text-purple-500 font-black text-4xl mb-2 font-mono">LTD</div>
                <div className="text-white font-bold text-sm uppercase tracking-widest">EXCLUSIVE</div>
                <div className="text-gray-400 text-xs mt-1 font-mono">STAY FRESH</div>
              </div>
            </div>
            
            <div className="bg-black/80 border-2 border-white p-6 group hover:border-purple-500 transition-all duration-300">
              <div className="text-center">
                <div className="text-purple-500 font-black text-4xl mb-2 font-mono">100%</div>
                <div className="text-white font-bold text-sm uppercase tracking-widest">AUTHENTIC</div>
                <div className="text-gray-400 text-xs mt-1 font-mono">NO FAKES HERE</div>
              </div>
            </div>
            
            <div className="bg-black/80 border-2 border-white p-6 group hover:border-purple-500 transition-all duration-300">
              <div className="text-center">
                <div className="text-purple-500 font-black text-4xl mb-2 font-mono">LTD</div>
                <div className="text-white font-bold text-sm uppercase tracking-widest">EDITION</div>
                <div className="text-gray-400 text-xs mt-1 font-mono">EXCLUSIVE ONLY</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-1000 delay-800 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={() => {
                const element = document.getElementById('products');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group bg-purple-500 hover:bg-purple-600 text-black px-12 py-4 font-black text-xl uppercase tracking-wider transition-all duration-300 hover:scale-105 border-2 border-white flex items-center"
            >
              SHOP NOW
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <button
              onClick={() => {
                window.location.href = '/made-to-order';
              }}
              className="group bg-black border-2 border-white text-white hover:bg-white hover:text-black px-12 py-4 font-black text-xl uppercase tracking-wider transition-all duration-300 hover:scale-105 flex items-center"
            >
              CUSTOM ORDERS
              <Flame className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Scroll indicator */}
          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="flex flex-col items-center text-white/60">
              <span className="text-xs uppercase tracking-widest font-mono mb-2">SCROLL FOR HEAT</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Side accents */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/20 font-black text-xl writing-mode-vertical-rl tracking-widest uppercase">
          OBSIDIAN WEAR 2025
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/20 font-black text-xl writing-mode-vertical-rl tracking-widest uppercase rotate-180">
          LIMITED DROPS ONLY
        </div>
      </section>
    );
  }

  // Classic design
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/5 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className={`inline-flex items-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-6 py-3 mb-8 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <Sparkles className="w-5 h-5 text-blue-400 mr-2" />
          <span className="text-white font-medium">Premium Fashion Collection</span>
        </div>

        {/* Main Title */}
        <h1 className={`text-6xl md:text-8xl font-black text-white mb-6 tracking-tight transition-all duration-1000 delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Obsidian
          </span>{' '}
          <span className="text-white">Wear</span>
        </h1>

        {/* Subtitle */}
        <p className={`text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          Discover premium fashion that defines your style. From streetwear to elegance, 
          we craft pieces that speak to your unique personality.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-1000 delay-600 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <button
            onClick={() => {
              const element = document.getElementById('products');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 shadow-2xl shadow-blue-500/25 flex items-center"
          >
            <Zap className="w-6 h-6 mr-3 group-hover:animate-pulse" />
            Shop Collection
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => {
              window.location.href = '/made-to-order';
            }}
            className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 flex items-center"
          >
            <Star className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
            Custom Orders
          </button>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-800 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="flex flex-col items-center text-gray-400">
            <span className="text-sm mb-2">Discover more</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}