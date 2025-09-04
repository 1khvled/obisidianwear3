'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import NotificationService from '@/services/notificationService';

export const useNotificationService = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    const notificationService = NotificationService.getInstance();
    
    // Subscribe to notifications from the service
    const unsubscribe = notificationService.subscribe((notification) => {
      addNotification(notification.message, notification.type);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [addNotification]);

  return NotificationService.getInstance();
};
