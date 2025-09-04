'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // Load saved theme from database with localStorage fallback
    const loadTheme = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Try to get from database first
          const prefsService = (await import('@/lib/preferencesService')).default;
          const dbTheme = await prefsService.getTheme();
          
          if (dbTheme && (dbTheme === 'light' || dbTheme === 'dark')) {
            setThemeState(dbTheme);
          } else {
            // Fallback to localStorage
            const savedTheme = localStorage.getItem('admin-theme') as Theme;
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
              setThemeState(savedTheme);
              // Sync to database
              await prefsService.setTheme(savedTheme);
            }
          }
        } catch (error) {
          console.error('Error loading theme:', error);
          // Fallback to localStorage
          const savedTheme = localStorage.getItem('admin-theme') as Theme;
          if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            setThemeState(savedTheme);
          }
        }
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    // Save theme preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-theme', theme);
      
      // Update database in background
      const updateDatabase = async () => {
        try {
          const prefsService = (await import('@/lib/preferencesService')).default;
          await prefsService.setTheme(theme);
        } catch (error) {
          console.error('Error saving theme to database:', error);
        }
      };
      updateDatabase();
    }
    
    // Apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      
      // Update meta theme-color for mobile
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
