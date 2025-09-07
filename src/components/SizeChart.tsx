'use client';

import React, { useState } from 'react';
import { X, Ruler, Shirt, Footprints, Watch } from 'lucide-react';

interface SizeChartProps {
  category: string;
  isOpen: boolean;
  onClose: () => void;
  customSizeChart?: {
    title: string;
    measurements: Array<{
      size: string;
      [key: string]: string | number;
    }>;
    instructions: string;
  };
  useCustomSizeChart?: boolean;
}

interface SizeData {
  size: string;
  chest?: number;
  waist?: number;
  length?: number;
  shoulder?: number;
  sleeve?: number;
  footLength?: number;
  footWidth?: number;
  wrist?: number;
  bandWidth?: number;
}

const sizeCharts: Record<string, SizeData[]> = {
  'T-Shirts': [
    { size: 'XS', chest: 86, length: 66, shoulder: 42 },
    { size: 'S', chest: 91, length: 68, shoulder: 44 },
    { size: 'M', chest: 96, length: 70, shoulder: 46 },
    { size: 'L', chest: 101, length: 72, shoulder: 48 },
    { size: 'XL', chest: 106, length: 74, shoulder: 50 },
    { size: 'XXL', chest: 111, length: 76, shoulder: 52 },
    { size: 'XXXL', chest: 116, length: 78, shoulder: 54 }
  ],
  'Hoodies': [
    { size: 'XS', chest: 88, length: 68, shoulder: 43, sleeve: 60 },
    { size: 'S', chest: 93, length: 70, shoulder: 45, sleeve: 62 },
    { size: 'M', chest: 98, length: 72, shoulder: 47, sleeve: 64 },
    { size: 'L', chest: 103, length: 74, shoulder: 49, sleeve: 66 },
    { size: 'XL', chest: 108, length: 76, shoulder: 51, sleeve: 68 },
    { size: 'XXL', chest: 113, length: 78, shoulder: 53, sleeve: 70 },
    { size: 'XXXL', chest: 118, length: 80, shoulder: 55, sleeve: 72 }
  ],
  'Pants': [
    { size: 'XS', waist: 71, length: 102 },
    { size: 'S', waist: 76, length: 104 },
    { size: 'M', waist: 81, length: 106 },
    { size: 'L', waist: 86, length: 108 },
    { size: 'XL', waist: 91, length: 110 },
    { size: 'XXL', waist: 96, length: 112 },
    { size: 'XXXL', waist: 101, length: 114 }
  ],
  'Shoes': [
    { size: '36', footLength: 23, footWidth: 8.5 },
    { size: '37', footLength: 23.5, footWidth: 8.7 },
    { size: '38', footLength: 24, footWidth: 8.9 },
    { size: '39', footLength: 24.5, footWidth: 9.1 },
    { size: '40', footLength: 25, footWidth: 9.3 },
    { size: '41', footLength: 25.5, footWidth: 9.5 },
    { size: '42', footLength: 26, footWidth: 9.7 },
    { size: '43', footLength: 26.5, footWidth: 9.9 },
    { size: '44', footLength: 27, footWidth: 10.1 },
    { size: '45', footLength: 27.5, footWidth: 10.3 }
  ],
  'Watches': [
    { size: 'S', wrist: 15, bandWidth: 20 },
    { size: 'M', wrist: 16, bandWidth: 22 },
    { size: 'L', wrist: 17, bandWidth: 24 },
    { size: 'XL', wrist: 18, bandWidth: 26 }
  ]
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 't-shirts':
    case 'hoodies':
      return <Shirt className="w-5 h-5" />;
    case 'pants':
      return <Shirt className="w-5 h-5" />;
    case 'shoes':
      return <Footprints className="w-5 h-5" />;
    case 'watches':
      return <Watch className="w-5 h-5" />;
    default:
      return <Ruler className="w-5 h-5" />;
  }
};

