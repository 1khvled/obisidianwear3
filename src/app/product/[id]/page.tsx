'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProducts } from '@/context/SmartProductProvider';
import { useCart } from '@/context/CartContext';
import { useDesign } from '@/context/DesignContext';
import { Product } from '@/types';
import { recentlyViewedService } from '@/lib/recentlyViewed';
import { Star, ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Ruler, Package, RefreshCw } from 'lucide-react';
import SizeChart from '@/components/SizeChart';
import GlobalDesignToggle from '@/components/GlobalDesignToggle';

export default function ProductDetailPage() {
  const { isStreetwear } = useDesign();
  const params = useParams();
  const router = useRouter();
  const { getProduct, products } = useProducts();
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [realTimeStock, setRealTimeStock] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  // Fetch real-time stock data from products table (optimized)
  const fetchRealTimeStock = async (productId: string, forceRefresh = false) => {
    if (!productId) return;
    
    setStockLoading(true);
    try {
      // Use cache for faster loading, only bust cache when force refresh
      const url = forceRefresh 
        ? `/api/products/${productId}?t=${Date.now()}`
        : `/api/products/${productId}`;
      
      const response = await fetch(url, {
        cache: forceRefresh ? 'no-store' : 'default',
        headers: forceRefresh ? {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } : {}
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('🔄 Fetched stock data:', responseData);
        
        if (responseData.success && responseData.data) {
          const productData = responseData.data;
          console.log('🔄 Product stock data:', productData.stock);
          setRealTimeStock(productData.stock);
          setProduct(prev => prev ? {
            ...prev,
            stock: productData.stock,
            ...productData
          } : productData);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching stock:', error);
    } finally {
      setStockLoading(false);
    }
  };

  useEffect(() => {
    const productId = params.id as string;
    if (productId) {
      const foundProduct = getProduct(productId);
      if (foundProduct) {
        setProduct(foundProduct);
        if (foundProduct.colors?.length > 0) setSelectedColor(foundProduct.colors[0]);
        if (foundProduct.sizes?.length > 0) setSelectedSize(foundProduct.sizes[0]);
        recentlyViewedService.addProduct(foundProduct);
        
        // Use initial stock data if available for faster loading
        if (foundProduct.stock) {
          console.log('🚀 Using initial stock data for faster loading:', foundProduct.stock);
          setRealTimeStock(foundProduct.stock);
        }
        
        // Still fetch fresh data but with cache for speed
        fetchRealTimeStock(productId, false);
      }
    }
  }, [params.id, getProduct]);

  // Refresh stock data every 2 minutes to stay up to date (less aggressive)
  useEffect(() => {
    const productId = params.id as string;
    if (!productId) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing stock data...');
      fetchRealTimeStock(productId, true); // Force refresh for auto-updates
    }, 120000); // 2 minutes instead of 30 seconds

    return () => clearInterval(interval);
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product || !selectedSize || !selectedColor) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(product, selectedSize, selectedColor, quantity);
      alert('Product added to cart!');
    } catch (error) {
      alert('Failed to add product to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getAvailableStock = (size: string, color: string) => {
    if (!realTimeStock || !realTimeStock[size] || !realTimeStock[size][color]) return 0;
    return realTimeStock[size][color];
  };

  const isSizeColorAvailable = (size: string, color: string) => {
    return getAvailableStock(size, color) > 0;
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Header />
        <div className="text-white">Loading...</div>
        <Footer />
        <GlobalDesignToggle />
      </div>
    );
  }

  if (isStreetwear) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Back button */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-3 mb-8 p-3 border-2 border-white hover:bg-white hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-black uppercase tracking-wider">BACK TO SHOP</span>
            </Link>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Images */}
              <div className="space-y-6">
                <div className="aspect-square bg-gray-900 border-2 border-white overflow-hidden">
                  <Image
                    src={product.images?.[selectedImage] || product.image || ''}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`aspect-square border-2 transition-colors ${
                          selectedImage === idx ? 'border-purple-500' : 'border-white'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} ${idx + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-8">
                {/* Title & Price */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-4xl font-black uppercase tracking-wider flex-1">{product.name}</h1>
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className="p-3 border-2 border-white hover:bg-purple-500 hover:border-purple-500 transition-colors"
                    >
                      <Heart className={`w-6 h-6 ${isLiked ? 'fill-current text-purple-500' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="text-4xl font-black text-purple-500 font-mono mb-4">
                    {product.price?.toFixed(0)} DZD
                  </div>
                  
                  <div className="bg-purple-500 text-black px-4 py-2 inline-block border-2 border-white">
                    <span className="font-black uppercase tracking-wider text-sm">LIMITED STOCK</span>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t-2 border-white pt-6">
                  <p className="text-gray-300 leading-relaxed text-lg">{product.description}</p>
                </div>

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-wider mb-4">COLOR</h3>
                    <div className="flex gap-3">
                      {product.colors.map((color) => {
                        const hasAnyStock = product.sizes?.some(size => getAvailableStock(size, color) > 0) || false;
                        return (
                          <button
                            key={color}
                            onClick={() => hasAnyStock && setSelectedColor(color)}
                            disabled={!hasAnyStock}
                            className={`px-6 py-3 border-2 font-bold uppercase tracking-wider transition-colors relative ${
                              selectedColor === color && hasAnyStock
                                ? 'bg-white text-black border-white'
                                : hasAnyStock
                                ? 'bg-black text-white border-white hover:bg-white hover:text-black'
                                : 'bg-red-900/50 text-red-400 border-red-500 cursor-not-allowed opacity-75'
                            }`}
                          >
                            {color}
                            {!hasAnyStock && (
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

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-lg uppercase tracking-wider">
                        SIZE
                        {stockLoading && (
                          <span className="ml-2 text-xs text-purple-400">
                            (Loading stock...)
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => fetchRealTimeStock(product.id, true)}
                          disabled={stockLoading}
                          className="text-purple-500 font-bold uppercase text-sm hover:underline disabled:text-gray-500"
                        >
                          {stockLoading ? 'REFRESHING...' : 'REFRESH STOCK'}
                        </button>
                        <button
                          onClick={() => setShowSizeChart(true)}
                          className="text-purple-500 font-bold uppercase text-sm hover:underline"
                        >
                          SIZE GUIDE
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {product.sizes.map((size) => {
                        const available = isSizeColorAvailable(size, selectedColor);
                        const stockCount = getAvailableStock(size, selectedColor);
                        return (
                          <button
                            key={size}
                            onClick={() => available && setSelectedSize(size)}
                            disabled={!available}
                            className={`aspect-square border-2 font-black uppercase transition-colors relative ${
                              selectedSize === size && available
                                ? 'bg-purple-500 text-black border-purple-500'
                                : available
                                ? 'bg-black text-white border-white hover:bg-white hover:text-black'
                                : 'bg-red-900/50 text-red-400 border-red-500 cursor-not-allowed opacity-75'
                            }`}
                          >
                            {size}
                            {!available && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">×</span>
                              </div>
                            )}
                            {available && stockCount <= 5 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-black text-xs font-bold">!</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <h3 className="font-black text-lg uppercase tracking-wider mb-4">QUANTITY</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 border-2 border-white hover:bg-white hover:text-black transition-colors font-black text-xl"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-black text-xl">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 border-2 border-white hover:bg-white hover:text-black transition-colors font-black text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Stock Status */}
                {selectedSize && selectedColor && (
                  <div className="bg-white/5 border border-white/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Stock Status:</span>
                      <div className="flex items-center gap-2">
                        {isSizeColorAvailable(selectedSize, selectedColor) ? (
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

                {/* Buttons */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedSize || !selectedColor || !isSizeColorAvailable(selectedSize, selectedColor) || isAddingToCart}
                      className="bg-black border-2 border-white text-white hover:bg-white hover:text-black disabled:bg-gray-600 disabled:text-gray-400 py-4 px-6 font-black text-lg uppercase tracking-wider transition-colors disabled:border-gray-600 flex items-center justify-center gap-2"
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ADDING...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          {!selectedSize || !selectedColor ? 'SELECT SIZE & COLOR' : 
                           !isSizeColorAvailable(selectedSize, selectedColor) ? 'OUT OF STOCK' : 
                           'ADD TO CART'}
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={async () => {
                        if (!selectedSize || !selectedColor || !isSizeColorAvailable(selectedSize, selectedColor)) return;
                        
                        setIsOrdering(true);
                        try {
                          // Store product data in sessionStorage
                          const productData = {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image || product.images?.[0],
                            description: product.description,
                            colors: product.colors,
                            sizes: product.sizes,
                            category: product.category,
                            type: 'collection',
                            selectedSize: selectedSize,
                            selectedColor: selectedColor,
                            quantity: quantity
                          };

                          sessionStorage.setItem('checkoutProduct', JSON.stringify(productData));
                          await router.push('/checkout');
                        } finally {
                          setIsOrdering(false);
                        }
                      }}
                      disabled={!selectedSize || !selectedColor || !isSizeColorAvailable(selectedSize, selectedColor) || isOrdering}
                      className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-black disabled:text-gray-400 py-4 px-6 font-black text-lg uppercase tracking-wider transition-colors border-2 border-white disabled:border-gray-600 flex items-center justify-center gap-2"
                    >
                      {isOrdering ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ORDERING...
                        </>
                      ) : (
                        <>
                          <Package className="w-5 h-5" />
                          {!selectedSize || !selectedColor ? 'SELECT SIZE & COLOR' : 
                           !isSizeColorAvailable(selectedSize, selectedColor) ? 'OUT OF STOCK' : 
                           'BUY NOW'}
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-4 border border-white">
                      <Shield className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                      <div className="text-xs font-bold uppercase">AUTHENTIC</div>
                    </div>
                    <div className="p-4 border border-white">
                      <Truck className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                      <div className="text-xs font-bold uppercase">FAST SHIP</div>
                    </div>
                    <div className="p-4 border border-white">
                      <RotateCcw className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                      <div className="text-xs font-bold uppercase">RETURNS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
        <GlobalDesignToggle />
        
        {showSizeChart && (
          <SizeChart
            isOpen={showSizeChart}
            onClose={() => setShowSizeChart(false)}
            category={product.category}
          />
        )}
      </div>
    );
  }

  // Classic design (keep original)
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to products</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-6">
              <div className="aspect-square bg-gray-900 rounded-2xl overflow-hidden">
                <Image
                  src={product.images?.[selectedImage] || product.image || ''}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === idx ? 'border-purple-500' : 'border-gray-700'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        width={150}
                        height={150}
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
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold flex-1">{product.name}</h1>
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current text-purple-500' : 'text-gray-400'}`} />
                  </button>
                </div>
                
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                  {product.price?.toFixed(0)} DZD
                </div>
                
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg px-4 py-2 inline-block">
                  <span className="text-purple-300 font-medium">In Stock</span>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed">{product.description}</p>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Color</h3>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          selectedColor === color
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
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
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Size</h3>
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {product.sizes.map((size) => {
                      const available = isSizeColorAvailable(size, selectedColor);
                      return (
                        <button
                          key={size}
                          onClick={() => available && setSelectedSize(size)}
                          disabled={!available}
                          className={`aspect-square rounded-lg border transition-colors ${
                            selectedSize === size && available
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : available
                              ? 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                              : 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  
                  {selectedSize && selectedColor && (
                    <div className="mt-2 text-sm text-gray-400">
                      Available: {getAvailableStock(selectedSize, selectedColor)} units
                    </div>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !selectedColor || !isSizeColorAvailable(selectedSize, selectedColor) || isAddingToCart}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </button>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-green-400" />
                    <div className="text-xs text-gray-400">Authentic</div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <Truck className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                    <div className="text-xs text-gray-400">Fast Shipping</div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <RotateCcw className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                    <div className="text-xs text-gray-400">Easy Returns</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <GlobalDesignToggle />
      
      {showSizeChart && (
        <SizeChart
          isOpen={showSizeChart}
          onClose={() => setShowSizeChart(false)}
          category={product.category}
        />
      )}
    </div>
  );
}