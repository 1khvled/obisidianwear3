'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X, Copy, Share2, Home, Package, Truck, Clock, MessageCircle } from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderData?: any;
  redirectCountdown?: number;
}

export default function OrderSuccessModal({ isOpen, onClose, orderId, orderData, redirectCountdown = 0 }: OrderSuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy order ID:', error);
    }
  };

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
      handleCopyOrderId();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full mx-4 transform transition-all duration-300 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
          >
            <X size={20} />
          </button>
          
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle size={32} className="text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Order Confirmed! 🎉
          </h2>
          <p className="text-gray-400 text-center text-sm">
            Your order has been placed successfully
          </p>
        </div>

        {/* Order Details */}
        <div className="px-6 pb-6">
          {/* Order ID */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Order ID</p>
                <p className="text-white font-mono text-lg">#{orderId}</p>
              </div>
              <button
                onClick={handleCopyOrderId}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
              >
                <Copy size={16} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Order Info */}
          {orderData && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Package size={16} className="text-purple-400" />
                <span className="text-gray-400">Product:</span>
                <span className="text-white">{orderData.product?.name}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Truck size={16} className="text-blue-400" />
                <span className="text-gray-400">Delivery:</span>
                <span className="text-white">{orderData.delivery?.option || 'Home Delivery'}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-yellow-400" />
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-medium">Processing</span>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <MessageCircle size={16} className="text-purple-400" />
              What's Next?
            </h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• We'll contact you within 24 hours</li>
              <li>• Confirm your order details</li>
              <li>• Arrange delivery/pickup</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors text-white font-medium"
            >
              <Share2 size={16} />
              Share
            </button>
            
            <button
              onClick={() => {
                handleClose();
                window.location.href = '/';
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white font-medium"
            >
              <Home size={16} />
              {redirectCountdown > 0 ? `Continue Shopping (${redirectCountdown}s)` : 'Continue Shopping'}
            </button>
          </div>
          
          {redirectCountdown > 0 && (
            <div className="text-center mt-3">
              <p className="text-gray-400 text-sm">
                Redirecting to home page in {redirectCountdown} seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
