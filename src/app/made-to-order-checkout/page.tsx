'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { ArrowLeft, MessageCircle, Check } from 'lucide-react';

interface ProductData {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  colors?: string[];
  sizes?: string[];
  category?: string;
  type?: string;
}

export default function MadeToOrderCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customSize, setCustomSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    wilaya: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

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
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      console.log('Made-to-Order Checkout: Server side rendering, skipping checks');
      return;
    }

    console.log('Made-to-Order Checkout: Client side, checking for product data...');
    
    // First, check URL parameters
    const productId = searchParams.get('id');
    const size = searchParams.get('size');
    const color = searchParams.get('color');
    
    if (productId) {
      console.log('Made-to-Order Checkout: Found URL parameters:', { productId, size, color });
      
      // Set the selected size and color from URL parameters
      if (size) setSelectedSize(size);
      if (color) setSelectedColor(color);
      
      // For now, create a basic product object from the ID
      // In a real app, you'd fetch the full product data from the API
      const productData: ProductData = {
        id: productId,
        name: 'Custom Product', // This should be fetched from API
        price: 0, // This should be fetched from API
        type: 'made-to-order'
      };
      
      setProduct(productData);
      setLoading(false);
      return;
    }
    
    // Fallback: Get product data from sessionStorage
    const storedProduct = sessionStorage.getItem('checkoutProduct');
    console.log('Made-to-Order Checkout: Stored product data:', storedProduct);
    
    if (storedProduct) {
      try {
        const productData = JSON.parse(storedProduct);
        console.log('Made-to-Order Checkout: Parsed product data:', productData);
        setProduct(productData);
        
        // Clear the stored data after reading
        sessionStorage.removeItem('checkoutProduct');
        console.log('Made-to-Order Checkout: Cleared sessionStorage');
      } catch (error) {
        console.error('Made-to-Order Checkout: Error parsing product data:', error);
      }
    } else {
      console.log('Made-to-Order Checkout: No product data found');
    }
    
    setLoading(false);
  }, [searchParams]);

  const handleWhatsAppOrder = async () => {
    // Prevent multiple submissions
    if (isSubmittingOrder) {
      console.log('🚫 Made-to-order submission already in progress, ignoring duplicate request');
      return;
    }


    if (!product) {
      alert('No product selected');
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

    if (!customSize) {
      alert('Please specify custom size');
      return;
    }

    // Set loading state
    setIsSubmittingOrder(true);

    // Create WhatsApp message
    const message = `🛍️ *CUSTOM ORDER REQUEST*

📦 *Product:* ${product.name}
💰 *Price:* ${product.price.toFixed(0)} DZD
🔢 *Quantity:* ${quantity}

📏 *Custom Size:* ${customSize}
📐 *Size:* ${selectedSize || 'Not specified'}
🎨 *Color:* ${selectedColor || 'Not specified'}

👤 *Customer Details:*
• Name: ${customerInfo.name}
• Phone: ${customerInfo.phone}
• Email: ${customerInfo.email || 'Not provided'}
• Wilaya: ${customerInfo.wilaya}

📝 *Additional Notes:* Custom made-to-order item

Please confirm this order and provide delivery details.`;

    // Save order to database first
    let result: any = null;
    try {
      const orderData = {
        product: {
          name: product.name,
          price: product.price,
          customSize: customSize,
          customColor: selectedColor,
          selectedSize: selectedSize,
          quantity: quantity,
          notes: 'Custom made-to-order item'
        },
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email,
          address: customerInfo.address,
          wilaya: customerInfo.wilaya
        },
        delivery: {
          option: 'domicile', // Default for made-to-order
          cost: 0 // Will be calculated by admin
        }
      };

      console.log('📱 Made-to-Order: Saving order to database:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Made-to-Order: Order saved successfully:', result.order);
      } else {
        console.error('❌ Made-to-Order: Failed to save order:', result.error);
        // Continue with WhatsApp even if database save fails
      }
    } catch (error) {
      console.error('❌ Made-to-Order: Error saving order:', error);
      // Continue with WhatsApp even if database save fails
    }

    // WhatsApp number
    const whatsappNumber = '213672536920';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp for order confirmation
    console.log('🎨 Made-to-Order Checkout: Opening WhatsApp for custom order');
    window.open(whatsappUrl, '_blank');
    
    // Show success modal
    setOrderId(result?.order?.id || `MTO-${Date.now()}`);
    setOrderData(orderData);
    setShowSuccessModal(true);
    
    // Start 10-second redirect countdown
    setRedirectCountdown(10);
    console.log('✅ Made-to-order placed successfully, redirecting to home in 10 seconds');
    
    // Reset loading state
    setIsSubmittingOrder(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-black uppercase tracking-wider">Loading custom order...</p>
            <p className="text-white/70 mt-2">Please wait while we prepare your custom order</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-black uppercase tracking-wider">No product selected</p>
            <p className="text-white/70 mt-2">Please go back and select a product to order</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-3 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8 text-center">
            CUSTOM ORDER CHECKOUT
          </h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product & Customization */}
            <div className="bg-white/5 border border-white/20 p-6 rounded-lg">
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <MessageCircle size={20} />
                CUSTOM ORDER DETAILS
              </h2>
              
              {/* Product Display */}
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-24 bg-white/10 rounded overflow-hidden">
                  <OptimizedImage
                    src={product.image || ''}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-white">{product.name}</h3>
                  <p className="text-white/70 text-sm">{product.description}</p>
                  <p className="text-xl font-black text-white mt-2">{product.price.toFixed(0)} DZD</p>
                </div>
              </div>

              {/* Custom Size Input */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Custom Size *</label>
                <input
                  type="text"
                  required
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., L, XL, 42, Custom measurements..."
                />
                <p className="text-white/50 text-xs mt-1">Specify your exact size requirements</p>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <label className="block text-white font-medium mb-3">Choose Color</label>
                  <div className="grid grid-cols-2 gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`p-3 border-2 rounded-lg text-center font-medium transition-all duration-200 ${
                          selectedColor === color
                            ? 'border-violet-500 bg-violet-500/20 text-white'
                            : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                  <p className="text-white/50 text-xs mt-2">Select your preferred color</p>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-white font-medium mb-3">Choose Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`p-3 border-2 rounded-lg text-center font-medium transition-all duration-200 ${
                          selectedSize === size
                            ? 'border-violet-500 bg-violet-500/20 text-white'
                            : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <p className="text-white/50 text-xs mt-2">Select your preferred size</p>
                </div>
              )}


              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-white/20 rounded flex items-center justify-center hover:border-purple-400 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-white min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-white/20 rounded flex items-center justify-center hover:border-purple-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Information & Order Summary */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white/5 border border-white/20 p-6 rounded-lg">
                <h2 className="text-xl font-black text-white mb-6">CUSTOMER INFORMATION</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                      placeholder="Enter your phone number"
                    />
                  </div>


                  <div>
                    <label className="block text-white font-medium mb-2">Wilaya *</label>
                    <select
                      required
                      value={customerInfo.wilaya}
                      onChange={(e) => setCustomerInfo({...customerInfo, wilaya: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded text-white focus:border-purple-500 focus:outline-none"
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
                      <option value="Skikda">Skikda</option>
                      <option value="Tiaret">Tiaret</option>
                      <option value="Bejaia">Bejaia</option>
                      <option value="Tlemcen">Tlemcen</option>
                      <option value="Ouargla">Ouargla</option>
                      <option value="Guelma">Guelma</option>
                      <option value="Mostaganem">Mostaganem</option>
                      <option value="M'Sila">M'Sila</option>
                      <option value="Mascara">Mascara</option>
                      <option value="Jijel">Jijel</option>
                      <option value="Tizi Ouzou">Tizi Ouzou</option>
                      <option value="Medea">Medea</option>
                      <option value="Bechar">Bechar</option>
                      <option value="El Tarf">El Tarf</option>
                      <option value="Tindouf">Tindouf</option>
                      <option value="Tissemsilt">Tissemsilt</option>
                      <option value="El Bayadh">El Bayadh</option>
                      <option value="Illizi">Illizi</option>
                      <option value="Bordj Bou Arreridj">Bordj Bou Arreridj</option>
                      <option value="Boumerdes">Boumerdes</option>
                      <option value="Relizane">Relizane</option>
                      <option value="Souk Ahras">Souk Ahras</option>
                      <option value="Tipaza">Tipaza</option>
                      <option value="Mila">Mila</option>
                      <option value="Ain Defla">Ain Defla</option>
                      <option value="Naama">Naama</option>
                      <option value="Ain Temouchent">Ain Temouchent</option>
                      <option value="Ghardaia">Ghardaia</option>
                      <option value="Adrar">Adrar</option>
                      <option value="Chlef">Chlef</option>
                      <option value="Laghouat">Laghouat</option>
                      <option value="Oum El Bouaghi">Oum El Bouaghi</option>
                      <option value="Bouira">Bouira</option>
                      <option value="Tamanrasset">Tamanrasset</option>
                      <option value="Khenchela">Khenchela</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 border border-white/20 p-6 rounded-lg">
                <h2 className="text-xl font-black text-white mb-6">ORDER SUMMARY</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Product:</span>
                    <span className="text-white font-medium">{product.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Custom Size:</span>
                    <span className="text-white font-medium">{customSize || 'Not specified'}</span>
                  </div>
                  
                  {selectedSize && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Size:</span>
                      <span className="text-white font-medium">{selectedSize}</span>
                    </div>
                  )}
                  
                  {selectedColor && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Color:</span>
                      <span className="text-white font-medium">{selectedColor}</span>
                    </div>
                  )}
                  
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Quantity:</span>
                    <span className="text-white font-medium">{quantity}</span>
                  </div>
                  
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between text-xl font-black">
                      <span>Total:</span>
                      <span>{totalPrice.toFixed(0)} DZD</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleWhatsAppOrder}
                    disabled={!customSize || !customerInfo.name || !customerInfo.phone || !customerInfo.wilaya || isSubmittingOrder}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmittingOrder ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        <MessageCircle size={20} />
                        ORDER VIA WHATSAPP
                      </>
                    )}
                  </button>
                  
                  <p className="text-white/50 text-xs text-center mt-2">
                    You will be redirected to WhatsApp to confirm your custom order
                  </p>
                </div>
              </div>
            </div>
          </div>
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
