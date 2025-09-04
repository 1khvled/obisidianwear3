'use client';

import { useEffect, useRef, useState } from 'react';

interface RealtimeMessage {
  type: string;
  data?: any;
  timestamp: number;
}

export function useRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/realtime');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('🔄 Real-time connection established');
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const message: RealtimeMessage = JSON.parse(event.data);
        
        if (message.type === 'connected') {
          console.log('✅ Real-time connected');
        } else if (message.type === 'ping') {
          // Keep connection alive
        } else {
          // Handle other message types
          console.log('📡 Real-time message:', message);
        }
      } catch (error) {
        console.error('Error parsing real-time message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Real-time connection error:', error);
      setIsConnected(false);
      
      // Attempt to reconnect after 5 seconds
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, 5000);
      }
    };
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    connectionCount,
    connect,
    disconnect,
  };
}
