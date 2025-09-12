'use client';

import { useState } from 'react';
import { X, Ruler, User, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
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
    selectedSize: '',
    selectedColor: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSizeChart, setShowSizeChart] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!orderForm.customerName) newErrors.customerName = 'Le nom est requis';
    if (!orderForm.customerEmail) newErrors.customerEmail = 'L\'email est requis';
    if (!orderForm.customerPhone) newErrors.customerPhone = 'Le téléphone est requis';
    if (!orderForm.customerAddress) newErrors.customerAddress = 'L\'adresse est requise';
    if (!orderForm.wilayaId) newErrors.wilayaId = 'La wilaya est requise';
    if (!orderForm.selectedSize) newErrors.selectedSize = 'La taille est requise';
    if (!orderForm.selectedColor) newErrors.selectedColor = 'La couleur est requise';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(orderForm);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Commande - {product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{product.name}</h3>
                <p className="text-gray-400 text-sm">{product.description}</p>
                <div className="text-xl font-bold text-white mt-2">{product.price.toFixed(0)} DA</div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations client
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Nom complet *</label>
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
                <label className="block text-white font-medium mb-2">Téléphone *</label>
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
                  onChange={(e) => setOrderForm({ ...orderForm, wilayaId: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none focus:border-white ${
                    errors.wilayaId ? 'border-red-500' : 'border-gray-700'
                  }`}
                >
                  <option value="">Sélectionner une wilaya</option>
                  {wilayaTariffs.map((wilaya) => (
                    <option key={wilaya.wilaya_id} value={wilaya.wilaya_id}>
                      {wilaya.name} - {wilaya.domicile_ecommerce || wilaya.homeDelivery || 0} DA
                    </option>
                  ))}
                </select>
                {errors.wilayaId && (
                  <p className="text-red-400 text-sm mt-1">{errors.wilayaId}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Adresse complète *</label>
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

          {/* Product Customization */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Personnalisation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Taille *</label>
                <input
                  type="text"
                  value={orderForm.selectedSize}
                  onChange={(e) => setOrderForm({ ...orderForm, selectedSize: e.target.value })}
                  placeholder="Entrez votre taille (ex: S, M, L, XL, 42, 44, etc.)"
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
                    Voir le guide des tailles
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Couleur *</label>
                <select
                  value={orderForm.selectedColor}
                  onChange={(e) => setOrderForm({ ...orderForm, selectedColor: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none focus:border-white ${
                    errors.selectedColor ? 'border-red-500' : 'border-gray-700'
                  }`}
                >
                  <option value="">Sélectionner une couleur</option>
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

            <div>
              <label className="block text-white font-medium mb-2">Notes supplémentaires</label>
              <textarea
                value={orderForm.notes}
                onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                placeholder="Instructions spéciales, préférences, etc."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Confirmer la commande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
