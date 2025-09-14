'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import OptimizedImage from '@/components/OptimizedImage';
import { useFastMadeToOrder } from '@/hooks/useFastMadeToOrder';
import { MadeToOrderProduct } from '@/types';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CustomOrderProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products: madeToOrderProducts, wilayaTariffs, loading } = useFastMadeToOrder();
  
  const [product, setProduct] = useState<MadeToOrderProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.id && madeToOrderProducts.length > 0) {
      const foundProduct = madeToOrderProducts.find(p => p.id === params.id);
      setProduct(foundProduct || null);
      
      if (foundProduct && foundProduct.colors.length > 0) {
        setSelectedColor(foundProduct.colors[0]);
      }
      if (foundProduct && foundProduct.sizes.length > 0) {
        setSelectedSize(foundProduct.sizes[0]);
      }
    }
  }, [params.id, madeToOrderProducts]);

  const handleOrder = () => {
    if (!product) return;
    
    // Navigate to made-to-order checkout page with product data
    const checkoutUrl = `/made-to-order-checkout?id=${product.id}&size=${selectedSize}&color=${selectedColor}`;
    router.push(checkoutUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => window.history.back()}
              className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
              <div className="aspect-square relative bg-gray-900 rounded-lg overflow-hidden">
                <OptimizedImage
                  src={images[selectedImage] || ''}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                      className={`aspect-square relative bg-gray-900 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-purple-500' : 'border-gray-700'
                      }`}
                  >
                      <OptimizedImage
                        src={image || ''}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    </button>
                ))}
              </div>
            )}
          </div>

            {/* Product Info */}
            <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
                <p className="text-3xl font-bold text-purple-400 mb-6">{product.price} DZD</p>
                <p className="text-gray-300 text-lg leading-relaxed">{product.description}</p>
            </div>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
            <div>
                  <h3 className="text-white font-bold mb-3">Colors</h3>
                  <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded border-2 transition-colors ${
                      selectedColor === color
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
            <div>
                  <h3 className="text-white font-bold mb-3">Sizes</h3>
                  <div className="flex gap-2">
                    {product.sizes.map((size) => (
                <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded border-2 transition-colors ${
                          selectedSize === size
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {size}
                </button>
                    ))}
                </div>
              </div>
              )}

            {/* Order Button */}
              <div className="pt-6">
            <button
                  onClick={handleOrder}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-3"
            >
                  <ShoppingBag className="w-5 h-5" />
                  Order This Product
            </button>
              </div>

              {/* Product Details */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-white font-bold mb-4">Product Details</h3>
                <div className="space-y-2 text-gray-300">
                  <p><strong>Category:</strong> {product.category}</p>
                  <p><strong>Delivery:</strong> 20-25 days</p>
                  <p><strong>Payment:</strong> 50% upfront by CCP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
          </div>
    </div>
  );
}
