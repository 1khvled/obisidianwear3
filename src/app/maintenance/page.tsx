'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useOptimizedMaintenance } from '../../hooks/useOptimizedMaintenance';

export default function MaintenancePage() {
  const { status, loading, error } = useOptimizedMaintenance();
  const [dropDate, setDropDate] = useState('');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Load drop date from API
    const loadDropDate = async () => {
      try {
        const response = await fetch('/api/maintenance');
        const data = await response.json();
        
        if (data?.drop_date) {
          setDropDate(data.drop_date);
        } else {
          // Default to 30 days from now
          const today = new Date();
          const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
          const defaultDate = futureDate.toISOString();
          setDropDate(defaultDate);
        }
      } catch (error) {
        console.error('Error loading drop date:', error);
        // Set default on error
        const today = new Date();
        const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        const defaultDate = futureDate.toISOString();
        setDropDate(defaultDate);
      }
    };

    loadDropDate();
  }, []);

  useEffect(() => {
    if (!dropDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(dropDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dropDate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading maintenance status...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/Logo Obsidian Wear sur fond noir.png"
            alt="OBSIDIAN WEAR"
            width={200}
            height={200}
            priority
            className="w-32 sm:w-48 h-auto"
          />
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold text-white font-poppins tracking-wider">
            COMING SOON
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 font-light">
            New Drop {formatDate(dropDate)}
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-4 sm:gap-8 max-w-lg mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800">
            <div className="text-2xl sm:text-4xl font-bold text-white">{timeLeft.days}</div>
            <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Days</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800">
            <div className="text-2xl sm:text-4xl font-bold text-white">{timeLeft.hours}</div>
            <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Hours</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800">
            <div className="text-2xl sm:text-4xl font-bold text-white">{timeLeft.minutes}</div>
            <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Minutes</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800">
            <div className="text-2xl sm:text-4xl font-bold text-white">{timeLeft.seconds}</div>
            <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Seconds</div>
          </div>
        </div>

        

        {/* Description */}
        <div className="space-y-4">
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            We're preparing something extraordinary. 
            <br />
            More than clothing, an attitude.
          </p>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6">
          <a
            href="https://instagram.com/obsidianwear_dz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a
            href="https://tiktok.com/@obsidianwear.dz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </a>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-gray-800">
          <p className="text-gray-600 text-sm">
            © 2025 OBSIDIAN WEAR. All rights reserved.
          </p>
        </div>
             </div>
     </div>
   );
}
