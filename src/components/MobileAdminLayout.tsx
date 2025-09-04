'use client';

import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  BarChart3, 
  Package, 
  Archive, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  MapPin,
  Sun,
  Moon,
  LogOut,
  Home
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface MobileAdminLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  username: string;
  children: React.ReactNode;
}

const sidebarItems = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { id: 'products', icon: Package, label: 'Products', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  { id: 'inventory', icon: Archive, label: 'Inventory', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  { id: 'orders', icon: ShoppingCart, label: 'Orders', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  { id: 'analytics', icon: TrendingUp, label: 'Analytics', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { id: 'customers', icon: Users, label: 'Customers', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  { id: 'maintenance', icon: AlertTriangle, label: 'Maintenance', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  { id: 'wilayas', icon: MapPin, label: 'Wilayas', color: 'text-red-400', bgColor: 'bg-red-500/20' }
];

export default function MobileAdminLayout({ 
  activeTab, 
  onTabChange, 
  onLogout, 
  username, 
  children 
}: MobileAdminLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">OBSIDIAN</h1>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => window.open('/', '_blank')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Back to Shop"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-800 shadow-xl">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white">OBSIDIAN</h1>
                  <p className="text-gray-400 text-sm">Admin Panel</p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <nav className="p-4">
              <div className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === item.id
                        ? `${item.bgColor} ${item.color} shadow-lg border border-current/20`
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                      activeTab === item.id ? item.color : item.color + ' group-hover:text-white'
                    }`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black text-sm font-bold">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Admin</p>
                  <p className="text-gray-400 text-xs">{username}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
