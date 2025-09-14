'use client';

import React from 'react';
import { useDesign } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

export default function AboutPage() {
  const { isStreetwear } = useDesign();
  const { t } = useLanguage();

  return (
    <>
      <SEOHead 
        title="About Us - OBSIDIAN WEAR"
        description="Learn about OBSIDIAN WEAR - Plus qu'un vêtement, une attitude. Discover our story, mission, and commitment to streetwear fashion."
        keywords="about, obsidian wear, streetwear, fashion, story, mission"
      />
      
      <Header />
      
      <main className={`min-h-screen ${isStreetwear ? 'bg-black text-white' : 'bg-white text-black'}`}>
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-violet-500">OBSIDIAN WEAR</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8">
              Plus qu'un vêtement, une attitude
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-lg text-gray-300 mb-6">
                  OBSIDIAN WEAR was born from a passion for streetwear and a desire to create 
                  clothing that goes beyond fashion - it's a lifestyle, an attitude, a statement.
                </p>
                <p className="text-lg text-gray-300 mb-6">
                  We believe that what you wear should reflect who you are and what you stand for. 
                  Our designs are crafted with attention to detail, quality materials, and a 
                  commitment to authenticity.
                </p>
                <p className="text-lg text-gray-300">
                  From our headquarters, we create pieces that speak to the urban culture, 
                  blending comfort, style, and individuality into every garment.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-violet-500 mr-3">✓</span>
                    <span>Create high-quality streetwear that represents urban culture</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-violet-500 mr-3">✓</span>
                    <span>Provide custom made-to-order options for unique expression</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-violet-500 mr-3">✓</span>
                    <span>Support local communities and sustainable fashion practices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-violet-500 mr-3">✓</span>
                    <span>Deliver exceptional customer service and experience</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-violet-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Creativity</h3>
                <p className="text-gray-300">
                  We push boundaries and create unique designs that stand out from the crowd.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-violet-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Quality</h3>
                <p className="text-gray-300">
                  Every piece is crafted with premium materials and attention to detail.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-violet-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Community</h3>
                <p className="text-gray-300">
                  We build connections and support the streetwear community worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-lg text-gray-300 mb-8">
              Have questions about our products or want to collaborate? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="bg-violet-500 hover:bg-violet-600 text-white px-8 py-3 rounded-lg transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="/made-to-order" 
                className="border border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white px-8 py-3 rounded-lg transition-colors"
              >
                Custom Orders
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
