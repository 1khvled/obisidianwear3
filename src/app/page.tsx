'use client';

import { useState, useEffect } from 'react';
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
      <section className="relative bg-black py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                             <div className="text-center">
                     <h1 className="text-5xl md:text-7xl font-bold font-poppins mb-8 text-white">
                       {t('hero.title')}
                       <span className="block">{t('hero.title2')}</span>
                     </h1>
                     <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
                       {t('hero.subtitle')}
                     </p>
                     <button className="bg-white text-black px-8 py-4 rounded-none font-semibold hover:bg-gray-200 transition-colors text-lg">
                       {t('hero.cta')}
                     </button>
                   </div>
        </div>
      </section>



      {/* Products Section */}
      <section id="products" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4 text-white">
              {t('products.title')}
            </h2>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('products.empty')}</h3>
              <p className="text-gray-400">{t('products.empty.desc')}</p>
            </div>
          )}
        </div>
      </section>



      <Footer />
    </div>
  );
}
