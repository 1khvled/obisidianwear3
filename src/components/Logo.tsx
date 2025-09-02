'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-3">
      {/* Placeholder for your logo - replace with your actual logo */}
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
        <span className="text-black font-bold text-2xl">O</span>
      </div>
      {/* 
      Uncomment and replace with your actual logo:
      <Image
        src="/your-logo.png"
        alt="OBSIDIAN WEAR"
        width={48}
        height={48}
        className="w-12 h-12"
      />
      */}
      <span className="text-2xl font-bold font-poppins text-white">OBSIDIAN WEAR</span>
    </Link>
  );
}
