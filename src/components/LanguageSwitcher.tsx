'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe size={20} className="text-white" />
      <button
        onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
        className="text-white hover:text-gray-300 transition-colors font-medium"
      >
        {language === 'en' ? 'FR' : 'EN'}
      </button>
    </div>
  );
}
