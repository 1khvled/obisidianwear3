'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Package, Truck, Clock, Home, ShoppingBag } from 'lucide-react';

interface OrderData {
  orderId: string;
  product: any;
  formData: any;
  quantity: number;
  size: string;
  color: string;
  total: number;
  orderDate: string;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      // In a real app, you would fetch order data from your server
      // For demo purposes, we'll get it from localStorage
      const storedOrder = localStorage.getItem('lastOrder');
      if (storedOrder) {
        setOrderData(JSON.parse(storedOrder));
      }
    }
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Order Not Found</h1>
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

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 font-poppins">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Thank you for your order! We've received your order and will process it shortly. 
            You'll receive a confirmation email with all the details.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Order Information</h3>
                <div className="space-y-2 text-gray-400">
                  <p><span className="text-white">Order ID:</span> {orderData.orderId}</p>
                  <p><span className="text-white">Order Date:</span> {formatDate(orderData.orderDate)}</p>
                  <p><span className="text-white">Payment Method:</span> Cash on Delivery</p>
                  <p><span className="text-white">Total Amount:</span> ${orderData.total.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Delivery Information</h3>
                <div className="space-y-2 text-gray-400">
                  <p><span className="text-white">Name:</span> {orderData.formData.name}</p>
                  <p><span className="text-white">Phone:</span> {orderData.formData.phone}</p>
                  <p><span className="text-white">Address:</span> {orderData.formData.address}</p>
                  <p><span className="text-white">City:</span> {orderData.formData.city}</p>
                  <p><span className="text-white">ZIP Code:</span> {orderData.formData.zipCode}</p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product Details</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={orderData.product.image}
                      alt={orderData.product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{orderData.product.name}</h4>
                    <p className="text-gray-400 text-sm">{orderData.product.category}</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-400">
                      {orderData.size && <p>Size: {orderData.size}</p>}
                      {orderData.color && <p>Color: {orderData.color}</p>}
                      <p>Quantity: {orderData.quantity}</p>
                      <p className="text-white font-semibold">${orderData.product.price} each</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Order Status</h2>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Order Confirmed</h3>
                <p className="text-gray-400 text-sm">Your order has been received and confirmed</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <Package size={20} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Processing</h3>
                <p className="text-gray-400 text-sm">We're preparing your order for shipment</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <Truck size={20} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Shipped</h3>
                <p className="text-gray-400 text-sm">Your order is on its way to you</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <CheckCircle size={20} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Delivered</h3>
                <p className="text-gray-400 text-sm">Your order has been delivered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-6 mb-8">
          <h3 className="text-yellow-300 font-semibold mb-3 flex items-center">
            <Clock size={20} className="mr-2" />
            Important Information
          </h3>
          <ul className="text-yellow-200 space-y-2 text-sm">
            <li>• Your order will be delivered within 3-5 business days</li>
            <li>• Please have the exact amount ready for cash on delivery</li>
            <li>• Our delivery team will contact you before delivery</li>
            <li>• You can track your order status using the Order ID: {orderData.orderId}</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Home size={20} />
            <span>Continue Shopping</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingBag size={20} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
