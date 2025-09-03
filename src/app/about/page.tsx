'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h1 className="heading-responsive font-bold text-white mb-6">
              About OBSIDIAN WEAR
            </h1>
            <p className="text-responsive text-gray-400 max-w-2xl mx-auto">
              More than clothing, an attitude. Discover our exclusive collection that defines your unique style.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">Our Story</h2>
              <p className="text-gray-400 leading-relaxed">
                OBSIDIAN WEAR was born from a vision to create clothing that goes beyond fashion. 
                We believe that what you wear is a reflection of who you are - your attitude, 
                your confidence, your unique perspective on life.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Every piece in our collection is carefully crafted to embody the essence of 
                modern elegance and timeless style. We're not just selling clothes; 
                we're offering you a way to express your individuality.
              </p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800/50">
              <h3 className="text-xl font-semibold text-white mb-4">Our Values</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Quality craftsmanship
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Unique design philosophy
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Customer satisfaction
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Sustainable practices
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
