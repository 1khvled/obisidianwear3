'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProducts } from '@/context/SmartProductProvider';
import { useLanguage } from '@/context/LanguageContext';
import { sortedWilayas } from '@/data/wilayas';
import { Product } from '@/types';
import { orderService } from '@/services/orderService';
import { ArrowLeft, CreditCard, MapPin, Phone, User, Mail, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { DataLoadingAnimation, NetworkLoadingAnimation } from '@/components/LoadingSkeleton';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getProduct } = useProducts();
  const { t } = useLanguage();
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
  const [isDataSaved, setIsDataSaved] = useState(false);

  useEffect(() => {
    const productId = searchParams.get('productId');
    const productDataParam = searchParams.get('productData');
    const selectedSize = searchParams.get('size');
    const selectedColor = searchParams.get('color');
    const quantity = parseInt(searchParams.get('quantity') || '1');
    
    if (productId) {
      // First try to use product data from URL parameters (faster)
      if (productDataParam) {
        try {
          const productData = JSON.parse(decodeURIComponent(productDataParam));
          setProduct(productData);
          
          
          // Check if this is a made-to-order product (no stock property or empty stock)
          const isMadeToOrder = !productData.stock || (typeof productData.stock === 'object' && Object.keys(productData.stock).length === 0);
          if (isMadeToOrder) {
            console.log('🚨 Made-to-order product detected during loading, redirecting to made-to-order page');
            // Redirect made-to-order products to the made-to-order page
            router.push(`/made-to-order/${productId}`);
            return;
          }
          
          // Check if the selected size/color combination is in stock
          if (selectedSize && selectedColor) {
            const availableStock = productData.stock?.[selectedSize]?.[selectedColor] || 0;
            if (availableStock < quantity) {
              setOrderStatus('error');
              setOrderMessage(`❌ This item is out of stock. Only ${availableStock} items available in ${selectedSize} ${selectedColor}.`);
              return;
            }
          }
        } catch (error) {
          console.error('Error parsing product data from URL:', error);
          // Fallback to product lookup
          const foundProduct = getProduct(productId);
          setProduct(foundProduct || null);
        }
      } else {
        // Fallback to product lookup
        const foundProduct = getProduct(productId);
        setProduct(foundProduct || null);
        
        // Check if this is a made-to-order product (no stock property)
        
        const isMadeToOrder = foundProduct && (!foundProduct.stock || (typeof foundProduct.stock === 'object' && Object.keys(foundProduct.stock).length === 0));
        if (isMadeToOrder) {
          console.log('🚨 Made-to-order product detected during fallback loading, redirecting to made-to-order page');
          // Redirect made-to-order products to the made-to-order page
          router.push(`/made-to-order/${productId}`);
          return;
        }
        
        // Check stock for found product
        if (foundProduct && selectedSize && selectedColor) {
          const availableStock = foundProduct.stock?.[selectedSize]?.[selectedColor] || 0;
          if (availableStock < quantity) {
            setOrderStatus('error');
            setOrderMessage(`❌ This item is out of stock. Only ${availableStock} items available in ${selectedSize} ${selectedColor}.`);
            return;
          }
        }
      }
    }

    // Load saved form data from localStorage
    loadSavedFormData();
  }, [searchParams, getProduct]);

  // Load saved form data from localStorage
  const loadSavedFormData = () => {
    try {
      const savedData = localStorage.getItem('checkoutFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          ...parsedData
        }));
      }
      
      // Load saved shipping method
      const savedShipping = localStorage.getItem('checkoutShippingMethod');
      if (savedShipping && (savedShipping === 'stopDeskEcommerce' || savedShipping === 'domicileEcommerce')) {
        setSelectedShipping(savedShipping);
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  };

  // Save form data to localStorage
  const saveFormData = (data: typeof formData) => {
    try {
      localStorage.setItem('checkoutFormData', JSON.stringify(data));
      setIsDataSaved(true);
      // Hide the indicator after 2 seconds
      setTimeout(() => setIsDataSaved(false), 2000);
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  // Clear saved form data
  const clearSavedFormData = () => {
    try {
      localStorage.removeItem('checkoutFormData');
      localStorage.removeItem('checkoutShippingMethod');
    } catch (error) {
      console.error('Error clearing saved form data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    // Save to localStorage on every change
    saveFormData(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) {
      setOrderStatus('error');
      setOrderMessage('Product information is missing');
      return;
    }
    
    // Final safety check: if this is a made-to-order product, redirect to made-to-order page
    const isMadeToOrder = !product.stock || (typeof product.stock === 'object' && Object.keys(product.stock).length === 0);
    
    if (isMadeToOrder) {
      router.push(`/made-to-order/${product.id}`);
      return;
    }

    if (!formData.city.trim()) {
      setOrderStatus('error');
      setOrderMessage('Please enter your city');
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

      // Additional stock validation as safety check
      const availableStock = product.stock?.[selectedSize]?.[selectedColor] || 0;
      if (availableStock < quantity) {
        setOrderStatus('error');
        setOrderMessage(`❌ Not enough stock available. Only ${availableStock} items available in ${selectedSize} ${selectedColor}.`);
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerCity: formData.city,
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
        // Stock is automatically reserved and deducted by the order service
        console.log('✅ Order created successfully, inventory has been reserved and deducted');
        setOrderStatus('success');
        setOrderId(result.orderId);
        setOrderMessage(`Order #${result.orderId} placed successfully! 🎉\n\nWe'll contact you within 24 hours via WhatsApp.`);
        
        // Clear saved form data after successful order
        clearSavedFormData();
        
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
            <DataLoadingAnimation message="Loading product details..." />
            <button
              onClick={() => router.push('/')}
              className="mt-8 text-white hover:text-gray-300 flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
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
          {t('checkout.backToProduct')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form - First on mobile, second on desktop */}
          <div className="space-y-6 lg:order-2 order-1">
            <h2 className="text-2xl font-bold text-white">{t('checkout.deliveryInformation')}</h2>
            
            
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
                  {t('checkout.personalInformation')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      {t('checkout.fullName')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      placeholder={t('checkout.enterFullName')}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      {t('checkout.phoneNumber')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      placeholder={t('checkout.enterPhoneNumber')}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      {t('checkout.emailAddress')} ({t('checkout.optional')})
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      placeholder={t('checkout.enterEmailAddress')}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                  <MapPin size={20} className="mr-2" />
                  {selectedShipping === 'domicileEcommerce' ? t('checkout.deliveryAddress') : t('checkout.pickupLocation')}
                </h3>
                <div className="space-y-4">
                  {selectedShipping === 'domicileEcommerce' && (
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        {t('checkout.streetAddress')} *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                        placeholder={t('checkout.enterStreetAddress')}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        {t('checkout.city')} *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                        placeholder={t('checkout.enterCity')}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        {t('checkout.wilaya')} *
                      </label>
                      <select
                        name="wilaya"
                        value={formData.wilaya}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                      >
                        <option value="">{t('checkout.selectWilaya')}</option>
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
                      {t('checkout.deliveryNotes')}
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white resize-none"
                      placeholder={t('checkout.deliveryInstructionsPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-black rounded-full animate-spin"></div>
                    <span>{t('checkout.placingOrder')}</span>
                  </>
                ) : (
                  <span>{t('checkout.placeOrder')} - {total.toFixed(0)} DA</span>
                )}
              </button>

            </form>
          </div>

          {/* Order Summary - Second on mobile, first on desktop */}
          <div className="space-y-6 lg:order-1 order-2">
            <h2 className="text-2xl font-bold text-white">{t('checkout.orderSummary')}</h2>
            
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
                    {size && <p className="text-gray-400 text-sm">{t('checkout.size')}: {size}</p>}
                    {color && <p className="text-gray-400 text-sm">{t('checkout.color')}: {color}</p>}
                    <p className="text-gray-400 text-sm">{t('checkout.quantity')}: {quantity}</p>
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
              <h3 className="text-white font-semibold text-lg mb-2 flex items-center">
                <Truck size={20} className="mr-2" />
                {t('checkout.deliveryOptions')} <span className="text-red-400 ml-2">*</span>
              </h3>
              <p className="text-gray-400 text-sm mb-4">{t('checkout.selectDeliveryOption')}</p>
              <div className="space-y-3">
                <label className={`flex items-center space-x-4 cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedShipping === 'stopDeskEcommerce' 
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
                }`}>
                  <div className="relative">
                    <input
                      type="radio"
                      name="shipping"
                      value="stopDeskEcommerce"
                      checked={selectedShipping === 'stopDeskEcommerce'}
                      onChange={(e) => {
                        console.log('Radio clicked:', e.target.value);
                        const newShipping = e.target.value as 'stopDeskEcommerce' | 'domicileEcommerce';
                        setSelectedShipping(newShipping);
                        // Save shipping method to localStorage
                        localStorage.setItem('checkoutShippingMethod', newShipping);
                      }}
                      className="w-5 h-5 text-blue-500 accent-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    />
                    {selectedShipping === 'stopDeskEcommerce' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-semibold text-lg">{t('checkout.stopDesk')}</p>
                      {selectedShipping === 'stopDeskEcommerce' && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {t('checkout.selected')}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{t('checkout.stopDeskDescription')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">
                      {selectedWilaya ? `${selectedWilaya.stopDeskEcommerce} DZD` : '--'}
                    </span>
                  </div>
                </label>
                
                <label className={`flex items-center space-x-4 cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedShipping === 'domicileEcommerce' 
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
                }`}>
                  <div className="relative">
                    <input
                      type="radio"
                      name="shipping"
                      value="domicileEcommerce"
                      checked={selectedShipping === 'domicileEcommerce'}
                      onChange={(e) => {
                        console.log('Radio clicked:', e.target.value);
                        const newShipping = e.target.value as 'stopDeskEcommerce' | 'domicileEcommerce';
                        setSelectedShipping(newShipping);
                        // Save shipping method to localStorage
                        localStorage.setItem('checkoutShippingMethod', newShipping);
                      }}
                      className="w-5 h-5 text-blue-500 accent-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    />
                    {selectedShipping === 'domicileEcommerce' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-semibold text-lg">{t('checkout.homeDelivery')}</p>
                      {selectedShipping === 'domicileEcommerce' && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {t('checkout.selected')}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{t('checkout.homeDeliveryDescription')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">
                      {selectedWilaya ? `${selectedWilaya.domicileEcommerce} DZD` : '--'}
                    </span>
                  </div>
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
                  <span className="text-gray-400">{t('checkout.subtotal')}</span>
                  <span className="text-white">{subtotal.toFixed(0)} DA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('checkout.shipping')}</span>
                  <span className="text-white">{shippingCost.toFixed(0)} DA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {selectedShipping === 'stopDeskEcommerce' ? t('checkout.stopDesk') : t('checkout.homeDelivery')}
                  </span>
                  <span className="text-gray-500">
                    {selectedWilaya ? selectedWilaya.name : t('checkout.selectWilaya')}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold text-lg">{t('checkout.total')}</span>
                    <span className="text-white font-bold text-xl">{total.toFixed(0)} DA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
