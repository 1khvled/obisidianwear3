'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

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

interface SizeChartEditorProps {
  category: string;
  productId?: string;
  productType?: 'regular' | 'made-to-order';
  existingCustomSizeChart?: any;
  onSave: (category: string, customSizeChart: any) => void;
  onClose: () => void;
}

const defaultSizeCharts: Record<string, SizeData[]> = {
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


export default function SizeChartEditor({ category, productId, productType = 'regular', existingCustomSizeChart, onSave, onClose }: SizeChartEditorProps) {
  console.log('🔧 SizeChartEditor: Component props:', {
    category,
    productId,
    productType,
    existingCustomSizeChart,
    hasMeasurements: existingCustomSizeChart?.measurements?.length > 0
  });

  const [sizeData, setSizeData] = useState<SizeData[]>(() => {
    if (existingCustomSizeChart?.measurements && existingCustomSizeChart.measurements.length > 0) {
      console.log('🔧 SizeChartEditor: Initial state - loading existing custom size chart data:', existingCustomSizeChart);
      return existingCustomSizeChart.measurements;
    }
    console.log('🔧 SizeChartEditor: Initial state - loading default data for category:', category);
    const defaultData = defaultSizeCharts[category] || [];
    console.log('🔧 SizeChartEditor: Initial state - default data:', defaultData);
    return defaultData;
  });
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [title, setTitle] = useState(() => {
    if (existingCustomSizeChart?.title) {
      return existingCustomSizeChart.title;
    }
    return `${category} Size Chart`;
  });
  const [instructions, setInstructions] = useState(() => {
    if (existingCustomSizeChart?.instructions) {
      return existingCustomSizeChart.instructions;
    }
    return `Instructions for measuring ${category.toLowerCase()}`;
  });
  const [saving, setSaving] = useState(false);

  const measurementKeys = getMeasurementKeys(selectedCategory);
  const measurementLabels = getMeasurementLabels(selectedCategory);

  // Update data when category prop changes
  useEffect(() => {
    setSelectedCategory(category);
    
    // If we have existing custom size chart data, use it
    if (existingCustomSizeChart?.measurements && existingCustomSizeChart.measurements.length > 0) {
      console.log('🔧 SizeChartEditor: Loading existing custom size chart data:', existingCustomSizeChart);
      setSizeData(existingCustomSizeChart.measurements);
      setTitle(existingCustomSizeChart.title || `${category} Size Chart`);
      setInstructions(existingCustomSizeChart.instructions || `Instructions for measuring ${category.toLowerCase()}`);
    } else {
      // Otherwise use default data
      console.log('🔧 SizeChartEditor: Loading default size chart data for category:', category);
      const defaultData = defaultSizeCharts[category] || [];
      console.log('🔧 SizeChartEditor: Default data:', defaultData);
      setSizeData(defaultData);
      setTitle(`${category} Size Chart`);
      setInstructions(`Instructions for measuring ${category.toLowerCase()}`);
    }
  }, [category, existingCustomSizeChart]);

  const handleCategoryChange = (newCategory: string) => {
    console.log('🔧 SizeChartEditor: Category changed to:', newCategory);
    setSelectedCategory(newCategory);
    const newDefaultData = defaultSizeCharts[newCategory] || [];
    console.log('🔧 SizeChartEditor: New default data for category:', newCategory, newDefaultData);
    setSizeData(newDefaultData);
    setTitle(`${newCategory} Size Chart`);
    setInstructions(`Instructions for measuring ${newCategory.toLowerCase()}`);
  };

  const handleSizeChange = (index: number, field: string, value: string | number) => {
    const newData = [...sizeData];
    newData[index] = {
      ...newData[index],
      [field]: field === 'size' ? value : parseFloat(value as string) || 0
    };
    setSizeData(newData);
  };

  const addSizeRow = () => {
    const newSize: SizeData = { size: '' };
    measurementKeys.forEach(key => {
      newSize[key as keyof SizeData] = 0;
    });
    setSizeData([...sizeData, newSize]);
  };

  const removeSizeRow = (index: number) => {
    const newData = sizeData.filter((_, i) => i !== index);
    setSizeData(newData);
  };

  const handleSave = async () => {
    if (!productId) {
      // If no productId, just call onSave (for new products)
      const customSizeChart = {
        title: title,
        measurements: sizeData,
        instructions: instructions
      };
      
      console.log('🔧 SizeChartEditor: Saving data to state:', {
        category: category,
        customSizeChart: customSizeChart
      });
      
      onSave(category, customSizeChart);
      onClose();
      return;
    }

    setSaving(true);
    
    try {
      const customSizeChart = {
        title: title,
        measurements: sizeData,
        instructions: instructions
      };
      
      console.log('🔧 SizeChartEditor: Saving directly to database:', {
        productId,
        category: category,
        customSizeChart: customSizeChart
      });

      // Save directly to database - use correct endpoint based on product type
      const apiEndpoint = productType === 'made-to-order' 
        ? `/api/made-to-order/${productId}` 
        : `/api/products/${productId}`;
      
      const requestBody = {
        customSizeChart: customSizeChart,
        useCustomSizeChart: true,
        sizeChartCategory: category // Use the original product category, not selectedCategory
      };

      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ SizeChartEditor: Successfully saved to database:', result);

          // Also call onSave to update local state
          onSave(category, customSizeChart);
      onClose();
      
    } catch (error) {
      console.error('❌ SizeChartEditor: Error saving to database:', error);
      alert(`Failed to save size chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">Edit Size Chart</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Category Selector */}
        <div className="p-6 border-b border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Size Chart Editor</h3>
            <p className="text-sm text-gray-600">Edit the size measurements for this product. Changes will be saved when you click "Save Changes".</p>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(defaultSizeCharts).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Title and Instructions */}
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Size Chart Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Instructions for measuring"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Size Chart Editor */}
        <div className="p-6 overflow-x-auto flex-1 overflow-y-auto">
          <div className="space-y-4">
            {sizeData.map((row, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Size"
                  value={row.size}
                  onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded text-sm font-medium"
                />
                {measurementKeys.map((key, keyIndex) => (
                  <input
                    key={keyIndex}
                    type="number"
                    placeholder={measurementLabels[keyIndex]}
                    value={row[key as keyof SizeData] || ''}
                    onChange={(e) => handleSizeChange(index, key, e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => removeSizeRow(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSizeRow}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Size Row
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors font-semibold text-lg ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
