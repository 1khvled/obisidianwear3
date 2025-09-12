'use client';

import { useState } from 'react';
import { X, Ruler, User, Mail, Phone, MapPin, MessageSquare, Truck } from 'lucide-react';
import { MadeToOrderProduct } from '@/types';

interface OrderFormModalProps {
  product: MadeToOrderProduct;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
  wilayaTariffs: any[];
}

export default function OrderFormModal({
  product,
  isOpen,
  onClose,
  onSubmit,
  wilayaTariffs
}: OrderFormModalProps) {
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    wilayaId: '',
    wilayaName: '',
    selectedSize: '',
    selectedColor: '',
    quantity: 1,
    shippingMethod: 'homeDelivery', // Default to home delivery
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSizeChart, setShowSizeChart] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!orderForm.customerName) newErrors.customerName = 'Name is required';
    if (!orderForm.customerEmail) newErrors.customerEmail = 'Email is required';
    if (!orderForm.customerPhone) newErrors.customerPhone = 'Phone is required';
    if (!orderForm.customerAddress) newErrors.customerAddress = 'Address is required';
    if (!orderForm.wilayaId) newErrors.wilayaId = 'Wilaya is required';
    if (!orderForm.selectedSize) newErrors.selectedSize = 'Size is required';
    if (!orderForm.selectedColor) newErrors.selectedColor = 'Color is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Calculate shipping cost
      const selectedWilaya = wilayaTariffs.find(w => w.wilaya_id.toString() === orderForm.wilayaId);
      const shippingCost = selectedWilaya ? selectedWilaya[orderForm.shippingMethod] || 0 : 0;
      const subtotal = product.price * orderForm.quantity;
      const total = subtotal + shippingCost;

      // Prepare order data with correct field names
      const orderData = {
        productId: product.id,
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        customerEmail: orderForm.customerEmail,
        customerAddress: orderForm.customerAddress,
        customerCity: orderForm.wilayaName,
        wilayaId: orderForm.wilayaId,
        wilayaName: orderForm.wilayaName,
        selectedSize: orderForm.selectedSize,
        selectedColor: orderForm.selectedColor,
        quantity: orderForm.quantity,
        unitPrice: product.price,
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        shippingType: orderForm.shippingMethod,
        whatsappContact: orderForm.customerPhone,
        notes: orderForm.notes
      };
      
      onSubmit(orderData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Order - {product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Form Section */}
          <div className="space-y-6">
            <form id="made-to-order-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                  <User size={20} className="mr-2" />
                  Customer Information
                </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  value={orderForm.customerName}
                  onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none focus:border-white ${
                    errors.customerName ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-red-400 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={orderForm.customerEmail}
                  onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none focus:border-white ${
                    errors.customerEmail ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.customerEmail && (
                  <p className="text-red-400 text-sm mt-1">{errors.customerEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Phone *</label>
                <input
                  type="tel"
                  value={orderForm.customerPhone}
                  onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none focus:border-white ${
                    errors.customerPhone ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.customerPhone && (
                  <p className="text-red-400 text-sm mt-1">{errors.customerPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Wilaya *</label>
                <select
                  value={orderForm.wilayaId}
                  onChange={(e) => {
                    const selectedWilaya = wilayaTariffs.find(w => w.wilaya_id.toString() === e.target.value);
                    setOrderForm({ 
                      ...orderForm, 
                      wilayaId: e.target.value,
                      wilayaName: selectedWilaya?.name || ''
                    });
                  }}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none focus:border-white ${
                    errors.wilayaId ? 'border-red-500' : 'border-gray-700'
                  }`}
                >
                  <option value="">Select a wilaya</option>
                  {wilayaTariffs.map((wilaya) => (
                    <option key={wilaya.wilaya_id} value={wilaya.wilaya_id}>
                      {wilaya.name}
                    </option>
                  ))}
                </select>
                {errors.wilayaId && (
                  <p className="text-red-400 text-sm mt-1">{errors.wilayaId}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Complete Address *</label>
              <textarea
                value={orderForm.customerAddress}
                onChange={(e) => setOrderForm({ ...orderForm, customerAddress: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none focus:border-white ${
                  errors.customerAddress ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="Rue, numéro, commune, code postal..."
              />
              {errors.customerAddress && (
                <p className="text-red-400 text-sm mt-1">{errors.customerAddress}</p>
              )}
              </div>
            </div>

            {/* Shipping Method Selection */}
            {orderForm.wilayaId && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                  <Truck size={20} className="mr-2" />
                  Shipping Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setOrderForm({ ...orderForm, shippingMethod: 'stopDeskEcommerce' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      orderForm.shippingMethod === 'stopDeskEcommerce'
                        ? 'border-white bg-white/10 text-white'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-1">Stop Desk</div>
                      <div className="text-sm">
                        {wilayaTariffs.find(w => w.wilaya_id.toString() === orderForm.wilayaId)?.stop_desk_ecommerce || 0} DA
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setOrderForm({ ...orderForm, shippingMethod: 'domicileEcommerce' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      orderForm.shippingMethod === 'domicileEcommerce'
                        ? 'border-white bg-white/10 text-white'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-1">À Domicile</div>
                      <div className="text-sm">
                        {wilayaTariffs.find(w => w.wilaya_id.toString() === orderForm.wilayaId)?.domicile_ecommerce || 0} DA
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Product Customization */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                <Ruler size={20} className="mr-2" />
                Product Customization
              </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Size *</label>
                <input
                  type="text"
                  value={orderForm.selectedSize}
                  onChange={(e) => setOrderForm({ ...orderForm, selectedSize: e.target.value })}
                  placeholder="Enter your size (ex: S, M, L, XL, 42, 44, etc.)"
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white ${
                    errors.selectedSize ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.selectedSize && (
                  <p className="text-red-400 text-sm mt-1">{errors.selectedSize}</p>
                )}
                
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowSizeChart(true)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    <Ruler className="w-4 h-4" />
                    View size guide
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Color *</label>
                <select
                  value={orderForm.selectedColor}
                  onChange={(e) => setOrderForm({ ...orderForm, selectedColor: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none focus:border-white ${
                    errors.selectedColor ? 'border-red-500' : 'border-gray-700'
                  }`}
                >
                  <option value="">Select a color</option>
                  {(product.colors || []).map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                {errors.selectedColor && (
                  <p className="text-red-400 text-sm mt-1">{errors.selectedColor}</p>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-white font-medium mb-2">Quantity *</label>
              <input
                type="number"
                min="1"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Additional Notes</label>
              <textarea
                value={orderForm.notes}
                onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                placeholder="Special instructions, preferences, etc."
              />
              </div>
            </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Order Summary</h2>
            
            {/* Product Info */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={product.image || product.images?.[0] || ''} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{product.description}</p>
                  <div className="text-xl font-bold text-white">{product.price.toFixed(0)} DA</div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-white font-semibold text-lg mb-4">Order Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Size</span>
                  <span className="text-white">{orderForm.selectedSize || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Color</span>
                  <span className="text-white">{orderForm.selectedColor || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity</span>
                  <span className="text-white">{orderForm.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-white">{orderForm.shippingMethod === 'homeDelivery' ? 'Home Delivery' : 'Stop Desk'}</span>
                </div>
              </div>
            </div>

            {/* Order Total */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{(product.price * orderForm.quantity).toFixed(0)} DA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-white">
                    {orderForm.wilayaId && orderForm.shippingMethod 
                      ? `${wilayaTariffs.find(w => w.wilaya_id.toString() === orderForm.wilayaId)?.[orderForm.shippingMethod] || 0} DA`
                      : 'Select wilaya and shipping method'
                    }
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold text-lg">Total</span>
                    <span className="text-white font-bold text-xl">
                      {orderForm.wilayaId && orderForm.shippingMethod 
                        ? `${((product.price * orderForm.quantity) + (wilayaTariffs.find(w => w.wilaya_id.toString() === orderForm.wilayaId)?.[orderForm.shippingMethod] || 0)).toFixed(0)} DA`
                        : `${(product.price * orderForm.quantity).toFixed(0)} DA`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                form="made-to-order-form"
                className="w-full bg-white text-black py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <span>
                  Confirm Order - {
                    orderForm.wilayaId && orderForm.shippingMethod 
                      ? `${((product.price * orderForm.quantity) + (wilayaTariffs.find(w => w.wilaya_id.toString() === orderForm.wilayaId)?.[orderForm.shippingMethod] || 0)).toFixed(0)} DA`
                      : `${(product.price * orderForm.quantity).toFixed(0)} DA`
                  }
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full border border-gray-600 text-gray-300 py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
