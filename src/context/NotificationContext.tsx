'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: Notification['type']) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const MAX_NOTIFICATIONS = 5; // Limit to prevent spam

  const addNotification = (message: string, type: Notification['type']) => {
    // Check if this exact message already exists
    setNotifications(prev => {
      const exists = prev.some(n => n.message === message && n.type === type);
      if (exists) return prev; // Don't add duplicate notifications
      
      const newNotification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message,
        type,
        timestamp: new Date(),
      };
      
      // Keep only the latest MAX_NOTIFICATIONS
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(current => current.filter(n => n.id !== newNotification.id));
      }, 5000);
      
      return updated;
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};