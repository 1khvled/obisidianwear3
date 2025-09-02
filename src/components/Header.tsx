'use client';

import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="bg-black border-b border-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-12">
            <Link href="/" className="text-white hover:text-gray-300 transition-colors text-lg">
              {t('nav.home')}
            </Link>
            <Link href="/#products" className="text-white hover:text-gray-300 transition-colors text-lg">
              {t('nav.collection')}
            </Link>
            <Link href="/#about" className="text-white hover:text-gray-300 transition-colors text-lg">
              {t('nav.about')}
            </Link>
            <Link href="/#contact" className="text-white hover:text-gray-300 transition-colors text-lg">
              {t('nav.contact')}
            </Link>
            <Link href="/admin" className="text-white hover:text-gray-300 transition-colors text-lg">
              {t('nav.admin')}
            </Link>
          </nav>

          {/* Cart, Language Switcher and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <button className="relative p-2 text-white hover:text-gray-300 transition-colors">
              <ShoppingBag size={24} />
              <span className="absolute -top-1 -right-1 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white hover:text-gray-300 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link 
                href="/#products" 
                className="text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.collection')}
              </Link>
              <Link 
                href="/#about" 
                className="text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.about')}
              </Link>
              <Link 
                href="/#contact" 
                className="text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.contact')}
              </Link>
              <Link 
                href="/admin" 
                className="text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.admin')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
