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
      title: "OBSIDIAN WEAR",
      subtitle: "Plus qu'un vêtement, une attitude",
      description: "Découvrez notre collection exclusive de vêtements premium. Style unique, qualité exceptionnelle.",
      image: "/Logo Obsidian Wear sur fond noir.png",
      cta: "Découvrir la collection",
      link: "/made-to-order"
    },
    {
      id: 2,
      title: "MADE TO ORDER",
      subtitle: "Créé spécialement pour vous",
      description: "Des pièces uniques créées selon vos spécifications. Personnalisez chaque détail.",
      image: "/Logo Obsidian Wear sur fond noir.png",
      cta: "Commander maintenant",
      link: "/made-to-order"
    },
    {
      id: 3,
      title: "QUALITÉ PREMIUM",
      subtitle: "Excellence dans chaque couture",
      description: "Matériaux de haute qualité, finitions impeccables. L'excellence à chaque détail.",
      image: "/Logo Obsidian Wear sur fond noir.png",
      cta: "Voir les produits",
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
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
                {slides[currentSlide].title}
              </h1>
              <h2 className="text-2xl lg:text-3xl font-light text-gray-300">
                {slides[currentSlide].subtitle}
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={slides[currentSlide].link}
                className="group bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {slides[currentSlide].cta}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="group border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
              >
                En savoir plus
                <MessageCircle className="w-5 h-5" />
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="flex items-center gap-3 text-gray-300">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">Qualité Premium</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Package className="w-5 h-5 text-blue-400" />
                <span className="text-sm">Made to Order</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-sm">Livraison Rapide</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <span className="text-sm">Paiement Sécurisé</span>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gray-800">
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>

        {/* Slide Navigation */}
        <div className="flex justify-center gap-4 mt-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-white scale-125'
                  : 'bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
