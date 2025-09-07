'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  username: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials from environment variables
const ADMIN_CREDENTIALS = {
  username: process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin',
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123',
};

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
    // Simple authentication check
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setUsername(username);
      
      if (typeof window !== 'undefined') {
        // Store minimal data in localStorage (no sensitive info)
        localStorage.setItem('obsidian-admin-auth', 'true');
        localStorage.setItem('obsidian-admin-username', username);
        // Don't store password or tokens in localStorage
      }
      
      return true;
    }
    
    return false;
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
