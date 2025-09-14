'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { ShoppingBag, ArrowLeft, Check } from 'lucide-react';

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

interface StockData {
  stock: { [size: string]: { [color: string]: number } };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deliveryOption, setDeliveryOption] = useState<'domicile' | 'stop_desk' | ''>('');
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
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const storedProduct = sessionStorage.getItem('checkoutProduct');
    if (storedProduct) {
      try {
        const parsedProduct: ProductData = JSON.parse(storedProduct);
        setProduct(parsedProduct);
        
        if (parsedProduct.type !== 'made-to-order') {
          fetchStockData(parsedProduct.id, parsedProduct.type || 'collection');
        }
        
        sessionStorage.removeItem('checkoutProduct');
      } catch (error) {
        console.error('Checkout: Error parsing product data:', error);
      }
    }
    
    setLoading(false);
  }, []);

  const fetchStockData = async (productId: string, productType: string) => {
    try {
      const response = await fetch(`/api/check-stock?productId=${productId}&type=${productType}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔄 Checkout: Stock data response:', data);
        if (data.success && data.data) {
          console.log('🔄 Checkout: Setting stock data:', data.data);
          console.log('🔄 Checkout: Availability data:', data.data.availability);
          setStockData(data.data);
        }
      }
    } catch (error) {
      console.error('Checkout: Error fetching stock data:', error);
    }
  };

  const isInStock = (color: string, size: string) => {    
    if (!stockData) return true;
    const stock = stockData.stock?.[size]?.[color];
    console.log('🔍 Checkout: Checking stock for', color, size, '=', stock);                                                
    return stock && stock > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmittingOrder) {
      console.log('🚫 Order submission already in progress, ignoring duplicate request');
      return;
    }

    if (!product) {
      alert('No product selected');
      return;
    }

    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    // Check stock availability
    if (!isInStock(selectedColor, selectedSize)) {
      alert('Sorry, this item is out of stock. Please select a different size or color.');
      return;
    }

    // Check if requested quantity is available
    const availableStock = stockData?.stock?.[selectedSize]?.[selectedColor] || 0;
    if (quantity > availableStock) {
      alert(`Sorry, only ${availableStock} items are available in this size and color.`);
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

    // Calculate costs
    const deliveryCost = getDeliveryCost();
    const subtotal = product.price * quantity;
    const totalPrice = subtotal + deliveryCost;

    // Save order to database
    try {
      const orderData = {
        product: {
          id: product.id,
          name: product.name,
        price: product.price,
          type: product.type || 'collection',
          selectedSize: selectedSize,
          selectedColor: selectedColor,
          quantity: quantity,
          subtotal: subtotal,
          total: totalPrice
        },
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
        }
      };

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
        console.log('✅ Order placed successfully, redirecting to home in 10 seconds');
      } else {
        alert('Failed to place order: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Checkout: Error placing order:', error);
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
      'Tamanrasset': { domicile: 2500, stop_desk: 1250 }
    };
    
    return (baseCosts as any)[customerInfo.wilaya]?.[deliveryOption] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-black uppercase tracking-wider">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-20 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-black uppercase tracking-wider mb-4 text-center">No Product Selected</h1>
          <p className="text-white/70 mb-6 text-center">Please go back and select a product to order.</p>
              <button 
            onClick={() => router.push('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-black py-3 px-6 rounded transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Go Back
                  </button>
        </div>
      </div>
    );
  }

  // Calculate costs
  const deliveryCost = getDeliveryCost();
  const subtotal = product.price * quantity;
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
            CHECKOUT
          </h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Product & Options */}
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                <div className="flex gap-4">
                  {product.image && (
                    <OptimizedImage
                      src={product.image}
                    alt={product.name}
                      width={120}
                      height={120}
                      className="w-24 h-24 object-cover rounded border border-white/20"
                    />
                  )}
                <div className="flex-1">
                    <h3 className="text-lg font-black text-white">{product.name}</h3>
                    <p className="text-xl font-black text-purple-400">{product.price.toFixed(0)} DZD</p>
                    {product.category && (
                      <span className="text-xs text-purple-400 font-black uppercase tracking-wider">
                        {product.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                  <h3 className="text-lg font-black text-white mb-3">SELECT SIZE</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((size) => {
                      // Check if this size is in stock for the selected color
                      // If no color selected, show all sizes as available (user needs to select color first)
                      const stockValue = selectedColor ?  
                        (stockData?.stock?.[size]?.[selectedColor] || 0) :                                           
                        (stockData ? 1 : 0); // If stockData exists but no color selected, show as available
                      const isInStock = stockValue > 0;
                      
                      console.log('🔍 Checkout: Size', size, 'Color', selectedColor, 'Stock', stockValue, 'InStock', isInStock);
                      
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            if (isInStock) {
                              setSelectedSize(size);
                            } else {
                              console.log('🚫 Cannot select size', size, 'for color', selectedColor, '- out of stock');
                            }
                          }}
                          disabled={!isInStock}
                          className={`p-2 border-2 rounded text-center font-black transition-colors relative ${
                            selectedSize === size
                              ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                              : isInStock
                              ? 'border-white/20 text-white hover:border-purple-400'
                              : 'bg-red-900/50 text-red-400 border-red-500 cursor-not-allowed opacity-75'
                          }`}
                        >
                          {size}
                          {!isInStock && selectedColor && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">×</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selection - Visual Only */}
              {product.colors && product.colors.length > 0 && (
                <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                  <h3 className="text-lg font-black text-white mb-3">SELECT COLOR</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          // Check if currently selected size is out of stock for this color
                          if (selectedSize && stockData?.stock?.[selectedSize]?.[color] === 0) {
                            console.log('🚫 Deselecting size', selectedSize, 'because it\'s out of stock for color', color);
                            setSelectedSize('');
                          }
                        }}
                        className={`p-2 border-2 rounded text-center font-black transition-colors ${
                          selectedColor === color
                            ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                            : 'border-white/20 text-white hover:border-purple-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                  <p className="text-white/50 text-xs mt-2">Color selection is for visual reference only</p>
                </div>
              )}

              {/* Stock Status */}
              {selectedSize && selectedColor && (
                <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                  <h3 className="text-lg font-black text-white mb-3">STOCK STATUS</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Availability:</span>
                    <div className="flex items-center gap-2">
                      {isInStock(selectedColor, selectedSize) ? (
                        <>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-green-400 font-bold">
                            In Stock
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-red-400 font-bold">Out of Stock</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                <h3 className="text-lg font-black text-white mb-3">QUANTITY</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border border-white/20 rounded flex items-center justify-center text-white hover:border-purple-400"
                  >
                    -
                  </button>
                  <span className="text-lg font-black text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 border border-white/20 rounded flex items-center justify-center text-white hover:border-purple-400"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                <h3 className="text-lg font-black text-white mb-3">DELIVERY OPTIONS</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setDeliveryOption('domicile')}
                    className={`w-full p-3 border-2 rounded text-left transition-colors ${
                      deliveryOption === 'domicile'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-white/20 text-white hover:border-purple-400'
                    }`}
                  >
                    <div className="font-black">🏠 HOME DELIVERY</div>
                    <div className="text-sm">Delivered to your address</div>
                  </button>
                  
                  <button
                    onClick={() => setDeliveryOption('stop_desk')}
                    className={`w-full p-3 border-2 rounded text-left transition-colors ${
                      deliveryOption === 'stop_desk'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-white/20 text-white hover:border-purple-400'
                    }`}
                  >
                    <div className="font-black">📦 STOP DESK</div>
                    <div className="text-sm">Pick up from nearest location</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Customer Info & Order Summary */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                <h3 className="text-lg font-black text-white mb-4">CUSTOMER INFORMATION</h3>
                
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-white font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                    placeholder="Enter your phone number"
                  />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                      placeholder="Enter your email address"
                    />
                  </div>


                  {deliveryOption === 'domicile' && (
                <div>
                      <label className="block text-white font-medium mb-1">Address *</label>
                      <textarea
                        required
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                        placeholder="Enter your full address"
                        rows={2}
                  />
                </div>
                  )}

                  <div>
                    <label className="block text-white font-medium mb-1">Wilaya *</label>
                    <select
                      required
                      value={customerInfo.wilaya}
                      onChange={(e) => setCustomerInfo({...customerInfo, wilaya: e.target.value})}
                      className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white focus:border-purple-500 focus:outline-none"
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
                      <option value="Tamanrasset">Tamanrasset</option>
                    </select>
                  </div>
                </form>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                <h3 className="text-lg font-black text-white mb-4">ORDER SUMMARY</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Product:</span>
                    <span className="text-white font-medium">{product.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Size:</span>
                    <span className="text-white font-medium">{selectedSize || 'Not selected'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Color:</span>
                    <span className="text-white font-medium">{selectedColor || 'Not selected'}</span>
                </div>

                  <div className="flex justify-between">
                    <span className="text-white/70">Quantity:</span>
                    <span className="text-white font-medium">{quantity}</span>
                </div>

                  <div className="flex justify-between">
                    <span className="text-white/70">Subtotal:</span>
                    <span className="text-white font-medium">{subtotal.toFixed(0)} DZD</span>
                </div>

                  {deliveryOption && (
                    <div className="flex justify-between">
                      <span className="text-white/70">
                        Delivery ({deliveryOption === 'domicile' ? 'Home' : 'Stop Desk'}):
                      </span>
                      <span className="text-white font-medium">{deliveryCost.toFixed(0)} DZD</span>
                    </div>
                  )}
                  
                  <div className="border-t border-white/20 pt-2">
                    <div className="flex justify-between text-lg font-black">
                      <span>Total:</span>
                      <span>{totalPrice.toFixed(0)} DZD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!selectedSize || !selectedColor || !deliveryOption || !isInStock(selectedColor, selectedSize) || isSubmittingOrder}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-black py-3 px-6 rounded transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isSubmittingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    PLACING ORDER...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    {!selectedSize || !selectedColor ? 'SELECT SIZE & COLOR' : 
                     !isInStock(selectedColor, selectedSize) ? 'OUT OF STOCK' : 
                     !deliveryOption ? 'SELECT DELIVERY OPTION' :
                     'PLACE ORDER'}
                  </>
                )}
              </button>
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