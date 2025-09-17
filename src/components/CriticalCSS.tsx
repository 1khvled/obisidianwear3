'use client';

import { useEffect } from 'react';

export default function CriticalCSS() {
  useEffect(() => {
    // Inject critical CSS to prevent layout shifts
    const criticalCSS = `
      /* Critical CSS for layout stability */
      * {
        box-sizing: border-box;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow-x: hidden;
      }
      
      .min-h-screen {
        min-height: 100vh;
      }
      
      /* Prevent layout shifts for images */
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
      
      /* Skeleton loading states */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      
      /* Smooth transitions */
      * {
        transition: opacity 0.2s ease-in-out;
      }
      
      /* Prevent flash of unstyled content */
      .bg-black {
        background-color: #000000 !important;
      }
      
      .text-white {
        color: #ffffff !important;
      }
      
      /* Grid layout stability */
      .grid {
        display: grid;
      }
      
      .grid-cols-1 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
      
      @media (min-width: 640px) {
        .sm\\:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      
      @media (min-width: 1024px) {
        .lg\\:grid-cols-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      
      @media (min-width: 1280px) {
        .xl\\:grid-cols-4 {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }
      
      /* Aspect ratio containers */
      .aspect-square {
        aspect-ratio: 1 / 1;
      }
      
      /* Flexbox utilities */
      .flex {
        display: flex;
      }
      
      .items-center {
        align-items: center;
      }
      
      .justify-center {
        justify-content: center;
      }
      
      .justify-between {
        justify-content: space-between;
      }
      
      /* Spacing utilities */
      .gap-6 {
        gap: 1.5rem;
      }
      
      .p-4 {
        padding: 1rem;
      }
      
      .px-4 {
        padding-left: 1rem;
        padding-right: 1rem;
      }
      
      .py-8 {
        padding-top: 2rem;
        padding-bottom: 2rem;
      }
      
      .mb-8 {
        margin-bottom: 2rem;
      }
      
      /* Border radius */
      .rounded-lg {
        border-radius: 0.5rem;
      }
      
      /* Overflow */
      .overflow-hidden {
        overflow: hidden;
      }
      
      /* Position utilities */
      .relative {
        position: relative;
      }
      
      .absolute {
        position: absolute;
      }
      
      /* Z-index */
      .z-50 {
        z-index: 50;
      }
      
      /* Transform utilities */
      .transform {
        transform: translateZ(0);
      }
      
      /* Transition utilities */
      .transition-all {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
      }
      
      .duration-300 {
        transition-duration: 300ms;
      }
      
      /* Hover effects */
      .hover\\:scale-105:hover {
        transform: scale(1.05);
      }
      
      .hover\\:border-purple-500:hover {
        border-color: #8b5cf6;
      }
      
      /* Focus states */
      .focus\\:outline-none:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }
      
      .focus\\:ring-2:focus {
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
      }
      
      /* Animation utilities */
      .animate-spin {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
      }
      
      @keyframes fadeInUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;

    // Create style element
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    
    // Insert at the beginning of head
    document.head.insertBefore(style, document.head.firstChild);
    
    // Cleanup function
    return () => {
      const criticalStyle = document.querySelector('style[data-critical="true"]');
      if (criticalStyle) {
        criticalStyle.remove();
      }
    };
  }, []);

  return null;
}
