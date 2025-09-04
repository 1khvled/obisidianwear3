'use client';

import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="relative">
          <div className="w-full h-48 bg-gray-700"></div>
          <div className="absolute top-2 right-2">
            <div className="w-8 h-8 bg-gray-600 rounded"></div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-700 rounded w-16"></div>
            <div className="h-4 bg-gray-700 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="text-left text-white font-medium py-4 px-6">
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t border-gray-800">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="py-4 px-6">
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
