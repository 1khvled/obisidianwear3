'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import { CheckCircle, Package, Truck, Phone, Mail, ArrowLeft, Download, Share2, MessageCircle } from 'lucide-react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>('');
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const id = searchParams.get('orderId');
    if (id) {
      setOrderId(id);
      
      // Load order data from database
      const loadOrder = async () => {
        try {
          const response = await fetch(`/api/orders/${id}`);
          if (response.ok) {
            const order = await response.json();
            setOrderData(order);
          } else {
            // Fallback to localStorage if database fails
            const orders = JSON.parse(localStorage.getItem('obsidian-orders') || '[]');
            const order = orders.find((o: any) => o.id === id);
            setOrderData(order);
          }
        } catch (error) {
          console.error('Error loading order:', error);
          // Fallback to localStorage
          const orders = JSON.parse(localStorage.getItem('obsidian-orders') || '[]');
          const order = orders.find((o: any) => o.id === id);
          setOrderData(order);
        }
      };

      loadOrder();
    }
  }, [searchParams]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'OBSIDIAN WEAR - Order Confirmed',
          text: `My order #${orderId} has been confirmed! 🖤`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Order link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-4xl mx-auto container-padding py-12 sm:py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="heading-responsive font-bold text-white mb-4">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-gray-400 text-responsive max-w-2xl mx-auto">
            Thank you for choosing OBSIDIAN WEAR. Your order has been confirmed and we'll start processing it immediately.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-gray-800/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Order Details</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Share Order"
              >
                <Share2 size={20} />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Download Receipt"
              >
                <Download size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="text-white font-mono">#{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method:</span>
                  <span className="text-white">Cash on Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="px-3 py-1 bg-yellow-900 text-yellow-300 rounded-full text-sm">
                    Processing
                  </span>
                </div>
              </div>
            </div>

            {orderData && (
              <div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Customer:</span>
                    <span className="text-white">{orderData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white">{orderData.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wilaya:</span>
                    <span className="text-white">{orderData.wilayaName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white font-bold text-lg">{orderData.total} DZD</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-gray-800/50 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Order Timeline</h2>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-4">
                <CheckCircle size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Order Confirmed</h3>
                <p className="text-gray-400 text-sm">Your order has been received and confirmed</p>
                <p className="text-gray-500 text-xs">{new Date().toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-4">
                <Package size={16} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-gray-400 font-semibold">Preparing Package</h3>
                <p className="text-gray-500 text-sm">We'll prepare your order for shipping</p>
                <p className="text-gray-600 text-xs">Within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-4">
                <Truck size={16} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-gray-400 font-semibold">Out for Delivery</h3>
                <p className="text-gray-500 text-sm">Your order is on its way to you</p>
                <p className="text-gray-600 text-xs">2-5 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-white font-bold mb-4 flex items-center">
              <Phone size={20} className="mr-2" />
              Contact Us
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">Questions about your order?</p>
              <p className="text-white">Phone: +213 XXX XXX XXX</p>
              <div className="pt-2">
                <p className="text-gray-400">Social Media:</p>
                <p className="text-blue-400">Instagram: @obsidianwear_dz</p>
                <p className="text-blue-400">TikTok: @obsidianwear.dz</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-white font-bold mb-4 flex items-center">
              <MessageCircle size={20} className="mr-2" />
              Contact Support
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">
                Need help with your order? Contact us:
              </p>
              <p className="text-white">Phone: +213 XXX XXX XXX</p>
              <p className="text-gray-400">
                We'll respond within 24 hours to help with your order.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Continue Shopping
          </button>
          
          <Link href="/admin">
            <button className="w-full sm:w-auto px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              View Order in Admin
            </button>
          </Link>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-12 pt-8 border-t border-gray-800">
          <Logo size="lg" className="justify-center mb-4" />
          <p className="text-gray-400 text-responsive">
            Thank you for choosing OBSIDIAN WEAR. We appreciate your business! 🖤
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}