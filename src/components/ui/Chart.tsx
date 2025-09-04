'use client';

import { useState, useEffect } from 'react';

interface ChartProps {
  data: { label: string; value: number; color?: string }[];
  type?: 'bar' | 'line' | 'doughnut';
  height?: number;
  className?: string;
}

export default function Chart({ data, type = 'bar', height = 200, className = '' }: ChartProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...data.map(d => d.value));

  if (type === 'bar') {
    return (
      <div className={`space-y-2 ${className}`} style={{ height }}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-white font-medium">{item.value.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                    isLoaded ? 'w-full' : 'w-0'
                  }`}
                  style={{
                    width: isLoaded ? `${percentage}%` : '0%',
                    backgroundColor: item.color || '#3b82f6'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (type === 'doughnut') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className={`relative ${className}`} style={{ height, width: height }}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + percentage) * 3.6;
            cumulativePercentage += percentage;

            const radius = 40;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = circumference - (startAngle / 360) * circumference;

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={item.color || '#3b82f6'}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{
                  strokeDashoffset: isLoaded ? strokeDashoffset : circumference
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
