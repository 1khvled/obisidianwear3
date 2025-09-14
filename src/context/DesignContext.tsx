'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DesignTheme = 'classic' | 'streetwear';

interface DesignContextType {
  theme: DesignTheme;
  setTheme: (theme: DesignTheme) => void;
  isStreetwear: boolean;
  isClassic: boolean;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<DesignTheme>('streetwear'); // Default to streetwear
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('obsidian_design_theme');
    if (savedTheme === 'classic' || savedTheme === 'streetwear') {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: DesignTheme) => {
    setThemeState(newTheme);
    if (isClient) {
      localStorage.setItem('obsidian_design_theme', newTheme);
    }
  };

  const value: DesignContextType = {
    theme,
    setTheme,
    isStreetwear: theme === 'streetwear',
    isClassic: theme === 'classic'
  };

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = () => {
  const context = useContext(DesignContext);
  if (context === undefined) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
};
