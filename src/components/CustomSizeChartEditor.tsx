'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Ruler } from 'lucide-react';

interface CustomSizeChartEditorProps {
  product: any;
  onSave: (customSizeChart: any) => void;
  onCancel: () => void;
}

interface SizeMeasurement {
  size: string;
  [key: string]: string | number;
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
  const [measurementKeys, setMeasurementKeys] = useState<string[]>(
    product.customSizeChart?.measurements?.length > 0 
      ? Object.keys(product.customSizeChart.measurements[0]).filter(key => key !== 'size')
      : ['chest', 'length']
  );

  const addSize = () => {
    const newSize: SizeMeasurement = { size: '' };
    measurementKeys.forEach(key => {
      newSize[key] = 0;
    });
    setMeasurements([...measurements, newSize]);
  };

  const removeSize = (index: number) => {
    setMeasurements(measurements.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: string, value: string | number) => {
    const updated = [...measurements];
    updated[index][field] = value;
    setMeasurements(updated);
  };

  const [showAddMeasurementModal, setShowAddMeasurementModal] = useState(false);
  const [newMeasurementName, setNewMeasurementName] = useState('');

  const addMeasurementKey = () => {
    if (newMeasurementName.trim() && !measurementKeys.includes(newMeasurementName.trim())) {
      const key = newMeasurementName.trim();
      setMeasurementKeys([...measurementKeys, key]);
      // Add the new key to all existing measurements
      const updated = measurements.map(measurement => ({
        ...measurement,
        [key]: 0
      }));
      setMeasurements(updated);
      setNewMeasurementName('');
      setShowAddMeasurementModal(false);
    }
  };

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const removeMeasurementKey = (key: string) => {
    if (measurementKeys.length <= 1) {
      setErrorMessage('You must have at least one measurement type.');
      setShowErrorModal(true);
      return;
    }
    setMeasurementKeys(measurementKeys.filter(k => k !== key));
    // Remove the key from all measurements
    const updated = measurements.map(measurement => {
      const { [key]: removed, ...rest } = measurement;
      return rest;
    });
    setMeasurements(updated);
  };

  const handleSave = () => {
    if (measurements.some(m => !m.size)) {
      setErrorMessage('All sizes must have a size name.');
      setShowErrorModal(true);
      return;
    }
    
    const customSizeChart = {
      title,
      instructions,
      measurements: measurements.filter(m => m.size.trim() !== '')
    };
    
    onSave(customSizeChart);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Ruler className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">Custom Size Chart Editor</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-white font-medium mb-2">Chart Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              placeholder="Enter size chart title"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-white font-medium mb-2">Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              placeholder="Enter measurement instructions"
            />
          </div>

          {/* Measurement Types */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-white font-medium">Measurement Types</label>
              <button
                onClick={() => setShowAddMeasurementModal(true)}
                className="flex items-center gap-2 px-3 py-1 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Type
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {measurementKeys.map((key) => (
                <div key={key} className="flex items-center bg-gray-800 rounded-lg px-3 py-1">
                  <span className="text-white text-sm capitalize">{key}</span>
                  <button
                    onClick={() => removeMeasurementKey(key)}
                    className="ml-2 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Size Measurements Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-white font-medium">Size Measurements</label>
              <button
                onClick={addSize}
                className="flex items-center gap-2 px-3 py-1 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Size
              </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-medium">Size</th>
                    {measurementKeys.map((key) => (
                      <th key={key} className="px-4 py-3 text-center text-white font-medium capitalize">
                        {key} (cm)
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-white font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((measurement, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={measurement.size}
                          onChange={(e) => updateSize(index, 'size', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-white"
                          placeholder="Size"
                        />
                      </td>
                      {measurementKeys.map((key) => (
                        <td key={key} className="px-4 py-3">
                          <input
                            type="number"
                            value={measurement[key] || 0}
                            onChange={(e) => updateSize(index, key, parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-white text-center"
                            placeholder="0"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeSize(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-white font-medium mb-3">Preview</label>
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">{title}</h4>
              <p className="text-gray-300 text-sm mb-4">{instructions}</p>
              <div className="bg-gray-700 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-left text-white">Size</th>
                      {measurementKeys.map((key) => (
                        <th key={key} className="px-3 py-2 text-center text-white capitalize">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.filter(m => m.size.trim() !== '').map((measurement, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-600'}>
                        <td className="px-3 py-2 text-white font-medium">{measurement.size}</td>
                        {measurementKeys.map((key) => (
                          <td key={key} className="px-3 py-2 text-center text-gray-300">
                            {measurement[key] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save Size Chart
          </button>
        </div>
      </div>

      {/* Add Measurement Type Modal */}
      {showAddMeasurementModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">Add Measurement Type</h3>
              <button
                onClick={() => {
                  setShowAddMeasurementModal(false);
                  setNewMeasurementName('');
                }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Measurement Name</label>
                <input
                  type="text"
                  value={newMeasurementName}
                  onChange={(e) => setNewMeasurementName(e.target.value)}
                  placeholder="e.g., waist, sleeve, length"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addMeasurementKey();
                    } else if (e.key === 'Escape') {
                      setShowAddMeasurementModal(false);
                      setNewMeasurementName('');
                    }
                  }}
                />
                <p className="text-gray-400 text-sm mt-1">
                  Enter a measurement type like "chest", "waist", "sleeve", etc.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddMeasurementModal(false);
                    setNewMeasurementName('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addMeasurementKey}
                  disabled={!newMeasurementName.trim() || measurementKeys.includes(newMeasurementName.trim())}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Type
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">Error</h3>
              <button
                onClick={() => setShowErrorModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-300 mb-4">{errorMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
