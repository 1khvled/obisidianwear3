'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import sessionService from '@/lib/sessionService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  username: string;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials from environment variables
const ADMIN_CREDENTIALS = {
  username: process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'khvled',
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Dzt3ch456@',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in via session
    const checkAuth = async () => {
      try {
        setLoading(true);
        const authenticated = await sessionService.isAuthenticated();
        if (authenticated) {
          const sessionUsername = await sessionService.getUsername();
          setIsAuthenticated(true);
          setUsername(sessionUsername || '');
        } else {
          setIsAuthenticated(false);
          setUsername('');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setUsername('');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simple authentication check
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      try {
        const success = await sessionService.createSession(username);
        if (success) {
          setIsAuthenticated(true);
          setUsername(username);
          return true;
        }
      } catch (error) {
        console.error('Error creating session:', error);
      }
    }
    
    return false;
  };

  const logout = async () => {
    try {
      await sessionService.deactivateSession();
      setIsAuthenticated(false);
      setUsername('');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      username,
      loading
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