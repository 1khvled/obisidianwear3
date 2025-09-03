'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProducts } from '@/context/ProductContext';
import { sortedWilayas } from '@/data/wilayas';
import { Product } from '@/types';
import { orderService } from '@/services/orderService';
import { ArrowLeft, CreditCard, MapPin, Phone, User, Mail, Truck, CheckCircle, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getProduct, updateProduct } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    wilaya: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [orderMessage, setOrderMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [selectedShipping, setSelectedShipping] = useState<'stopDeskEcommerce' | 'domicileEcommerce'>('stopDeskEcommerce');

  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId) {
      const foundProduct = getProduct(productId);
      setProduct(foundProduct || null);
    }

    // no free-shipping settings anymore
  }, [searchParams, getProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) {
      setOrderStatus('error');
      setOrderMessage('Product information is missing');
      return;
    }

    if (!formData.wilaya) {
      setOrderStatus('error');
      setOrderMessage('Please select a wilaya for shipping');
      return;
    }

    setIsSubmitting(true);
    setOrderStatus('idle');

    try {
      const quantity = parseInt(searchParams.get('quantity') || '1');
      const selectedSize = searchParams.get('size') || 'M';
      const selectedColor = searchParams.get('color') || 'Black';
      const selectedWilaya = sortedWilayas.find(w => w.id.toString() === formData.wilaya);
      
      if (!selectedWilaya) {
        throw new Error('Invalid wilaya selection');
      }

      const shippingCost = selectedWilaya[selectedShipping];

      // STOCK VALIDATION
      const availableStock = product.stock?.[selectedSize]?.[selectedColor] ?? 0;
      if (availableStock < quantity) {
        setOrderStatus('error');
        setOrderMessage('Selected quantity exceeds available stock. Please adjust.');
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        wilayaId: selectedWilaya.id,
        wilayaName: selectedWilaya.name,
        productId: product.id,
        selectedSize,
        selectedColor,
        quantity,
        subtotal: product.price * quantity,
        shippingCost,
        total: (product.price * quantity) + shippingCost,
        shippingType: selectedShipping,
        paymentMethod: 'cod' as const,
        notes: formData.notes
      };

      // Create order first
      const result = await orderService.createOrder(orderData, product);

      if (result.success && result.orderId) {
        // Reduce stock locally after successful order
        const newStock = { ...product.stock };
        if (newStock[selectedSize] && newStock[selectedSize][selectedColor]) {
          newStock[selectedSize][selectedColor] = availableStock - quantity;
        }
        
        // Calculate total stock to update inStock status
        const totalStock = Object.values(newStock).reduce((total, colorStock) => {
          return total + Object.values(colorStock).reduce((sum, qty) => sum + qty, 0);
        }, 0);
        
        const updatedProduct = {
          ...product,
          stock: newStock,
          inStock: totalStock > 0,
          updatedAt: new Date()
        };
        
        updateProduct(product.id, updatedProduct);
        console.log('🔄 Stock reduced:', selectedSize, selectedColor, 'from', availableStock, 'to', availableStock - quantity);
        setOrderStatus('success');
        setOrderId(result.orderId);
        setOrderMessage(`Order #${result.orderId} placed successfully! 🎉\n\nWe'll contact you within 24 hours via WhatsApp.`);
        
        // Redirect after showing success message
        setTimeout(() => {
          router.push(`/order-success?orderId=${result.orderId}`);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setOrderStatus('error');
      setOrderMessage('Failed to place order. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
            <button
              onClick={() => router.push('/')}
              className="text-white hover:text-gray-300"
            >
              ← Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const quantity = parseInt(searchParams.get('quantity') || '1');
  const size = searchParams.get('size') || '';
  const color = searchParams.get('color') || '';
  const subtotal = product.price * quantity;
  
  // Get selected wilaya for shipping calculation
  const selectedWilaya = sortedWilayas.find(w => w.id.toString() === formData.wilaya);
  const shippingCost = selectedWilaya ? selectedWilaya[selectedShipping] : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-white hover:text-gray-300 mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Product
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Order Summary</h2>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-400">{product.category}</p>
                  <div className="mt-2 space-y-1">
                    {size && <p className="text-gray-400 text-sm">Size: {size}</p>}
                    {color && <p className="text-gray-400 text-sm">Color: {color}</p>}
                    <p className="text-gray-400 text-sm">Quantity: {quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{product.price} DZD</p>
                  <p className="text-gray-400 text-sm">x{quantity}</p>
                </div>
              </div>
            </div>

            {/* Shipping Options */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                <Truck size={20} className="mr-2" />
                Options de Livraison
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <input
                    type="radio"
                    name="shipping"
                    value="stopDeskEcommerce"
                    checked={selectedShipping === 'stopDeskEcommerce'}
                    onChange={(e) => {
                      console.log('Radio clicked:', e.target.value);
                      setSelectedShipping(e.target.value as 'stopDeskEcommerce' | 'domicileEcommerce');
                    }}
                    className="w-4 h-4 text-white accent-white"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">Stop Desk</p>
                    <p className="text-gray-400 text-sm">Récupérez votre commande au point relais</p>
                  </div>
                  <span className="text-white font-semibold">
                    {selectedWilaya ? `${selectedWilaya.stopDeskEcommerce} DZD` : '--'}
                  </span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <input
                    type="radio"
                    name="shipping"
                    value="domicileEcommerce"
                    checked={selectedShipping === 'domicileEcommerce'}
                    onChange={(e) => {
                      console.log('Radio clicked:', e.target.value);
                      setSelectedShipping(e.target.value as 'stopDeskEcommerce' | 'domicileEcommerce');
                    }}
                    className="w-4 h-4 text-white accent-white"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">À Domicile</p>
                    <p className="text-gray-400 text-sm">Livraison directement chez vous</p>
                  </div>
                  <span className="text-white font-semibold">
                    {selectedWilaya ? `${selectedWilaya.domicileEcommerce} DZD` : '--'}
                  </span>
                </label>
              </div>
              
              {/* No free shipping banner */}
            </div>

            {/* Payment Method */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                <CreditCard size={20} className="mr-2" />
                Mode de Paiement
              </h3>
              <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-green-300 font-semibold">Paiement à la Livraison (COD)</p>
                    <p className="text-green-400 text-sm">Payez quand votre commande arrive</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Total */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{subtotal.toFixed(0)} DA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-white">{shippingCost.toFixed(0)} DA</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold text-lg">Total</span>
                    <span className="text-white font-bold text-xl">{total.toFixed(0)} DA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Delivery Information</h2>
            
            {/* Order Status Messages */}
            {orderStatus === 'success' && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <div>
                    <h3 className="text-green-300 font-semibold">Order Placed Successfully!</h3>
                    <p className="text-green-200 text-sm whitespace-pre-line">{orderMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {orderStatus === 'error' && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                  <div>
                    <h3 className="text-red-300 font-semibold">Order Failed</h3>
                    <p className="text-red-200 text-sm">{orderMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                  <User size={20} className="mr-2" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                  <MapPin size={20} className="mr-2" />
                  {selectedShipping === 'domicileEcommerce' ? 'Delivery Address' : 'Pickup Location'}
                </h3>
                <div className="space-y-4">
                  {selectedShipping === 'domicileEcommerce' && (
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                        placeholder="Enter your street address"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Wilaya *
                      </label>
                      <select
                        name="wilaya"
                        value={formData.wilaya}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                      >
                        <option value="">Sélectionner une wilaya</option>
                        {sortedWilayas.map((wilaya) => (
                          <option key={wilaya.id} value={wilaya.id}>
                            {wilaya.name} (#{wilaya.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {selectedShipping === 'stopDeskEcommerce' && (
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                      <p className="text-blue-300 text-sm">
                        📍 You will pick up your order at the nearest stop desk in your selected wilaya
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Delivery Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white resize-none"
                      placeholder="Any special delivery instructions?"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Placing Order...' : `Place Order - ${total.toFixed(0)} DA`}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
