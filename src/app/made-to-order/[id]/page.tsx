'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useOptimizedUserData } from '@/context/OptimizedUserDataContext';
import { MadeToOrderProduct } from '@/types';
import { Star, ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Ruler, Calendar, Clock } from 'lucide-react';
import SizeChart from '@/components/SizeChart';

export default function MadeToOrderProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getMadeToOrderProduct, madeToOrderProducts, wilayaTariffs } = useOptimizedUserData();
  
  const [product, setProduct] = useState<MadeToOrderProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    wilayaId: '',
    notes: ''
  });

  useEffect(() => {
    if (params.id) {
      const foundProduct = getMadeToOrderProduct(params.id as string);
      setProduct(foundProduct || null);
      
      // Set default color if not selected
      if (foundProduct && foundProduct.colors.length > 0 && !selectedColor) {
        setSelectedColor(foundProduct.colors[0]);
      }
      
      console.log('Made-to-order product detail page updated:', foundProduct?.name);
    }
  }, [params.id, getMadeToOrderProduct, selectedColor]);

  if (!product) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
            <Link href="/made-to-order" className="text-white hover:text-gray-300">
              ← Back to Made-to-Order
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getImageSrc = (image: string) => {
    if (!image) return '/obsidian-logo.png';
    
    // Handle base64 data URLs
    if (image.startsWith('data:image/')) {
      return image;
    }
    
    // Handle regular URLs
    if (image.startsWith('http') || image.startsWith('/')) {
      return image;
    }
    
    // Fallback
    return '/obsidian-logo.png';
  };

  const getShippingCost = (wilayaId: string) => {
    if (!wilayaTariffs || wilayaTariffs.length === 0) return { homeDelivery: 0, stopDesk: 0 };
    
    const wilaya = wilayaTariffs.find(w => String(w.wilaya_id) === String(wilayaId));
    if (!wilaya) return { homeDelivery: 0, stopDesk: 0 };
    
    return {
      homeDelivery: wilaya.domicile_ecommerce || wilaya.homeDelivery || 0,
      stopDesk: wilaya.stop_desk_ecommerce || wilaya.stopDesk || 0
    };
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSize || !selectedColor) {
      alert('Veuillez sélectionner une taille et une couleur');
      return;
    }

    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.customerEmail || !orderForm.customerAddress || !orderForm.wilayaId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Phone validation
    const phoneRegex = /^0[567][0-9]{8}$/;
    if (!phoneRegex.test(orderForm.customerPhone)) {
      alert('Le numéro de téléphone doit commencer par 0 et être suivi de 7, 6 ou 5, puis 8 chiffres');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderForm.customerEmail)) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }

    const selectedWilaya = wilayaTariffs.find(w => String(w.wilaya_id) === String(orderForm.wilayaId));
    if (!selectedWilaya) {
      alert('Wilaya non trouvée');
      return;
    }

    const shippingCost = getShippingCost(orderForm.wilayaId);
    const totalPrice = product.price + shippingCost.homeDelivery;

    // Create WhatsApp message
    const whatsappMessage = `Bonjour ! Je souhaite commander :

Produit: ${product.name}
Taille: ${selectedSize}
Couleur: ${selectedColor}
Prix: ${product.price} DA
Livraison: ${shippingCost.homeDelivery} DA
Total: ${totalPrice} DA

Mes informations:
Nom: ${orderForm.customerName}
Téléphone: ${orderForm.customerPhone}
Email: ${orderForm.customerEmail}
Adresse: ${orderForm.customerAddress}
Wilaya: ${selectedWilaya.name}

${orderForm.notes ? `Notes: ${orderForm.notes}` : ''}`;

    const whatsappUrl = `https://wa.me/213672536920?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');

    setShowOrderModal(false);
    setOrderForm({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      wilayaId: '',
      notes: ''
    });
  };

  // Get all images (main image + additional images)
  const allImages = [product.image, ...(product.images || [])].filter(img => img && img.trim() !== '');
  const uniqueImages = Array.from(new Set(allImages));

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-white hover:text-gray-300 mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-900/50 rounded-2xl overflow-hidden">
              <Image
                src={getImageSrc(uniqueImages[selectedImage] || product.image)}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Image Gallery */}
            {uniqueImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {uniqueImages.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-900/50 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={getImageSrc(image)}
                      alt={`${product.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                {product.description}
              </p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-white">{product.price.toFixed(0)} DA</span>
                  <span className="text-gray-400 ml-2">À partir de</span>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Couleurs</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-5 py-3 border rounded-lg font-medium transition-colors ${
                      selectedColor === color
                        ? 'border-white bg-white text-black'
                        : 'border-gray-600 text-white hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Tailles</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-3 border rounded-lg font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-white bg-white text-black'
                        : !selectedColor
                          ? 'border-yellow-600 text-yellow-400 bg-yellow-900/20'
                          : 'border-gray-600 text-white hover:border-gray-400'
                    }`}
                  >
                    {size}
                    {!selectedColor && ' (Sélectionner une couleur)'}
                  </button>
                ))}
              </div>
              
              {selectedColor && (
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="mt-4 text-blue-400 hover:text-blue-300 text-sm flex items-center"
                >
                  <Ruler size={16} className="mr-2" />
                  Voir le guide des tailles
                </button>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-900/50 rounded-lg">
                <Truck className="text-blue-400" size={24} />
                <div>
                  <p className="text-white font-medium">Livraison</p>
                  <p className="text-gray-400 text-sm">20-18 jours</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-900/50 rounded-lg">
                <Shield className="text-green-400" size={24} />
                <div>
                  <p className="text-white font-medium">Qualité</p>
                  <p className="text-gray-400 text-sm">Premium</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-900/50 rounded-lg">
                <RotateCcw className="text-purple-400" size={24} />
                <div>
                  <p className="text-white font-medium">Personnalisé</p>
                  <p className="text-gray-400 text-sm">Sur mesure</p>
                </div>
              </div>
            </div>

            {/* Order Button */}
            <button
              onClick={() => setShowOrderModal(true)}
              disabled={!selectedSize || !selectedColor}
              className="w-full bg-white text-black py-5 px-8 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-3 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <ShoppingCart size={20} />
              <span>Commander maintenant</span>
            </button>

            {/* Additional Info */}
            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>Délai de production: 20-18 jours ouvrables</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span>Contact WhatsApp dans les 24-48h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Commander {product.name}</h2>
            
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={orderForm.customerName}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Téléphone * (10 chiffres)
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  minLength={10}
                  maxLength={10}
                  value={orderForm.customerPhone}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={orderForm.customerEmail}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse complète *
                </label>
                <textarea
                  required
                  value={orderForm.customerAddress}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, customerAddress: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Votre adresse complète"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wilaya *
                </label>
                <select
                  required
                  value={orderForm.wilayaId}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, wilayaId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une wilaya</option>
                  {wilayaTariffs.map((wilaya) => (
                    <option key={wilaya.wilaya_id} value={wilaya.wilaya_id}>
                      {wilaya.name} - {wilaya.domicile_ecommerce || wilaya.homeDelivery || 0} DA
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Instructions spéciales, préférences de couleur, etc."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Commander via WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Guide des tailles</h2>
              <button
                onClick={() => setShowSizeChart(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <SizeChart 
              category={product.category || 'Hoodies'}
              isOpen={showSizeChart}
              onClose={() => setShowSizeChart(false)}
              customSizeChart={product.customSizeChart}
              useCustomSizeChart={product.useCustomSizeChart}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
