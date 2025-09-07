'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  username: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials are now handled server-side via API

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('obsidian-admin-auth');
      const savedUsername = localStorage.getItem('obsidian-admin-username');
      
      if (savedAuth === 'true' && savedUsername) {
        setIsAuthenticated(true);
        setUsername(savedUsername);
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // This function is now called after successful API authentication
    // The actual authentication happens in the AdminLogin component via API call
    setIsAuthenticated(true);
    setUsername(username);
    
    if (typeof window !== 'undefined') {
      // Store minimal data in localStorage (no sensitive info)
      localStorage.setItem('obsidian-admin-auth', 'true');
      localStorage.setItem('obsidian-admin-username', username);
      // Don't store password or tokens in localStorage
    }
    
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername('');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('obsidian-admin-auth');
      localStorage.removeItem('obsidian-admin-username');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      username
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
