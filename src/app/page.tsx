'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { categories } from '@/data/products';
import { Product } from '@/types';
import { ChevronRight, Star, Truck, Shield, RotateCcw, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useProducts } from '@/context/ProductContext';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { products } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  }, [products, selectedCategory]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-black py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto container-padding">
                      <div className="flex flex-col items-center text-center space-y-8">
              <Image
                src="/Logo Obsidian Wear sur fond noir.png"
                alt="OBSIDIAN WEAR Logo"
                width={220}
                height={220}
                priority
                className="w-48 sm:w-56 h-auto"
              />
              <h1 className="heading-responsive font-bold font-poppins text-white leading-tight">
                {t('hero.title')}
                <span className="block">{t('hero.title2')}</span>
              </h1>
              <p className="text-responsive text-gray-400 max-w-xl leading-relaxed">
                {t('hero.subtitle')}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    console.log('🚀 Hero CTA clicked');
                    const productsSection = document.getElementById('products');
                    if (productsSection) {
                      console.log('✅ Products section found, scrolling...');
                      productsSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      console.log('❌ Products section not found');
                      window.scrollTo({ top: 800, behavior: 'smooth' });
                    }
                  }}
                  className="btn-primary touch-target px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-responsive bg-white text-black hover:bg-gray-200 active:bg-gray-300 transition-colors"
                >
                  {t('hero.cta')}
                </button>
              </div>
            </div>
        </div>
      </section>



      {/* Products Section */}
      <section id="products" className="py-12 sm:py-16 lg:py-20 bg-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="heading-responsive font-bold font-poppins mb-4 text-white">
              {t('products.title')}
            </h2>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`touch-target px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="mobile-grid gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <ShoppingBag size={24} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{t('products.empty')}</h3>
              <p className="text-gray-400 text-responsive">{t('products.empty.desc')}</p>
            </div>
          )}
        </div>
      </section>



      <Footer />
    </div>
  );
}
