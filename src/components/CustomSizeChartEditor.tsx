'use client';

import React, { useState, useEffect } from 'react';
import { Save, Ruler } from 'lucide-react';
import { sizeChartService, SizeChartData, SizeMeasurement } from '@/lib/sizeChartService';

interface CustomSizeChartEditorProps {
  product: any;
  onSave: (customSizeChart: any) => void;
  onCancel: () => void;
}

export default function CustomSizeChartEditor({ product, onSave, onCancel }: CustomSizeChartEditorProps) {
  const [title, setTitle] = useState(product.customSizeChart?.title || `${product.name} Size Chart`);
  const [instructions, setInstructions] = useState(product.customSizeChart?.instructions || 'Please refer to the measurements below to find your perfect size.');
  const [measurements, setMeasurements] = useState<SizeMeasurement[]>(
    product.customSizeChart?.measurements || [
      { size: 'S', chest: 0, length: 0 },
      { size: 'M', chest: 0, length: 0 },
      { size: 'L', chest: 0, length: 0 }
    ]
  );
  const [saving, setSaving] = useState(false);

  // Get measurement keys and labels based on product category
  const category = product.sizeChartCategory || product.category || 't-shirts';
  const currentCategory = sizeChartService.getCategory(category);
  const measurementKeys = currentCategory?.measurementKeys || ['chest', 'length', 'shoulder'];
  const measurementLabels = currentCategory?.measurementLabels || ['Chest (cm)', 'Length (cm)', 'Shoulder (cm)'];

  // Initialize with default data if no custom data exists
  useEffect(() => {
    if (!product.customSizeChart?.measurements || product.customSizeChart.measurements.length === 0) {
      const defaultChart = sizeChartService.getDefaultChart(category);
      if (defaultChart) {
        setMeasurements(defaultChart.measurements);
        setTitle(defaultChart.title);
        setInstructions(defaultChart.instructions);
      }
    }
  }, [category, product.customSizeChart]);

  const updateSize = (index: number, field: string, value: string | number) => {
    const updated = [...measurements];
    updated[index][field] = field === 'size' ? value : parseFloat(value as string) || 0;
    setMeasurements(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const customSizeChart = {
        title: title.trim(),
        instructions: instructions.trim(),
        measurements: measurements
      };
      onSave(customSizeChart);
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
              onClick={onCancel}
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
                {measurements.map((size, index) => (
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
                        onChange={(e) => updateSize(index, 'size', e.target.value)}
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
                          onChange={(e) => updateSize(index, key, e.target.value)}
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