'use client';

import { Product } from '@/types';
import { Star, ShoppingCart, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import SizeSelectionModal from './SizeSelectionModal';

interface ProductCardProps {
  product: Product & { isMadeToOrder?: boolean };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [modalActionType, setModalActionType] = useState<'addToCart'>('addToCart');
  
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCartClick = () => {
    if (product.inStock) {
      setModalActionType('addToCart');
      setShowSizeModal(true);
    }
  };


  const handleModalAction = (size: string, color: string, quantity: number) => {
    // This will be handled by the modal itself
    console.log('Modal action clicked:', { size, color, quantity, actionType: modalActionType });
  };

  return (
    <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-102">
      <div className="relative overflow-hidden">
        <Link href={!product.stock ? `/made-to-order/${product.id}` : `/product/${product.id}`} className="block">
          {(() => {
            console.log('🖼️ ProductCard: Rendering image for product:', {
              id: product.id,
              name: product.name,
              image: product.image,
              imageType: typeof product.image,
              hasImage: !!product.image,
              imageLength: product.image?.length
            });
            
            // Handle different image types
            if (!product.image) {
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
            
            // If it's a data URL (base64), use regular img tag
            if (product.image.startsWith('data:')) {
              return (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-500"
                  onLoad={() => console.log('✅ Data URL image loaded for:', product.name)}
                  onError={(e) => console.error('❌ Data URL image failed for:', product.name, e)}
                />
              );
            }
            
            // If it's a URL, use Next.js Image
            return (
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={500}
                className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-500"
                onLoad={() => console.log('✅ Next.js Image loaded for:', product.name)}
                onError={(e) => console.error('❌ Next.js Image failed for:', product.name, e)}
              />
            );
          })()}
        </Link>
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full">
            -{discountPercentage}%
          </div>
        )}

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Out of Stock
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Add to Cart Button - Hidden on mobile for better UX */}
        <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 items-center justify-center opacity-0 group-hover:opacity-100">
          <button 
            onClick={handleAddToCartClick}
            className="bg-white text-black px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 text-sm shadow-lg"
            disabled={!product.inStock}
          >
            <ShoppingCart size={16} />
            <span>{t('products.addToCart')}</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <Link href={!product.stock ? `/made-to-order/${product.id}` : `/product/${product.id}`}>
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-white transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating and Made-to-Order Badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={`${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          {product.isMadeToOrder && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Made to Order
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xl font-black text-white">{Number(product.price).toFixed(0)} DA</div>
          {product.originalPrice && (
            <div className="text-xs text-gray-400 line-through">
              {Number(product.originalPrice).toFixed(0)} DA
            </div>
          )}
        </div>

        {/* Buy Button */}
        <div className="space-y-2">
          <Link href={!product.stock ? `/made-to-order/${product.id}` : `/product/${product.id}`}>
            <button 
              className="w-full bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg font-semibold hover:bg-white/20 transition-colors text-xs touch-target"
            >
              {t('products.viewProduct')}
            </button>
          </Link>
        </div>
      </div>

      {/* Size Selection Modal */}
      <SizeSelectionModal
        product={product}
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        onBuy={handleModalAction}
        actionType={modalActionType}
      />
    </div>
  );
}
