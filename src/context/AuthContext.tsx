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

// Admin credentials - moved to server-side for security
// These are no longer exposed in client-side code

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
        // Clear any invalid session data
        try {
          await sessionService.deactivateSession();
        } catch (clearError) {
          console.error('Error clearing invalid session:', clearError);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up periodic session validation to prevent crashes
    const sessionCheckInterval = setInterval(async () => {
      if (isAuthenticated) {
        try {
          const stillAuthenticated = await sessionService.isAuthenticated();
          if (!stillAuthenticated) {
            setIsAuthenticated(false);
            setUsername('');
          }
        } catch (error) {
          console.error('Session validation error:', error);
          setIsAuthenticated(false);
          setUsername('');
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(sessionCheckInterval);
  }, [isAuthenticated]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Call server-side authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Create session after successful server-side authentication
          const success = await sessionService.createSession(username);
          if (success) {
            setIsAuthenticated(true);
            setUsername(username);
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
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