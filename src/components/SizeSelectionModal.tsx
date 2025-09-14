'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface SizeSelectionModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (size: string, color: string, quantity: number) => void;
  actionType?: 'addToCart';
}

export default function SizeSelectionModal({ product, isOpen, onClose, onBuy, actionType = 'addToCart' }: SizeSelectionModalProps) {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const availableSizes = product.sizes || ['S', 'M', 'L', 'XL'];
  const availableColors = product.colors || ['Black', 'White'];
  
  // Check if a size is available (has stock)
  const isSizeAvailable = (size: string) => {
    if (!product.stock) return true; // If no stock data, assume available
    return Object.keys(product.stock[size] || {}).some(color => 
      (product.stock[size][color] || 0) > 0
    );
  };
  
  // Get available sizes only
  const availableSizesWithStock = availableSizes.filter(size => isSizeAvailable(size));
  
  // Set default values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (availableSizesWithStock.length > 0 && !selectedSize) {
        setSelectedSize(availableSizesWithStock[0]);
      }
      if (availableColors.length > 0 && !selectedColor) {
        setSelectedColor(availableColors[0]);
      }
    }
  }, [isOpen, availableSizesWithStock, availableColors, selectedSize, selectedColor]);

  if (!isOpen) return null;

  // Check if selected size/color combination is available
  const hasStockForSelection = () => {
    if (!product.stock || !selectedSize || !selectedColor) return true; // Assume available if no stock data
    const stock = product.stock[selectedSize]?.[selectedColor] || 0;
    return stock > 0; // Available if stock > 0, not available if stock = 0
  };

  const handleAction = () => {
    if (selectedSize && selectedColor && hasStockForSelection()) {
      // Add to cart ONLY - no redirect
      addToCart(product, selectedSize, selectedColor, 1);
      // Close modal
      onClose();
      // Show success message (optional)
      console.log('Product added to cart successfully!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-sm w-full shadow-2xl border border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Select Options</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex space-x-4 mb-6 p-3 bg-gray-800/50 rounded-lg">
            <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">{product.name}</h3>
              <p className="text-gray-400 text-xs">{product.category}</p>
              <p className="text-white font-bold text-sm">{product.price} DA</p>
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-3">
              Select Size *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableSizes.map((size) => {
                const isAvailable = isSizeAvailable(size);
                const isSelected = selectedSize === size;
                
                return (
                  <button
                    key={size}
                    onClick={() => isAvailable && setSelectedSize(size)}
                    disabled={!isAvailable}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 relative ${
                      !isAvailable
                        ? 'bg-red-900/50 text-red-400 cursor-not-allowed border border-red-500 opacity-75'
                        : isSelected
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    {size}
                    {!isAvailable && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">×</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-white text-sm font-semibold mb-3">
              Select Color *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    selectedColor === color
                      ? 'bg-white text-black'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Status */}
          {selectedSize && selectedColor && (
            <div className="mb-4">
              {hasStockForSelection() ? (
                <div className="flex items-center space-x-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Available</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Not Available</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 border border-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              disabled={!selectedSize || !selectedColor || !hasStockForSelection()}
              className="flex-1 bg-white text-black py-3 px-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              <ShoppingCart size={16} />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}