'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { Check, Package, Truck, MapPin, User, Phone, Mail, Home, Building, ArrowLeft } from 'lucide-react';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  wilaya: string;
}

export default function CartCheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [stockValidationErrors, setStockValidationErrors] = useState<string[]>([]);
  const [deliveryOption, setDeliveryOption] = useState<'domicile' | 'stop_desk'>('domicile');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    wilaya: ''
  });

  // Redirect countdown effect
  useEffect(() => {
    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0 && showSuccessModal) {
      // Redirect to home page after countdown
      router.push('/');
    }
  }, [redirectCountdown, showSuccessModal, router]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Redirect to cart if empty
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    setLoading(false);
  }, [items, router]);

   // Validate stock for all cart items
   const validateStock = async () => {
     const errors: string[] = [];
     
     for (const item of items) {
       try {
         const response = await fetch(`/api/products/${item.productId}?t=${Date.now()}`, {
           cache: 'no-store'
         });
         
         if (response.ok) {
           const responseData = await response.json();
           if (responseData.success && responseData.data) {
             const product = responseData.data;
             const availableStock = product.stock?.[item.selectedSize]?.[item.selectedColor] || 0;
             
             if (availableStock === 0) {
               errors.push(`${item.name} - Size ${item.selectedSize} in ${item.selectedColor} is OUT OF STOCK`);
             } else if (item.quantity > availableStock) {
               errors.push(`${item.name} - Size ${item.selectedSize} in ${item.selectedColor}: Only ${availableStock} available (requested ${item.quantity})`);
             }
           }
         }
       } catch (error) {
         console.error('Error validating stock for item:', item.name, error);
         errors.push(`${item.name} - Could not verify stock availability`);
       }
     }
     
     return errors;
   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmittingOrder) {
      console.log('🚫 Order submission already in progress, ignoring duplicate request');
      return;
    }

    // Phone validation (must start with 0 and be 10 digits)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      alert('Please enter a valid phone number');
      return;
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.wilaya) {
      alert('Please fill in all required customer information');
      return;
    }

    if (!deliveryOption) {
      alert('Please select a delivery option');
      return;
    }

    if (deliveryOption === 'domicile' && !customerInfo.address) {
      alert('Please provide your address for home delivery');
      return;
    }

    // Set loading state
    setIsSubmittingOrder(true);

    // Validate stock for all items
    console.log('🛒 Cart Checkout: Validating stock for all items...');
    const stockErrors = await validateStock();
    
    if (stockErrors.length > 0) {
      setStockValidationErrors(stockErrors);
      setIsSubmittingOrder(false);
      alert(`❌ Stock validation failed:\n\n${stockErrors.join('\n')}\n\nPlease remove out-of-stock items from your cart.`);
      return;
    }

    // Calculate costs
    const deliveryCost = getDeliveryCost();
    const subtotal = getTotalPrice();
    const totalPrice = subtotal + deliveryCost;

    // Create order data for multiple items
    try {
       const orderData = {
         items: items.map(item => ({
           id: item.productId,
           name: item.name,
           price: item.price,
           type: 'collection',
           selectedSize: item.selectedSize,
           selectedColor: item.selectedColor,
           quantity: item.quantity,
           subtotal: item.price * item.quantity
         })),
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email,
          address: customerInfo.address,
          wilaya: customerInfo.wilaya
        },
        delivery: {
          option: deliveryOption,
          cost: deliveryCost
        },
        total: totalPrice,
        subtotal: subtotal
      };

      console.log('🛒 Cart Checkout: Submitting order:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (result.success) {
        setOrderId(result.order.id);
        setOrderData(orderData);
        setShowSuccessModal(true);
        // Start 10-second redirect countdown
        setRedirectCountdown(10);
        console.log('✅ Cart order placed successfully, redirecting to home in 10 seconds');
        
        // Clear cart after successful order
        clearCart();
      } else {
        alert('Failed to place order: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Cart Checkout: Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      // Always reset loading state
      setIsSubmittingOrder(false);
    }
  };

  // Calculate delivery cost based on wilaya and delivery option
  const getDeliveryCost = () => {
    if (!customerInfo.wilaya || !deliveryOption) return 0;
    
    const baseCosts = {
      'Alger': { domicile: 400, stop_desk: 200 },
      'Oran': { domicile: 600, stop_desk: 300 },
      'Constantine': { domicile: 800, stop_desk: 400 },
      'Blida': { domicile: 500, stop_desk: 250 },
      'Setif': { domicile: 700, stop_desk: 350 },
      'Annaba': { domicile: 900, stop_desk: 450 },
      'Batna': { domicile: 1000, stop_desk: 500 },
      'Djelfa': { domicile: 1200, stop_desk: 600 },
      'Sidi Bel Abbes': { domicile: 800, stop_desk: 400 },
      'Biskra': { domicile: 1000, stop_desk: 500 },
      'Tebessa': { domicile: 1100, stop_desk: 550 },
      'El Oued': { domicile: 1200, stop_desk: 600 },
      'Khenchela': { domicile: 1100, stop_desk: 550 },
      'Oum El Bouaghi': { domicile: 1000, stop_desk: 500 },
      'Bouira': { domicile: 500, stop_desk: 250 },
      'Mostaganem': { domicile: 800, stop_desk: 400 },
      'Tlemcen': { domicile: 900, stop_desk: 450 },
      'Tiaret': { domicile: 800, stop_desk: 400 },
      'Chlef': { domicile: 600, stop_desk: 300 },
      'Laghouat': { domicile: 1000, stop_desk: 500 },
      'Ouargla': { domicile: 1200, stop_desk: 600 },
      'Jijel': { domicile: 800, stop_desk: 400 },
      'Mila': { domicile: 700, stop_desk: 350 },
      'Ain Defla': { domicile: 500, stop_desk: 250 },
      'Naama': { domicile: 1000, stop_desk: 500 },
      'Ain Temouchent': { domicile: 800, stop_desk: 400 },
      'Ghardaia': { domicile: 1200, stop_desk: 600 },
      'Relizane': { domicile: 600, stop_desk: 300 },
      'Timimoun': { domicile: 1400, stop_desk: 700 },
      'Bordj Badji Mokhtar': { domicile: 1600, stop_desk: 800 },
      'Ouled Djellal': { domicile: 1200, stop_desk: 600 },
      'Beni Abbes': { domicile: 1400, stop_desk: 700 },
      'In Salah': { domicile: 1500, stop_desk: 750 },
      'In Guezzam': { domicile: 1800, stop_desk: 900 },
      'Touggourt': { domicile: 1200, stop_desk: 600 },
      'Djanet': { domicile: 1600, stop_desk: 800 },
      'El M\'Ghair': { domicile: 1200, stop_desk: 600 },
      'El Menia': { domicile: 1300, stop_desk: 650 }
    };

    const costs = baseCosts[customerInfo.wilaya as keyof typeof baseCosts];
    return costs ? costs[deliveryOption] : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  const deliveryCost = getDeliveryCost();
  const subtotal = getTotalPrice();
  const totalPrice = subtotal + deliveryCost;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <h1 className="text-2xl font-black text-white mb-6 text-center">
            CART CHECKOUT
          </h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Customer Info */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  CUSTOMER INFORMATION
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-bold uppercase tracking-wider mb-2">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-black border-2 border-white text-white rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold uppercase tracking-wider mb-2">
                      PHONE NUMBER *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-black border-2 border-white text-white rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="0123456789"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold uppercase tracking-wider mb-2">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="w-full px-4 py-3 bg-black border-2 border-white text-white rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold uppercase tracking-wider mb-2">
                      WILAYA *
                    </label>
                    <select
                      value={customerInfo.wilaya}
                      onChange={(e) => setCustomerInfo({...customerInfo, wilaya: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-black border-2 border-white text-white rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Select your wilaya</option>
                      <option value="Alger">Alger</option>
                      <option value="Oran">Oran</option>
                      <option value="Constantine">Constantine</option>
                      <option value="Blida">Blida</option>
                      <option value="Setif">Setif</option>
                      <option value="Annaba">Annaba</option>
                      <option value="Batna">Batna</option>
                      <option value="Djelfa">Djelfa</option>
                      <option value="Sidi Bel Abbes">Sidi Bel Abbes</option>
                      <option value="Biskra">Biskra</option>
                      <option value="Tebessa">Tebessa</option>
                      <option value="El Oued">El Oued</option>
                      <option value="Khenchela">Khenchela</option>
                      <option value="Oum El Bouaghi">Oum El Bouaghi</option>
                      <option value="Bouira">Bouira</option>
                      <option value="Mostaganem">Mostaganem</option>
                      <option value="Tlemcen">Tlemcen</option>
                      <option value="Tiaret">Tiaret</option>
                      <option value="Chlef">Chlef</option>
                      <option value="Laghouat">Laghouat</option>
                      <option value="Ouargla">Ouargla</option>
                      <option value="Jijel">Jijel</option>
                      <option value="Mila">Mila</option>
                      <option value="Ain Defla">Ain Defla</option>
                      <option value="Naama">Naama</option>
                      <option value="Ain Temouchent">Ain Temouchent</option>
                      <option value="Ghardaia">Ghardaia</option>
                      <option value="Relizane">Relizane</option>
                      <option value="Timimoun">Timimoun</option>
                      <option value="Bordj Badji Mokhtar">Bordj Badji Mokhtar</option>
                      <option value="Ouled Djellal">Ouled Djellal</option>
                      <option value="Beni Abbes">Beni Abbes</option>
                      <option value="In Salah">In Salah</option>
                      <option value="In Guezzam">In Guezzam</option>
                      <option value="Touggourt">Touggourt</option>
                      <option value="Djanet">Djanet</option>
                      <option value="El M'Ghair">El M'Ghair</option>
                      <option value="El Menia">El Menia</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold uppercase tracking-wider mb-2">
                      ADDRESS
                    </label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 bg-black border-2 border-white text-white rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                      placeholder="Your full address"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  DELIVERY OPTIONS
                </h2>
                
                <div className="space-y-4">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      deliveryOption === 'domicile' 
                        ? 'border-purple-500 bg-purple-500/20' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setDeliveryOption('domicile')}
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-purple-400" />
                      <div>
                        <h3 className="font-bold text-white">Home Delivery</h3>
                        <p className="text-gray-400 text-sm">Delivered to your address</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      deliveryOption === 'stop_desk' 
                        ? 'border-purple-500 bg-purple-500/20' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setDeliveryOption('stop_desk')}
                  >
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-purple-400" />
                      <div>
                        <h3 className="font-bold text-white">Stop Desk</h3>
                        <p className="text-gray-400 text-sm">Pick up from nearest stop desk</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  ORDER ITEMS
                </h2>
                
                <div className="space-y-4">
                  {items.map((item) => (
                     <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/20 rounded">
                       <img
                         src={item.image}
                         alt={item.name}
                         className="w-16 h-16 object-cover rounded"
                       />
                       <div className="flex-1">
                         <h3 className="font-bold text-white">{item.name}</h3>
                         <p className="text-gray-400 text-sm">
                           Size: {item.selectedSize} • Color: {item.selectedColor}
                         </p>
                         <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-white">
                           {(item.price * item.quantity).toFixed(0)} DZD
                         </p>
                       </div>
                     </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                <h2 className="text-lg font-black text-white mb-3">
                  ORDER SUMMARY
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white font-medium">{subtotal.toFixed(0)} DZD</span>
                  </div>
                  
                  {deliveryOption && customerInfo.wilaya && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        Delivery ({deliveryOption === 'domicile' ? 'Home' : 'Stop Desk'}):
                      </span>
                      <span className="text-white font-medium">{deliveryCost.toFixed(0)} DZD</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-lg font-black">
                      <span>Total:</span>
                      <span>{totalPrice.toFixed(0)} DZD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-black py-4 px-6 rounded transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isSubmittingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    PLACING ORDER...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    PLACE ORDER
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
      
      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderId={orderId}
        orderData={orderData}
        redirectCountdown={redirectCountdown}
      />
    </div>
  );
}
