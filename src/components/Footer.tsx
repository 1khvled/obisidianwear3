'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useDesign } from '@/context/DesignContext';

export default function Footer() {
  const { isStreetwear } = useDesign();

  if (isStreetwear) {
    return (
      <footer className="bg-black border-t-2 border-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <img 
                src="/Logo Obsidian Wear sur fond noir.png" 
                alt="Obsidian Wear" 
                className="w-16 h-16 mb-4"
              />
              <h3 className="text-white font-black text-xl uppercase tracking-wider mb-2">OBSIDIAN WEAR</h3>
              <p className="text-gray-400 font-mono text-sm uppercase tracking-wide">
                PREMIUM STREETWEAR • LIMITED DROPS
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-black text-lg uppercase tracking-wider mb-4">QUICK LINKS</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-gray-400 hover:text-red-500 transition-colors font-bold uppercase">HOME</Link>
                <Link href="/#products" className="block text-gray-400 hover:text-red-500 transition-colors font-bold uppercase">COLLECTION</Link>
                <Link href="/made-to-order" className="block text-gray-400 hover:text-red-500 transition-colors font-bold uppercase">CUSTOM ORDERS</Link>
                <Link href="/contact" className="block text-gray-400 hover:text-red-500 transition-colors font-bold uppercase">CONTACT</Link>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-white font-black text-lg uppercase tracking-wider mb-4">FOLLOW US</h4>
              <div className="flex space-x-4">
                <a href="https://instagram.com/obsidianwear_dz" className="p-2 border border-white text-white hover:bg-red-500 hover:border-red-500 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="https://tiktok.com/@obsidianwear.dz" className="p-2 border border-white text-white hover:bg-red-500 hover:border-red-500 transition-colors">
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white mt-8 pt-6 text-center">
            <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">
              © 2024 OBSIDIAN WEAR • ALL RIGHTS RESERVED • ALGERIA
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Classic design
  return (
    <footer className="bg-black border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <img 
                src="/Logo Obsidian Wear sur fond noir.png" 
                alt="Obsidian Wear" 
                className="w-12 h-12 mb-4"
              />
            </div>
            <p className="text-gray-400 mb-6 max-w-md text-lg">
              More than clothing, an attitude. Discover our exclusive collection 
              that defines your unique style with premium pieces.
            </p>
            <div className="flex space-x-6">
              <a href="https://instagram.com/obsidianwear_dz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={24} />
              </a>
              <a href="https://tiktok.com/@obsidianwear.dz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <MessageCircle size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">OBSIDIAN WEAR</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">HOME</Link></li>
              <li><Link href="/#products" className="text-gray-400 hover:text-white transition-colors">COLLECTION</Link></li>
              <li><Link href="/made-to-order" className="text-gray-400 hover:text-white transition-colors">MADE TO ORDER</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">CONTACT</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">CONTACT</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-400">contact@obsidianwear.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-400">Algeria</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">&copy; 2024 Obsidian Wear. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}