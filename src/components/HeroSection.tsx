'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star, ShoppingBag, Package, Clock, CreditCard, MessageCircle } from 'lucide-react';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "DRIP WITHOUT LIMITS.",
      subtitle: "From streetwear classics to iconic luxury looks,",
      description: "we bring you the style you want at the price you need.",
      image: "/Logo Obsidian Wear sur fond noir.png",
      cta: "Discover the collection",
      link: "/made-to-order"
    },
    {
      id: 2,
      title: "MADE TO ORDER",
      subtitle: "Created especially for you",
      description: "Unique pieces created according to your specifications. Customize every detail.",
      image: "/Logo Obsidian Wear sur fond noir.png",
      cta: "Order now",
      link: "/made-to-order"
    },
    {
      id: 3,
      title: "PREMIUM QUALITY",
      subtitle: "Excellence in every stitch",
      description: "High-quality materials, impeccable finishes. Excellence in every detail.",
      image: "/Logo Obsidian Wear sur fond noir.png",
      cta: "View products",
      link: "/made-to-order"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* Minimalist background - no patterns */}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-8xl font-black text-white leading-none tracking-tight">
                {slides[currentSlide].title}
              </h1>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-300 leading-tight">
                {slides[currentSlide].subtitle}
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed max-w-lg font-medium">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* CTA Buttons - Streetwear Style */}
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={() => {
                  const productsSection = document.getElementById('products-section');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group bg-white text-black px-12 py-6 font-black text-2xl uppercase tracking-wider hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-3 border-4 border-black"
              >
                SHOP NOW
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                href="/made-to-order"
                className="group border-4 border-white text-white px-12 py-6 font-black text-2xl uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center gap-3"
              >
                CUSTOM ORDERS
                <Package className="w-6 h-6" />
              </Link>
            </div>

            {/* Features - Streetwear Style */}
            <div className="grid grid-cols-2 gap-6 pt-12">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                  <Star className="w-5 h-5 text-black" />
                </div>
                <span className="text-lg font-bold uppercase tracking-wide">Premium Quality</span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                  <Package className="w-5 h-5 text-black" />
                </div>
                <span className="text-lg font-bold uppercase tracking-wide">Custom Made</span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                  <Clock className="w-5 h-5 text-black" />
                </div>
                <span className="text-lg font-bold uppercase tracking-wide">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-black" />
                </div>
                <span className="text-lg font-bold uppercase tracking-wide">Secure Payment</span>
              </div>
            </div>
          </div>

          {/* Right Content - Image - Minimalist */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] border-4 border-white overflow-hidden bg-black">
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Slide Navigation - Streetwear Style */}
        <div className="flex justify-center gap-6 mt-16">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 border-2 border-white transition-all duration-200 ${
                currentSlide === index
                  ? 'bg-white scale-110'
                  : 'bg-transparent hover:bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
