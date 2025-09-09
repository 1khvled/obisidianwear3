'use client';

import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { getTotalItems } = useCart();

  return (
    <header className="bg-black/95 backdrop-blur-md border-b border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12">
            <Link 
              href="/" 
              className="text-white hover:text-gray-300 transition-colors text-sm xl:text-base font-medium"
              onClick={() => {
                console.log('🏠 Home navigation clicked');
                window.location.href = '/';
              }}
            >
              {t('nav.home')}
            </Link>
            <Link 
              href="/#products" 
              className="text-white hover:text-gray-300 transition-colors text-sm xl:text-base font-medium"
            >
              {t('nav.collection')}
            </Link>
            <Link 
              href="/made-to-order" 
              className="bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white px-4 py-2 rounded-lg font-bold text-sm xl:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-white/20 border border-white/30"
            >
              ✨ {t('nav.madeToOrder')} ✨
            </Link>
            <Link href="/cart" className="text-white hover:text-gray-300 transition-colors text-sm xl:text-base font-medium">
              Cart
            </Link>
          </nav>

          {/* Cart, Language Switcher and Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <div className="flex flex-col items-end">
              <Link 
                href="/cart"
                className="relative touch-target text-white hover:text-gray-300 transition-colors rounded-lg p-1"
              >
                <ShoppingBag size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                <span className="absolute -top-1 -right-1 bg-white text-black text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-semibold text-[10px] sm:text-xs">
                  {getTotalItems()}
                </span>
              </Link>
              <div className="hidden sm:block mt-1">
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden touch-target text-white hover:text-gray-300 transition-colors rounded-lg p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-800/50 py-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2">
              <button 
                className="text-white hover:text-gray-300 hover:bg-gray-800/50 transition-all py-3 px-4 rounded-lg font-medium text-left touch-target"
                onClick={() => {
                  console.log('🏠 Mobile Home clicked');
                  setIsMenuOpen(false);
                  window.location.href = '/';
                }}
              >
                {t('nav.home')}
              </button>
              <Link 
                href="/#products"
                className="text-white hover:text-gray-300 hover:bg-gray-800/50 transition-all py-3 px-4 rounded-lg font-medium text-left block touch-target"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.collection')}
              </Link>
              <Link 
                href="/made-to-order"
                className="bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white font-bold py-3 px-4 rounded-lg text-left block touch-target transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-white/20 border border-white/30"
                onClick={() => setIsMenuOpen(false)}
              >
                ✨ {t('nav.madeToOrder')} ✨
              </Link>
              <Link 
                href="/cart"
                className="text-white hover:text-gray-300 hover:bg-gray-800/50 transition-all py-3 px-4 rounded-lg font-medium text-left block touch-target"
                onClick={() => setIsMenuOpen(false)}
              >
                Cart
              </Link>
              <div className="sm:hidden pt-2 mt-2 border-t border-gray-800/50">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
