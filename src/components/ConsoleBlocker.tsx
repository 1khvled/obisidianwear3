'use client';

import { useEffect } from 'react';

export default function ConsoleBlocker() {
  useEffect(() => {
    // Disable F12 key
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+A (Select All) - optional, can be removed if you want to allow this
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        return false;
      }
    };

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    // Disable console methods
    const disableConsole = () => {
      const noop = () => {};
      const methods = ['log', 'debug', 'info', 'warn', 'error', 'trace', 'dir', 'group', 'groupEnd', 'time', 'timeEnd', 'profile', 'profileEnd', 'count', 'clear', 'assert', 'table', 'dirxml', 'groupCollapsed'];
      
      methods.forEach(method => {
        if (console[method as keyof Console]) {
          (console as any)[method] = noop;
        }
      });
    };

    // Disable console
    disableConsole();

    // Override console.log to show a message
    console.log = () => {
      // Do nothing or show a custom message
    };

    // Disable developer tools detection
    let devtools = { open: false, orientation: null };
    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          // Redirect to home page or show warning
          window.location.href = '/';
        }
      }
    }, 500);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return null; // This component doesn't render anything
}
