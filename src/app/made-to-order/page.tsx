'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { 
  Palette, 
  Ruler, 
  Clock, 
  CheckCircle, 
  Star, 
  MessageCircle,
  ArrowRight,
  Sparkles,
  Crown,
  Zap,
  Shield,
  Heart,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Package,
  X,
  AlertCircle,
  ArrowLeft,
  Home
} from 'lucide-react';
import { MadeToOrderProduct } from '@/types';
import SizeChart from '@/components/SizeChart';
import { sortedWilayas } from '@/data/wilayas';
import { backendService } from '@/services/backendService';
import Header from '@/components/Header';
import { useLanguage } from '@/context/LanguageContext';
import { useOptimizedUserData } from '@/context/OptimizedUserDataContext';

export default function MadeToOrderPage() {
  const { t } = useLanguage();
  const { madeToOrderProducts, wilayaTariffs, loading } = useOptimizedUserData();
  const [selectedProduct, setSelectedProduct] = useState<MadeToOrderProduct | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [loadedProducts, setLoadedProducts] = useState<MadeToOrderProduct[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    wilayaId: 0,
    wilayaName: '',
    selectedSize: '',
    selectedColor: '',
    quantity: 1,
    notes: '',
    shippingType: 'homeDelivery' as 'homeDelivery' | 'stopDesk'
  });

  // Optimized helper function to get the best image source
  const getImageSrc = useCallback((product: MadeToOrderProduct) => {
    console.log('🖼️ Getting image for product:', {
      id: product.id,
      name: product.name,
      hasImage: !!product.image,
      imageValue: product.image,
      imageType: typeof product.image,
      hasImages: !!(product.images && product.images.length > 0),
      imagesArray: product.images
    });

    // Check for main image first
    if (product.image) {
      console.log('📸 Checking main image:', product.image);
      // If it's a data URL (base64), use it directly
      if (product.image.startsWith('data:')) {
        console.log('✅ Found data URL image');
        return product.image;
      }
      // If it's a URL path, use it
      if (product.image.startsWith('/') || product.image.startsWith('http')) {
        console.log('✅ Found URL path image');
        return product.image;
      }
      // If it's a long base64 string, use it
      if (product.image.length > 100) {
        console.log('✅ Found long base64 image');
        return product.image;
      }
    }
    
    // Check for images array
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      console.log('📸 Checking first image in array:', firstImage);
      if (firstImage) {
        // If it's a data URL (base64), use it directly
        if (firstImage.startsWith('data:')) {
          console.log('✅ Found data URL in images array');
          return firstImage;
        }
        // If it's a URL path, use it
        if (firstImage.startsWith('/') || firstImage.startsWith('http')) {
          console.log('✅ Found URL path in images array');
          return firstImage;
        }
        // If it's a long base64 string, use it
        if (firstImage.length > 100) {
          console.log('✅ Found long base64 in images array');
          return firstImage;
        }
      }
    }
    
    console.log('❌ No valid image found for product:', product.name);
    return null;
  }, []);

  // Show page immediately, no artificial loading delay
  useEffect(() => {
    // Show page immediately - no waiting for products
    setIsPageLoading(false);
  }, []);

  // Progressive loading logic - show products as they load
  useEffect(() => {
    console.log('🔄 Progressive loading useEffect triggered:', {
      loading,
      productsLength: madeToOrderProducts.length,
      loadedProductsLength: loadedProducts.length
    });

    if (loading && madeToOrderProducts.length === 0) {
      console.log('⏳ Still loading, no products yet');
      setIsLoadingProducts(true);
      setLoadedProducts([]);
    } else if (madeToOrderProducts.length > 0 && loadedProducts.length === 0) {
      console.log('🚀 Products available, starting progressive loading');
      // Start progressive loading when products are available and none are loaded yet
      setIsLoadingProducts(false);
      loadProductsProgressively();
    } else if (madeToOrderProducts.length === 0) {
      console.log('❌ No products available');
      setIsLoadingProducts(false);
    }
  }, [loading, madeToOrderProducts.length, loadedProducts.length]);

  // Handle when products become available after initial load
  useEffect(() => {
    if (madeToOrderProducts.length > 0 && loadedProducts.length === 0 && !loading) {
      console.log('🎯 Products became available after loading, starting progressive loading');
      loadProductsProgressively();
    }
  }, [madeToOrderProducts.length, loadedProducts.length, loading]);

  // Progressive loading function - load products one by one
  const loadProductsProgressively = async () => {
    console.log('🚀 Starting progressive loading:', {
      loadedProducts: loadedProducts.length,
      totalProducts: madeToOrderProducts.length
    });

    if (loadedProducts.length >= madeToOrderProducts.length) {
      console.log('✅ All products already loaded');
      setIsLoadingMore(false);
      return;
    }

    setIsLoadingMore(true);
    console.log('⏳ Loading more products...');
    
    // Load products in batches of 3 with 200ms delay between each
    const batchSize = 3;
    const startIndex = loadedProducts.length;
    const endIndex = Math.min(startIndex + batchSize, madeToOrderProducts.length);
    
    console.log(`📦 Loading batch: ${startIndex} to ${endIndex}`);
    
    for (let i = startIndex; i < endIndex; i++) {
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between products
      console.log(`➕ Adding product ${i + 1}:`, madeToOrderProducts[i].name);
      setLoadedProducts(prev => [...prev, madeToOrderProducts[i]]);
    }
    
    // If there are more products to load, continue
    if (endIndex < madeToOrderProducts.length) {
      console.log('🔄 More products to load, continuing...');
      setTimeout(() => loadProductsProgressively(), 100); // Small delay before next batch
    } else {
      console.log('✅ All products loaded!');
      setIsLoadingMore(false);
    }
  };

  // Debug products state
  useEffect(() => {
    console.log('🔍 Made-to-order products loaded:', {
      length: madeToOrderProducts.length,
      products: madeToOrderProducts.map(p => ({ id: p.id, name: p.name, hasImage: !!p.image }))
    });
  }, [madeToOrderProducts]);



  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    // Validate phone number (must start with 0, then 7/6/5, total 10 digits)
    const phoneRegex = /^0[567][0-9]{8}$/;
    if (!phoneRegex.test(orderForm.customerPhone)) {
      alert('Le numéro de téléphone doit commencer par 0, suivi de 7, 6 ou 5, et contenir exactement 10 chiffres (ex: 0555123456)');
      return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderForm.customerEmail)) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }
    
    // Validate required fields
    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.customerEmail || !orderForm.customerAddress || !orderForm.wilayaId || !orderForm.selectedSize || !orderForm.selectedColor) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Additional validation for wilaya selection
    if (orderForm.wilayaId === 0) {
      alert('Veuillez sélectionner une wilaya');
      return;
    }

    try {
      const orderData = {
        productId: selectedProduct.id,
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        customerEmail: orderForm.customerEmail || '',
        customerAddress: orderForm.customerAddress,
        customerCity: orderForm.customerAddress.split(',')[0] || orderForm.customerAddress, // Extract city from address
        wilayaId: orderForm.wilayaId,
        wilayaName: orderForm.wilayaName,
        selectedSize: orderForm.selectedSize,
        selectedColor: orderForm.selectedColor,
        quantity: orderForm.quantity,
        unitPrice: selectedProduct.price,
        whatsappContact: '+213123456789', // Default WhatsApp number
        notes: orderForm.notes || ''
      };

      console.log('Submitting order with data:', orderData);

      const response = await fetch('/api/made-to-order/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const orderData = await response.json();
        alert('Commande soumise avec succès! NOUS VOUS CONTACTERONS DANS 24H-48H VIA WHATSAPP.');
        setShowOrderForm(false);
        setSelectedProduct(null);
        setOrderForm({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          customerAddress: '',
          wilayaId: 0,
          wilayaName: '',
          selectedSize: '',
          selectedColor: '',
          quantity: 1,
          notes: '',
          shippingType: 'homeDelivery' as const
        });
      } else {
        const errorData = await response.json();
        console.error('Order submission error:', errorData);
        throw new Error(errorData.error || 'Failed to submit order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to submit order: ${errorMessage}. Please try again or contact us directly via WhatsApp.`);
    }
  };

  const getShippingCost = useMemo(() => {
    if (!orderForm.wilayaId || !wilayaTariffs || wilayaTariffs.length === 0) {
      return 0;
    }
    
    const wilaya = wilayaTariffs.find(w => w.id === String(orderForm.wilayaId) || w.wilaya_id === orderForm.wilayaId);
    
    if (!wilaya) {
      return 0;
    }
    
    return orderForm.shippingType === 'homeDelivery' 
      ? (wilaya.domicile_ecommerce || wilaya.domicileEcommerce || wilaya.home_delivery || wilaya.homeDelivery || 0)
      : (wilaya.stop_desk_ecommerce || wilaya.stopDeskEcommerce || wilaya.stop_desk || wilaya.stopDesk || 0);
  }, [orderForm.wilayaId, orderForm.shippingType, wilayaTariffs]);

  const openWhatsApp = () => {
    const message = t('madeToOrder.whatsappMessage');
    const phoneNumber = '+213123456789'; // Replace with your WhatsApp number
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const openWhatsAppWithOrder = () => {
    if (!selectedProduct) return;
    
    const shippingCost = getShippingCost;
    const totalPrice = selectedProduct.price * orderForm.quantity;
    const depositAmount = totalPrice * 0.5;
    
    const message = `Bonjour! Je souhaite passer une commande spéciale:

Produit: ${selectedProduct.name}
Taille: ${orderForm.selectedSize}
Couleur: ${orderForm.selectedColor}
Quantité: ${orderForm.quantity}

Prix unitaire: ${selectedProduct.price} DZD
Total: ${totalPrice} DZD
Acompte (50%): ${depositAmount.toFixed(0)} DZD

Livraison: ${orderForm.shippingType === 'homeDelivery' ? 'Domicile' : 'Stop Desk'}
Coût livraison: ${shippingCost} DZD

Mes informations:
Nom: ${orderForm.customerName}
Téléphone: ${orderForm.customerPhone}
Adresse: ${orderForm.customerAddress}
Wilaya: ${orderForm.wilayaName}

Notes: ${orderForm.notes || 'Aucune'}

Merci de me contacter pour finaliser la commande spéciale!`;
    
    const phoneNumber = '+213123456789'; // Replace with your WhatsApp number
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            {/* Animated Logo */}
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-300 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-white animate-bounce" />
                </div>
              </div>
            </div>
            
            {/* Loading Text */}
            <h2 className="text-2xl font-bold text-white mb-2">Loading Made-to-Order</h2>
            <p className="text-gray-400 mb-6">Preparing your custom collection...</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-white to-gray-300 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            
            {/* Progress Percentage */}
            <div className="text-white text-sm font-medium">
              {Math.round(loadingProgress)}%
            </div>
            
            {/* Loading Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            <span className="text-white text-sm font-medium">Special Order Service</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
            {t('madeToOrder.title')}
          </h1>
          
          <p className="text-base text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
            Découvrez une sélection de vêtements, chaussures et accessoires fabriqués en Chine.
          </p>
          
          <p className="text-sm text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Large choix de modèles tendance • Livraison estimée entre 18 et 20 jours • Des produits choisis pour leur style et leur qualité
          </p>
          
          <p className="text-sm text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            Apportez une touche unique à votre garde-robe avec nos articles soigneusement sélectionnés.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center mb-3 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-2 text-sm">Fast Delivery</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Livraison estimée entre 18 et 20 jours</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg flex items-center justify-center mb-3 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                <CreditCard className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-white font-bold mb-2 text-sm">Easy Payment</h3>
              <p className="text-gray-400 text-xs leading-relaxed">50% deposit required</p>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center mb-3 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                <MessageCircle className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-bold mb-2 text-sm">Direct Contact</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Order via WhatsApp</p>
            </div>
          </div>
          
          {/* Scroll to Products Button */}
          <div className="mt-8">
            <button
              onClick={() => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  // Scroll to center the products section in viewport
                  productsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                  });
                }
              }}
              className="group bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center mx-auto transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Package className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              View Our Products
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="py-16 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              <span className="text-white text-xs font-medium">Premium Collection</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
              {t('madeToOrder.ourProducts')}
            </h2>
            <p className="text-base text-gray-400 max-w-2xl mx-auto">
              Discover our curated selection of premium items available for special order
            </p>
          </div>
          
          {isLoadingProducts ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-white mb-2">Loading Products...</h3>
              <p className="text-gray-400">Please wait while we fetch our collection</p>
            </div>
          ) : madeToOrderProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">{t('madeToOrder.noProducts')}</h3>
              <p className="text-gray-400 text-sm">{t('madeToOrder.noProductsDesc')}</p>
              <p className="text-gray-500 text-xs mt-2">Debug: products.length = {madeToOrderProducts.length}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Category Filter Buttons */}
              <div className="flex flex-wrap justify-center gap-2 mb-8 px-4">
                <div className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-auto pb-2">
                {(() => {
                  // Get all available categories
                  const availableCategories = Array.from(new Set(madeToOrderProducts.map(p => p.category || 'Other')));
                  
                  const categoryNames: Record<string, string> = {
                    'Shoes': '👟 Chaussures',
                    'T-Shirts': '👕 T-Shirts', 
                    'Hoodies': '🧥 Sweats à Capuche',
                    'Jackets': '🧥 Vestes',
                    'Pants': '👖 Pantalons',
                    'Accessories': '👜 Accessoires',
                    'Other': '📦 Autres'
                  };

                  return (
                    <>
                      <button
                        onClick={() => setSelectedCategory('All')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          selectedCategory === 'All'
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Tous
                      </button>
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            selectedCategory === category
                              ? 'bg-white text-black'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {categoryNames[category] || category}
                        </button>
                      ))}
                    </>
                  );
                })()}
                </div>
              </div>

              {/* Products Display */}
              <div className="space-y-12">
                {(() => {
                  // Filter products based on selected category (use loadedProducts for progressive loading)
                  const productsToShow = loadedProducts.length > 0 ? loadedProducts : madeToOrderProducts;
                  const filteredProducts = selectedCategory === 'All' 
                    ? productsToShow 
                    : productsToShow.filter(p => (p.category || 'Other') === selectedCategory);

                  if (filteredProducts.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Aucun produit trouvé</h3>
                        <p className="text-gray-400">Aucun produit dans cette catégorie pour le moment.</p>
                      </div>
                    );
                  }

                  // Group filtered products by category
                  const productsByCategory = filteredProducts.reduce((acc, product) => {
                    const category = product.category || 'Other';
                    if (!acc[category]) {
                      acc[category] = [];
                    }
                    acc[category].push(product);
                    return acc;
                  }, {} as Record<string, MadeToOrderProduct[]>);

                  // Define category order and display names
                  const categoryOrder = ['Shoes', 'T-Shirts', 'Hoodies', 'Jackets', 'Pants', 'Accessories', 'Other'];
                  const categoryNames: Record<string, string> = {
                    'Shoes': '👟 Chaussures',
                    'T-Shirts': '👕 T-Shirts',
                    'Hoodies': '🧥 Sweats à Capuche',
                    'Jackets': '🧥 Vestes',
                    'Pants': '👖 Pantalons',
                    'Accessories': '👜 Accessoires',
                    'Other': '📦 Autres'
                  };

                  return categoryOrder
                    .filter(category => productsByCategory[category]?.length > 0)
                    .map((category, categoryIndex) => (
                    <div key={category} className="space-y-4 sm:space-y-6">
                      <div className="text-center px-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                          {categoryNames[category] || category}
                        </h2>
                        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {productsByCategory[category].map((product, index) => (
                <div 
                  key={product.id} 
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-101 animate-fadeInUp"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="relative overflow-hidden">
                    {(() => {
                      const imageSrc = getImageSrc(product);
                      console.log('🎯 Rendering image for product:', product.name, 'src:', imageSrc);
                      
                      if (imageSrc) {
                        if (imageSrc.startsWith('data:')) {
                          return (
                            <img
                              src={imageSrc}
                              alt={product.name}
                              className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-500"
                              loading="lazy"
                              onLoad={() => console.log('✅ Image loaded successfully for:', product.name)}
                              onError={(e) => console.error('❌ Image failed to load for:', product.name, e)}
                            />
                          );
                        } else {
                          return (
                            <Image
                              src={imageSrc}
                              alt={product.name}
                              width={400}
                              height={500}
                              className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-500"
                              loading={index < 3 ? "eager" : "lazy"}
                              priority={index < 3}
                              onLoad={() => console.log('✅ Next.js Image loaded successfully for:', product.name)}
                              onError={(e) => console.error('❌ Next.js Image failed to load for:', product.name, e)}
                            />
                          );
                        }
                      } else {
                        // Try fallback to a default image
                        return (
                          <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <div className="text-center">
                              <Package className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                              <p className="text-gray-500 text-xs">No Image Available</p>
                              <p className="text-gray-600 text-xs">{product.name}</p>
                            </div>
                          </div>
                        );
                      }
                    })()}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {t('madeToOrder.customOrder')}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1">
                          <Star className="w-4 h-4 text-white mr-1" />
                          <span className="text-white text-sm font-semibold">{t('madeToOrder.premium')}</span>
                        </div>
                      </div>
                    </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-bold text-white mb-2 group-hover:text-white transition-colors line-clamp-1">{product.name}</h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg sm:text-xl font-black text-white">{Number(product.price).toFixed(0)} DZD</div>
                      <div className="text-xs text-gray-400 hidden sm:block">Starting from</div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-gray-300 text-xs font-medium mb-1">{t('madeToOrder.colors')}</div>
                      <div className="flex flex-wrap gap-1">
                        {(product.colors || []).slice(0, 4).map((color) => (
                          <span key={color} className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {color}
                          </span>
                        ))}
                        {(product.colors || []).length > 4 && (
                          <span className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            +{(product.colors || []).length - 4}
                          </span>
                        )}
                        {(product.colors || []).length === 0 && (
                          <span className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Multiple colors available
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-gray-300 text-xs font-medium mb-1">{t('madeToOrder.sizes')}</div>
                      <div className="flex flex-wrap gap-1">
                        {(product.sizes || []).map((size) => (
                          <span key={size} className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {size}
                          </span>
                        ))}
                        {(product.sizes || []).length === 0 && (
                          <span className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Multiple sizes available
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <a
                        href={`/made-to-order/${product.id}`}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-300 hover:scale-102 border border-white/20"
                      >
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">Details</span>
                      </a>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setOrderForm(prev => ({
                            ...prev,
                            selectedSize: (product.sizes || [])[0] || '',
                            selectedColor: (product.colors || [])[0] || ''
                          }));
                          setShowOrderForm(true);
                        }}
                        className="flex-1 bg-white hover:bg-gray-100 text-black py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-300 hover:scale-102"
                      >
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Order</span>
                        <span className="sm:hidden">Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Progressive Loading Indicator */}
              {isLoadingMore && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Loading more products... ({loadedProducts.length}/{madeToOrderProducts.length})
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              <span className="text-white text-xs font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              {t('madeToOrder.whyChoose')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-xl flex items-center justify-center mx-auto group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all duration-300 group-hover:scale-105">
                  <Palette className="w-8 h-8 text-orange-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.totalCustomization')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                {t('madeToOrder.totalCustomizationDesc')}
              </p>
            </div>
            
            <div className="group text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl flex items-center justify-center mx-auto group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all duration-300 group-hover:scale-105">
                  <Shield className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.premiumQuality')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                {t('madeToOrder.premiumQualityDesc')}
              </p>
            </div>
            
            <div className="group text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-sm border border-rose-500/30 rounded-xl flex items-center justify-center mx-auto group-hover:from-rose-500/30 group-hover:to-pink-500/30 transition-all duration-300 group-hover:scale-105">
                  <Heart className="w-8 h-8 text-rose-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.uniquePiece')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                {t('madeToOrder.uniquePieceDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              <span className="text-white text-sm font-medium">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              {t('madeToOrder.howItWorks')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get your special order in just 4 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center relative">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto group-hover:from-blue-500/30 group-hover:to-indigo-500/30 transition-all duration-300 group-hover:scale-110">
                  <span className="text-2xl font-black text-blue-400">1</span>
                </div>
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/30 to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.step3')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('madeToOrder.step3Desc')}
              </p>
            </div>
            
            <div className="group text-center relative">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300 group-hover:scale-110">
                  <span className="text-2xl font-black text-green-400">2</span>
                </div>
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-green-500/30 to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.step1')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('madeToOrder.step1Desc')}
              </p>
            </div>
            
            <div className="group text-center relative">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto group-hover:from-yellow-500/30 group-hover:to-orange-500/30 transition-all duration-300 group-hover:scale-110">
                  <span className="text-2xl font-black text-yellow-400">3</span>
                </div>
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-yellow-500/30 to-transparent"></div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.step2')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('madeToOrder.step2Desc')}
              </p>
            </div>
            
            <div className="group text-center relative">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300 group-hover:scale-110">
                  <span className="text-2xl font-black text-purple-400">4</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{t('madeToOrder.step4')}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t('madeToOrder.step4Desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            <span className="text-white text-sm font-medium">Ready to Start?</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            {t('madeToOrder.readyToCreate')}
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Contact us now to discuss your special order and get started on your unique piece
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#products';
                }
              }}
              className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <Package className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              {t('madeToOrder.viewCollection')}
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <Home className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              {t('madeToOrder.backToHome')}
            </button>
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-black rounded-lg border border-gray-800 w-full max-w-2xl max-h-[95vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white truncate pr-2">Commander: {selectedProduct.name}</h3>
              <button
                onClick={() => setShowOrderForm(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="p-4 space-y-4">
              {/* Product Info */}
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center space-x-4">
                  {selectedProduct.image && (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className="text-white font-semibold">{selectedProduct.name}</h4>
                    <p className="text-gray-400 text-sm">{selectedProduct.price} DZD</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                    placeholder="Votre nom complet"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Téléphone * (10 chiffres)</label>
                  <input
                    type="tel"
                    required
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                    placeholder="0555123456"
                    pattern="0[567][0-9]{8}"
                    minLength={10}
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={orderForm.customerEmail}
                  onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Adresse complète *</label>
                <textarea
                  required
                  value={orderForm.customerAddress}
                  onChange={(e) => setOrderForm({ ...orderForm, customerAddress: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  rows={3}
                  placeholder="Votre adresse complète"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Wilaya *</label>
                <select
                  required
                  value={orderForm.wilayaId}
                  onChange={(e) => {
                    const wilaya = wilayaTariffs.find(w => w.id === e.target.value || w.wilaya_id === parseInt(e.target.value));
                    setOrderForm({ 
                      ...orderForm, 
                      wilayaId: parseInt(e.target.value),
                      wilayaName: wilaya?.name || ''
                    });
                  }}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                >
                  <option value="">Sélectionnez votre wilaya</option>
                  {wilayaTariffs.map((wilaya) => (
                    <option key={wilaya.id || wilaya.wilaya_id} value={wilaya.id || wilaya.wilaya_id}>
                      {wilaya.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipping Type Selection */}
              {orderForm.wilayaId > 0 && (
                <div>
                  <label className="block text-white font-medium mb-2">Type de livraison *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setOrderForm({ ...orderForm, shippingType: 'homeDelivery' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        orderForm.shippingType === 'homeDelivery'
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <Truck className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-semibold">Domicile</div>
                        <div className="text-sm">
                          {(() => {
                            const wilaya = wilayaTariffs.find(w => w.id === String(orderForm.wilayaId) || w.wilaya_id === orderForm.wilayaId);
                            const cost = wilaya?.domicile_ecommerce || wilaya?.domicileEcommerce || wilaya?.home_delivery || wilaya?.homeDelivery || 0;
                            return `${cost} DZD`;
                          })()}
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setOrderForm({ ...orderForm, shippingType: 'stopDesk' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        orderForm.shippingType === 'stopDesk'
                          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <Package className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-semibold">Stop Desk</div>
                        <div className="text-sm">
                          {(() => {
                            const wilaya = wilayaTariffs.find(w => w.id === String(orderForm.wilayaId) || w.wilaya_id === orderForm.wilayaId);
                            const cost = wilaya?.stop_desk_ecommerce || wilaya?.stopDeskEcommerce || wilaya?.stop_desk || wilaya?.stopDesk || 0;
                            return `${cost} DZD`;
                          })()}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Product Customization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Taille *</label>
                  <select
                    required
                    value={orderForm.selectedSize}
                    onChange={(e) => setOrderForm({ ...orderForm, selectedSize: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  >
                    <option value="">Sélectionnez une taille</option>
                    {(selectedProduct.sizes || []).map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  
                  {/* Size Chart Button */}
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
                    required
                    value={orderForm.selectedColor}
                    onChange={(e) => setOrderForm({ ...orderForm, selectedColor: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  >
                    <option value="">Sélectionnez une couleur</option>
                    {(selectedProduct.colors || []).map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Notes spéciales</label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  rows={3}
                  placeholder="Des instructions spéciales ou des détails sur votre commande..."
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Résumé de la commande</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Produit:</span>
                    <span className="text-white">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prix unitaire:</span>
                    <span className="text-white">{selectedProduct.price} DZD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantité:</span>
                    <span className="text-white">{orderForm.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sous-total:</span>
                    <span className="text-white">{selectedProduct.price * orderForm.quantity} DZD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Livraison ({orderForm.shippingType === 'homeDelivery' ? 'Domicile' : 'Stop Desk'}):</span>
                    <span className="text-white">{getShippingCost} DZD</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-white font-bold">{(selectedProduct.price * orderForm.quantity) + getShippingCost} DZD</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-white">Acompte (50%):</span>
                    <span className="text-white font-bold">{((selectedProduct.price * orderForm.quantity + getShippingCost) * 0.50).toFixed(0)} DZD</span>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Informations importantes
                </h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Vous devez payer 50% du prix total comme acompte</li>
                  <li>• Le délai de production est de 20-18 jours</li>
                  <li>• <strong className="text-green-400">NOUS VOUS CONTACTERONS DANS 24H-48H VIA WHATSAPP</strong></li>
                  <li>• Le solde restant sera payé à la livraison</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {t('madeToOrder.cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg font-medium flex items-center justify-center text-sm"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {t('madeToOrder.submitOrder')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Size Chart Modal */}
      <SizeChart 
        category={selectedProduct?.sizeChartCategory || selectedProduct?.size_chart_category || selectedProduct?.category || 't-shirts'} 
        isOpen={showSizeChart} 
        onClose={() => setShowSizeChart(false)}
        customSizeChart={selectedProduct?.customSizeChart ? {
          ...selectedProduct.customSizeChart,
          category: selectedProduct.sizeChartCategory || selectedProduct.size_chart_category || selectedProduct.category || 't-shirts'
        } : undefined}
        useCustomSizeChart={selectedProduct?.useCustomSizeChart}
      />
    </div>
  );
}