const getMeasurementLabels = (category: string) => {
  switch (category.toLowerCase()) {
    case 't-shirts':
      return ['Chest (cm)', 'Length (cm)', 'Shoulder (cm)'];
    case 'hoodies':
      return ['Chest (cm)', 'Length (cm)', 'Shoulder (cm)', 'Sleeve (cm)'];
    case 'pants':
      return ['Waist (cm)', 'Length (cm)'];
    case 'shoes':
      return ['Foot Length (cm)', 'Foot Width (cm)'];
    case 'watches':
      return ['Wrist (cm)', 'Band Width (cm)'];
    default:
      return ['Size'];
  }
};

const getMeasurementKeys = (category: string) => {
  switch (category.toLowerCase()) {
    case 't-shirts':
      return ['chest', 'length', 'shoulder'];
    case 'hoodies':
      return ['chest', 'length', 'shoulder', 'sleeve'];
    case 'pants':
      return ['waist', 'length'];
    case 'shoes':
      return ['footLength', 'footWidth'];
    case 'watches':
      return ['wrist', 'bandWidth'];
    default:
      return ['size'];
  }
};

export default function SizeChart({ category, isOpen, onClose, customSizeChart, useCustomSizeChart }: SizeChartProps) {
  const [selectedCategory, setSelectedCategory] = useState(category);
  
  if (!isOpen) return null;

  // Use custom size chart if available and enabled
  const isUsingCustom = useCustomSizeChart && customSizeChart && customSizeChart.measurements && customSizeChart.measurements.length > 0;
  
  const chartData = isUsingCustom 
    ? customSizeChart.measurements 
    : (sizeCharts[selectedCategory] || sizeCharts['T-Shirts']);
  
  const measurementLabels = isUsingCustom
    ? Object.keys(customSizeChart.measurements[0] || {}).filter(key => key !== 'size').map(key => `${key.charAt(0).toUpperCase() + key.slice(1)} (cm)`)
    : getMeasurementLabels(selectedCategory);
  
  const measurementKeys = isUsingCustom
    ? Object.keys(customSizeChart.measurements[0] || {}).filter(key => key !== 'size')
    : getMeasurementKeys(selectedCategory);

  // Safety check for custom size chart data
  if (isUsingCustom && (!customSizeChart.measurements || customSizeChart.measurements.length === 0)) {
    console.warn('Custom size chart has no measurements, falling back to default');
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Custom Size Chart</h3>
            <p className="text-gray-600 mb-4">This product doesn't have a custom size chart configured yet.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getCategoryIcon(selectedCategory)}
            <h2 className="text-2xl font-black">
              {isUsingCustom ? customSizeChart.title : 'Size Chart'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Category Selector - Only show if not using custom chart */}
        {!isUsingCustom && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {Object.keys(sizeCharts).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Chart Table */}
        <div className="p-6 overflow-x-auto">
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Size</th>
                  {measurementLabels.map((label, index) => (
                    <th key={index} className="px-4 py-3 text-center font-semibold text-gray-700">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{row.size}</td>
                    {measurementKeys.map((key, keyIndex) => (
                      <td key={keyIndex} className="px-4 py-3 text-center text-gray-700">
                        {row[key as keyof SizeData] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-start gap-3">
            <Ruler className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How to Measure</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {isUsingCustom 
                  ? customSizeChart.instructions
                  : (selectedCategory.toLowerCase() === 't-shirts' && 
                      "Chest: Measure around the fullest part of your chest. Length: Measure from shoulder to hem. Shoulder: Measure from shoulder seam to shoulder seam.")
                  || (selectedCategory.toLowerCase() === 'hoodies' && 
                      "Chest: Measure around the fullest part of your chest. Length: Measure from shoulder to hem. Shoulder: Measure from shoulder seam to shoulder seam. Sleeve: Measure from shoulder to cuff.")
                  || (selectedCategory.toLowerCase() === 'pants' && 
                      "Waist: Measure around your natural waistline. Length: Measure from waist to ankle.")
                  || (selectedCategory.toLowerCase() === 'shoes' && 
                      "Foot Length: Measure from heel to longest toe. Foot Width: Measure across the widest part of your foot.")
                  || (selectedCategory.toLowerCase() === 'watches' && 
                      "Wrist: Measure around your wrist. Band Width: Measure the width of the watch band.")
                  || "Please refer to the measurements above to find your perfect size. If you're between sizes, we recommend sizing up."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
