'use client';

import { useState, useEffect } from 'react';
import { Palette, RotateCcw } from 'lucide-react';

export default function DesignToggle() {
  const [useNewDesign, setUseNewDesign] = useState(true);

  useEffect(() => {
    // Check localStorage for user preference
    const savedPreference = localStorage.getItem('mto_design_preference');
    if (savedPreference !== null) {
      setUseNewDesign(savedPreference === 'new');
    }
  }, []);

  const toggleDesign = () => {
    const newValue = !useNewDesign;
    setUseNewDesign(newValue);
    localStorage.setItem('mto_design_preference', newValue ? 'new' : 'old');
    
    // Reload the page to apply the new design
    window.location.reload();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleDesign}
        className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border border-white/20 backdrop-blur-sm"
        title={`Switch to ${useNewDesign ? 'Classic' : 'Modern'} Design`}
      >
        {useNewDesign ? (
          <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
        ) : (
          <Palette className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
        )}
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-900/95 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg border border-gray-700 whitespace-nowrap">
          {useNewDesign ? 'Switch to Classic Design' : 'Switch to Modern Design'}
        </div>
      </div>
    </div>
  );
}
