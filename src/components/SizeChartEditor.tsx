'use client';

import React, { useState, useEffect } from 'react';
import { Save, Ruler } from 'lucide-react';
import { sizeChartService, SizeChartData, SizeMeasurement } from '@/lib/sizeChartService';

interface SizeChartEditorProps {
  category: string;
  productId?: string;
  productType?: 'regular' | 'made-to-order';
  existingCustomSizeChart?: SizeChartData;
  onSave: (category: string, customSizeChart: SizeChartData) => void;
  onClose: () => void;
}

export default function SizeChartEditor({ 
  category, 
  productId, 
  productType = 'regular', 
  existingCustomSizeChart, 
  onSave, 
  onClose 
}: SizeChartEditorProps) {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [sizeData, setSizeData] = useState<SizeMeasurement[]>([]);
  const [saving, setSaving] = useState(false);

  // Get available categories
  const availableCategories = sizeChartService.getCategories();
  const currentCategory = sizeChartService.getCategory(selectedCategory);
  const measurementKeys = currentCategory?.measurementKeys || [];
  const measurementLabels = currentCategory?.measurementLabels || [];

  // Initialize data when component mounts or category changes
  useEffect(() => {
    // If we have existing custom size chart data, use it
    if (existingCustomSizeChart?.measurements && existingCustomSizeChart.measurements.length > 0) {
      setSizeData(existingCustomSizeChart.measurements);
      setTitle(existingCustomSizeChart.title || `${selectedCategory} Size Chart`);
      setInstructions(existingCustomSizeChart.instructions || `Instructions for measuring ${selectedCategory.toLowerCase()}`);
    } else {
      // Otherwise use default data for the category
      const defaultChart = sizeChartService.getDefaultChart(selectedCategory);
      if (defaultChart) {
        setSizeData(defaultChart.measurements);
        setTitle(defaultChart.title);
        setInstructions(defaultChart.instructions);
      }
    }
  }, [selectedCategory, existingCustomSizeChart]);

  const handleSizeChange = (index: number, field: string, value: string | number) => {
    const newData = [...sizeData];
    newData[index] = {
      ...newData[index],
      [field]: field === 'size' ? value : parseFloat(value as string) || 0
    };
    setSizeData(newData);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const customSizeChart: SizeChartData = {
        title: title.trim(),
        instructions: instructions.trim(),
        measurements: sizeData,
        category: selectedCategory
      };
      onSave(selectedCategory, customSizeChart);
    } catch (error) {
      console.error('Error saving size chart:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header - EXACT same as product page */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Ruler className="w-6 h-6 text-gray-700 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Size Guide</h2>
                <p className="text-gray-600 text-sm">
                  Custom size chart for this product
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

          {/* Instructions Link - EXACT same as product page */}
          {instructions && (
            <div className="mb-6">
              <button className="px-4 py-2 bg-blue-50 text-blue-800 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                {instructions}
              </button>
            </div>
          )}

          {/* Size Chart Table - EXACT same as product page but editable */}
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
                {sizeData.map((size, index) => (
                  <tr 
                    key={index} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      <input
                        type="text"
                        value={size.size}
                        onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-black"
                      />
                    </td>
                    {measurementKeys.map((key) => (
                      <td 
                        key={key} 
                        className="text-center py-3 px-4 text-gray-700"
                      >
                        <input
                          type="number"
                          value={size[key] || ''}
                          onChange={(e) => handleSizeChange(index, key, e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-black text-center"
                          step="0.1"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer - EXACT same as product page but with Save button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm">
                This product has a custom size chart tailored specifically for it.
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Chart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}