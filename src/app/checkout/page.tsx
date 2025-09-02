'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { products } from '@/data/products';
import { sortedWilayas } from '@/data/wilayas';
import { Product } from '@/types';
import { ArrowLeft, CreditCard, MapPin, Phone, User, Mail, Truck } from 'lucide-react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    wilaya: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 5000
  });
  const [selectedShipping, setSelectedShipping] = useState('stopDesk');

  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId) {
      const foundProduct = products.find(p => p.id === productId);
      setProduct(foundProduct || null);
    }

    // Load shipping settings
    const savedShipping = localStorage.getItem('obsidian-shipping');
    if (savedShipping) {
      setShippingSettings(JSON.parse(savedShipping));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate order ID
    const orderId = `ORD-${Date.now()}`;
    
    // Store order data (in a real app, this would be sent to a server)
    const orderData = {
      orderId,
      product,
      formData,
      quantity: parseInt(searchParams.get('quantity') || '1'),
      size: searchParams.get('size'),
      color: searchParams.get('color'),
      total: product ? product.price * parseInt(searchParams.get('quantity') || '1') : 0,
      orderDate: new Date().toISOString()
    };

    // Store in localStorage for demo purposes
    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    // Redirect to success page
    router.push(`/order-success?orderId=${orderId}`);
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
  const shippingCost = subtotal >= shippingSettings.freeShippingThreshold ? 0 : 
    (selectedShipping === 'stopDesk' ? (selectedWilaya?.stopDeskEcommerce || 0) : (selectedWilaya?.domicileEcommerce || 0));
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
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="shipping"
                    value="stopDesk"
                    checked={selectedShipping === 'stopDesk'}
                    onChange={(e) => setSelectedShipping(e.target.value)}
                    className="w-4 h-4 text-white"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">Stop Desk</p>
                    <p className="text-gray-400 text-sm">Récupérez votre commande au point relais</p>
                  </div>
                  <span className="text-white font-semibold">
                    {subtotal >= shippingSettings.freeShippingThreshold ? 'Gratuit' : `${selectedWilaya?.stopDeskEcommerce || 0} DZD`}
                  </span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="shipping"
                    value="homeDelivery"
                    checked={selectedShipping === 'homeDelivery'}
                    onChange={(e) => setSelectedShipping(e.target.value)}
                    className="w-4 h-4 text-white"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">À Domicile</p>
                    <p className="text-gray-400 text-sm">Livraison directement chez vous</p>
                  </div>
                  <span className="text-white font-semibold">
                    {subtotal >= shippingSettings.freeShippingThreshold ? 'Gratuit' : `${selectedWilaya?.domicileEcommerce || 0} DZD`}
                  </span>
                </label>
              </div>
              
              {subtotal >= shippingSettings.freeShippingThreshold && (
                <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded-lg">
                  <p className="text-green-300 text-sm">
                    🎉 Livraison gratuite ! Votre commande dépasse {shippingSettings.freeShippingThreshold} DZD
                  </p>
                </div>
              )}
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
                  <span className="text-white">{total.toFixed(0)} DZD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold text-lg">Total</span>
                    <span className="text-white font-bold text-xl">{total.toFixed(0)} DZD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Delivery Information</h2>
            
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
                      Email Address
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
                  Delivery Address
                </h3>
                <div className="space-y-4">
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
                {isSubmitting ? 'Placing Order...' : `Place Order - ${total.toFixed(0)} DZD`}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
