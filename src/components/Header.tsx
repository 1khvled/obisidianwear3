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
    <header className="bg-black/95 backdrop-blur-md border-b border-gray-800/50 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex justify-between items-center h-16 sm:h-20">
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
            <button
              onClick={() => {
                console.log('🛍️ Collection navigation clicked');
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#products';
                }
              }}
              className="text-white hover:text-gray-300 transition-colors text-sm xl:text-base font-medium cursor-pointer"
            >
              {t('nav.collection')}
            </button>
            <Link href="/cart" className="text-white hover:text-gray-300 transition-colors text-sm xl:text-base font-medium">
              Cart
            </Link>
          </nav>

          {/* Cart, Language Switcher and Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
                         <Link 
               href="/cart"
               className="relative touch-target text-white hover:text-gray-300 transition-colors rounded-lg"
             >
               <ShoppingBag size={20} className="sm:w-6 sm:h-6" />
               <span className="absolute -top-1 -right-1 bg-white text-black text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-semibold text-[10px] sm:text-xs">
                 {getTotalItems()}
               </span>
             </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden touch-target text-white hover:text-gray-300 transition-colors rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-800/50 py-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              <button 
                className="text-white hover:text-gray-300 hover:bg-gray-800/50 transition-all py-3 px-3 rounded-lg font-medium text-left"
                onClick={() => {
                  console.log('🏠 Mobile Home clicked');
                  setIsMenuOpen(false);
                  window.location.href = '/';
                }}
              >
                {t('nav.home')}
              </button>
              <button 
                className="text-white hover:text-gray-300 hover:bg-gray-800/50 transition-all py-3 px-3 rounded-lg font-medium text-left"
                onClick={() => {
                  console.log('🛍️ Mobile Collection clicked');
                  setIsMenuOpen(false);
                  const productsSection = document.getElementById('products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = '/#products';
                  }
                }}
              >
                {t('nav.collection')}
              </button>
              <Link 
                href="/cart" 
                className="text-white hover:text-gray-300 hover:bg-gray-800/50 transition-all py-3 px-3 rounded-lg font-medium text-left block"
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
