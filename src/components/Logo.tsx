'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <Link href="/" className={`flex items-center space-x-3 hover:opacity-80 transition-opacity ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <Image
          src="/Logo Obsidian Wear sur fond noir.png"
          alt="OBSIDIAN WEAR"
          width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
          height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
          className={`${sizeClasses[size]} object-contain`}
          priority
        />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold font-poppins text-white tracking-wider`}>
          OBSIDIAN WEAR
        </span>
      )}
    </Link>
  );
}
