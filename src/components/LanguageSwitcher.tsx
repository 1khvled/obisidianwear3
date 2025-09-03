'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = () => {
    const newLang = language === 'en' ? 'fr' : 'en';
    console.log('🌍 Language switching from', language, 'to', newLang);
    setLanguage(newLang);
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
      <Globe size={16} className="text-white" />
      <button
        onClick={handleLanguageChange}
        className="text-white hover:text-gray-300 transition-colors font-medium text-sm min-w-[32px] touch-target"
        type="button"
      >
        {language === 'en' ? 'FR' : 'EN'}
      </button>
      <span className="text-gray-400 text-xs">|</span>
      <button
        onClick={() => {
          console.log('🌍 Setting to EN');
          setLanguage('en');
        }}
        className={`text-xs px-2 py-1 rounded transition-colors touch-target ${
          language === 'en' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
        }`}
        type="button"
      >
        EN
      </button>
      <button
        onClick={() => {
          console.log('🌍 Setting to FR');
          setLanguage('fr');
        }}
        className={`text-xs px-2 py-1 rounded transition-colors touch-target ${
          language === 'fr' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
        }`}
        type="button"
      >
        FR
      </button>
    </div>
  );
}
