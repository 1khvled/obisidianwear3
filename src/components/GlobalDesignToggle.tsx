'use client';

import { useState } from 'react';
import { Palette, RotateCcw, Flame, Crown } from 'lucide-react';
import { useDesign } from '@/context/DesignContext';

export default function GlobalDesignToggle() {
  const { theme, setTheme, isStreetwear } = useDesign();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDesign = () => {
    const newTheme = isStreetwear ? 'classic' : 'streetwear';
    setTheme(newTheme);
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main toggle button */}
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`group p-4 shadow-2xl transition-all duration-300 hover:scale-110 border-2 ${
            isStreetwear 
              ? 'bg-red-500 hover:bg-red-600 text-black border-white' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-white/20 rounded-full backdrop-blur-sm'
          }`}
          title="Design Settings"
        >
          {isStreetwear ? (
            <Flame className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <Palette className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Expanded menu */}
        {isExpanded && (
          <div className={`absolute bottom-full right-0 mb-2 p-4 shadow-2xl border-2 transition-all duration-300 transform ${
            isStreetwear 
              ? 'bg-black border-white' 
              : 'bg-gray-900/95 backdrop-blur-sm border-gray-700 rounded-lg'
          }`}>
            <div className="space-y-3 min-w-48">
              <div className={`text-center pb-2 border-b ${
                isStreetwear ? 'border-white text-white' : 'border-gray-700 text-white'
              }`}>
                <p className={`text-sm font-bold uppercase tracking-wide ${
                  isStreetwear ? 'font-black' : ''
                }`}>
                  {isStreetwear ? 'DESIGN MODE' : 'Design Settings'}
                </p>
              </div>
              
              {/* Current theme indicator */}
              <div className="text-center">
                <p className={`text-xs mb-2 ${
                  isStreetwear ? 'text-gray-400 font-mono' : 'text-gray-400'
                }`}>
                  Current: 
                </p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 ${
                  isStreetwear 
                    ? 'bg-red-500 text-black border border-white' 
                    : 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-300'
                }`}>
                  {isStreetwear ? (
                    <>
                      <Crown className="w-4 h-4" />
                      <span className="text-xs font-black uppercase">STREETWEAR</span>
                    </>
                  ) : (
                    <>
                      <Palette className="w-4 h-4" />
                      <span className="text-xs font-medium">Classic</span>
                    </>
                  )}
                </div>
              </div>

              {/* Toggle button */}
              <button
                onClick={toggleDesign}
                className={`w-full py-3 px-4 font-bold text-sm transition-all duration-300 hover:scale-105 border-2 flex items-center justify-center gap-2 ${
                  isStreetwear 
                    ? 'bg-white text-black border-white hover:bg-gray-100 uppercase tracking-wider' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-transparent rounded-lg'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                {isStreetwear ? 'SWITCH TO CLASSIC' : 'Switch to Streetwear'}
              </button>

              {/* Info */}
              <div className="text-center">
                <p className={`text-xs leading-relaxed ${
                  isStreetwear 
                    ? 'text-gray-400 font-mono' 
                    : 'text-gray-500'
                }`}>
                  {isStreetwear 
                    ? 'RAW • BOLD • STREET' 
                    : 'Elegant • Modern • Smooth'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
