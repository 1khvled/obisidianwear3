'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  ShoppingBag, 
  User,
  Search,
  Home,
  Package,
  Star,
  Settings,
  LogOut,
  Zap,
  Crown,
  Flame
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useDesign } from '@/context/DesignContext';
import DesignToggle from './DesignToggle';

export default function Header() {
  const { theme, isStreetwear } = useDesign();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const { getTotalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = getTotalItems();

  const handleNavigation = async (href: string, key: string) => {
    console.log(`🔄 Navigation button ${key} clicked - setting loading state`);
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    try {
      // Simulate navigation delay
      await new Promise(resolve => setTimeout(resolve, 300));
      window.location.href = href;
    } finally {
      console.log(`✅ Navigation ${key} loading complete`);
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  const navItems = [
    { name: 'Home', href: '/', icon: Home, key: 'home' },
    { name: 'Custom Order', href: '/made-to-order', icon: Star, key: 'custom-order' },
    { name: 'Collection', href: '/#products', icon: Package, key: 'collection' },
  ];

  if (isStreetwear) {
    return (
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}>
        {/* Streetwear Header */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="group flex items-center space-x-3">
              <img 
                src="/Logo Obsidian Wear sur fond noir.png" 
                alt="Obsidian Wear" 
                className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
              />
              <div className="hidden md:block">
                <div className="text-white font-black text-xl uppercase tracking-wider">
                  OBSIDIAN
                </div>
                <div className="text-purple-500 font-mono text-xs uppercase tracking-widest">
                  WEAR
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href, item.key)}
                  disabled={Object.values(loadingStates).some(loading => loading)}
                  className="group flex items-center space-x-2 text-white hover:text-purple-500 transition-colors duration-300 font-bold uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {loadingStates[item.key] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform group-hover:animate-pulse" />
                      {/* Hover loading effect */}
                      <div className="absolute -top-1 -right-1 w-2 h-2 border border-purple-500/50 border-t-transparent rounded-full animate-spin opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                  <span>{loadingStates[item.key] ? 'Loading...' : item.name}</span>
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button 
                onClick={async () => {
                  console.log('🔄 Search button clicked - setting loading state');
                  setLoadingStates(prev => ({ ...prev, search: true }));
                  try {
                    // Simulate search action
                    await new Promise(resolve => setTimeout(resolve, 300));
                    // Add search functionality here
                  } finally {
                    console.log('✅ Search loading complete');
                    setLoadingStates(prev => ({ ...prev, search: false }));
                  }
                }}
                disabled={Object.values(loadingStates).some(loading => loading)}
                className="group p-2 text-white hover:text-purple-500 transition-colors border border-white/20 hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {loadingStates.search ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 group-hover:animate-pulse" />
                    {/* Hover loading effect */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 border border-purple-500/50 border-t-transparent rounded-full animate-spin opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={async () => {
                  console.log('🔄 Cart button clicked - setting loading state');
                  setLoadingStates(prev => ({ ...prev, cart: true }));
                  try {
                    // Simulate cart navigation
                    await new Promise(resolve => setTimeout(resolve, 300));
                    window.location.href = '/cart';
                  } finally {
                    console.log('✅ Cart loading complete');
                    setLoadingStates(prev => ({ ...prev, cart: false }));
                  }
                }}
                disabled={Object.values(loadingStates).some(loading => loading)}
                className="relative p-2 text-white hover:text-purple-500 transition-colors border border-white/20 hover:border-purple-500 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStates.cart ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform group-hover:animate-pulse" />
                    {/* Hover loading effect */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 border border-purple-500/50 border-t-transparent rounded-full animate-spin opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
                {totalItems > 0 && !loadingStates.cart && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-black text-xs font-black px-1.5 py-0.5 min-w-5 h-5 flex items-center justify-center border border-white">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-purple-500 transition-colors border border-white/20 hover:border-purple-500"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/10">
              <div className="px-4 py-6 space-y-4">
                {/* Custom Order Prominent Button */}
                <button
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await handleNavigation('/made-to-order', 'mobile-custom-order');
                  }}
                  disabled={Object.values(loadingStates).some(loading => loading)}
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 transition-all font-black uppercase tracking-wider text-lg py-4 rounded-lg border-2 border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingStates['mobile-custom-order'] ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Star className="w-6 h-6" />
                  )}
                  <span>{loadingStates['mobile-custom-order'] ? 'Loading...' : '🎨 Custom Orders'}</span>
                </button>
                
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await handleNavigation(item.href, `mobile-${item.key}`);
                    }}
                    disabled={Object.values(loadingStates).some(loading => loading)}
                    className="flex items-center space-x-3 text-white hover:text-purple-500 transition-colors font-bold uppercase tracking-wider text-lg py-2 border-b border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingStates[`mobile-${item.key}`] ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <item.icon className="w-5 h-5" />
                    )}
                    <span>{loadingStates[`mobile-${item.key}`] ? 'Loading...' : item.name}</span>
                  </button>
                ))}
                
                {/* Mobile Admin Link */}
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-wider text-sm py-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Noise overlay for extra streetwear texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`
        }}></div>
      </header>
    );
  }

  // Classic design (original)
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:block group-hover:text-blue-400 transition-colors">
              Obsidian Wear
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-gray-800">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}