'use client';

import React, { useState } from 'react';
import { X, Ruler, Shirt, Footprints, Watch } from 'lucide-react';
import { sizeChartService, SizeChartData, SizeMeasurement } from '@/lib/sizeChartService';

interface SizeChartProps {
  category: string;
  isOpen: boolean;
  onClose: () => void;
  customSizeChart?: SizeChartData;
  useCustomSizeChart?: boolean;
  isAdmin?: boolean;
  onSave?: (customSizeChart: SizeChartData) => void;
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
      return ['chest', 'length', 'shoulder'];
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
      return ['Chest (cm)', 'Length (cm)', 'Shoulder (cm)'];
  }
};

export default function SizeChart({ 
  category, 
  isOpen, 
  onClose, 
  customSizeChart, 
  useCustomSizeChart,
  isAdmin = false,
  onSave
}: SizeChartProps) {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [editingData, setEditingData] = useState<SizeData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Initialize editing data
  React.useEffect(() => {
    if (isAdmin && chartData.length > 0) {
      setEditingData([...chartData]);
    }
  }, [isAdmin, chartData]);

  if (!isOpen) return null;

  const handleSizeChange = (index: number, field: string, value: string | number) => {
    if (!isAdmin) return;
    const newData = [...editingData];
    newData[index] = {
      ...newData[index],
      [field]: field === 'size' ? value : parseFloat(value as string) || 0
    };
    setEditingData(newData);
  };

  const handleSave = async () => {
    if (!isAdmin || !onSave) return;
    setSaving(true);
    try {
      const newCustomSizeChart: SizeChartData = {
        title: customSizeChart?.title || `${selectedCategory} Size Chart`,
        instructions: customSizeChart?.instructions || `Instructions for measuring ${selectedCategory.toLowerCase()}`,
        measurements: editingData as SizeMeasurement[],
        category: selectedCategory
      };
      await onSave(newCustomSizeChart);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving size chart:', error);
    } finally {
      setSaving(false);
    }
  };

  const displayData = isEditing ? editingData : (chartData as SizeData[]);

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
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Ruler className="w-6 h-6 text-gray-700 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Size Guide</h2>
                <p className="text-gray-600 text-sm">
                  {isUsingCustom ? 'Custom size chart for this product' : 'Standard size chart'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Instructions */}
          {customSizeChart?.instructions && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">{customSizeChart.instructions}</p>
            </div>
          )}

          {/* Size Chart Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                    Size
                  </th>
                  {measurementLabels.map((label, index) => (
                    <th 
                      key={index} 
                      className="text-center py-3 px-4 font-semibold text-gray-900 bg-gray-50"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayData.map((size, index) => (
                  <tr 
                    key={index} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {isAdmin && isEditing ? (
                        <input
                          type="text"
                          value={size.size}
                          onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-black"
                        />
                      ) : (
                        size.size
                      )}
                    </td>
                    {measurementKeys.map((key) => (
                      <td 
                        key={key} 
                        className="text-center py-3 px-4 text-gray-700"
                      >
                        {isAdmin && isEditing ? (
                          <input
                            type="number"
                            value={(size as any)[key] || ''}
                            onChange={(e) => handleSizeChange(index, key, e.target.value)}
                            className="w-full px-2 py-1 bg-transparent border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-black text-center"
                            step="0.1"
                          />
                        ) : (
                          (size as any)[key] || '--'
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm">
                {isUsingCustom 
                  ? 'This product has a custom size chart tailored specifically for it.'
                  : 'This is the standard size chart for this product category.'
                }
              </p>
              <div className="flex space-x-3">
                {isAdmin && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Edit Chart
                  </button>
                )}
                {isAdmin && isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}