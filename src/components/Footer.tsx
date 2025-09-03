import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xl">O</span>
              </div>
              <span className="text-2xl font-bold font-poppins text-white">OBSIDIAN WEAR</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md text-lg">
              Plus qu'un vêtement, une attitude. Découvrez notre collection exclusive 
              qui définit votre style unique avec des pièces premium.
            </p>
            <div className="flex space-x-6">
              <a href="https://instagram.com/obsidianwear_dz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={24} />
              </a>
              <a href="https://tiktok.com/@obsidianwear.dz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">OBSIDIAN WEAR</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/#products" className="text-gray-400 hover:text-white transition-colors">
                  Collection
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-gray-400 hover:text-white transition-colors">
                  À Propos
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">SUIVEZ-NOUS</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Instagram size={20} className="text-gray-400" />
                <a href="https://instagram.com/obsidianwear_dz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  @obsidianwear_dz
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <a href="https://tiktok.com/@obsidianwear.dz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  @obsidianwear.dz
                </a>
              </div>

            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 OBSIDIAN WEAR. All rights reserved. | 
            <Link href="#" className="hover:text-white transition-colors ml-1">Politique de Confidentialité</Link> | 
            <Link href="#" className="hover:text-white transition-colors ml-1">Conditions d'Utilisation</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
