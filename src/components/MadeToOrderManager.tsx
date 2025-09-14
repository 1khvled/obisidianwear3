'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  Package,
  Palette,
  Ruler,
  Tag,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  ShoppingCart
} from 'lucide-react';
import { MadeToOrderProduct, MadeToOrderOrder } from '@/types';

interface MadeToOrderManagerProps {
  onClose?: () => void;
}

export default function MadeToOrderManager({ onClose }: MadeToOrderManagerProps) {
  const [products, setProducts] = useState<MadeToOrderProduct[]>([]);
  const [orders, setOrders] = useState<MadeToOrderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MadeToOrderProduct | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<MadeToOrderProduct>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    images: [],
    colors: ['Noir'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Custom',
    tags: [],
    isActive: true,
    displayOrder: 0
  });
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newTag, setNewTag] = useState('');

  // Helper function to get the best image source
  const getImageSrc = (product: MadeToOrderProduct) => {
    if (product.image && product.image.length > 100) {
      return product.image;
    }
    if (product.images && product.images.length > 0 && product.images[0].length > 100) {
      return product.images[0];
    }
    return null;
  };

  // Helper function to get product info for orders
  const getProductForOrder = (productId: string) => {
    const product = products.find(p => p.id === productId);
    console.log('🔍 Looking up product for order:', { productId, found: !!product, productsCount: products.length });
    if (!product) {
      console.warn('⚠️ Product not found for order:', productId, 'Available products:', products.map(p => p.id));
    }
    return product;
  };

  // Helper function to get product info from order data (if available)
  const getProductFromOrder = (order: any) => {
    // Check if order has embedded product data
    if (order.made_to_order_products) {
      return {
        id: order.made_to_order_products.id,
        name: order.made_to_order_products.name,
        image: order.made_to_order_products.image,
        images: order.made_to_order_products.images,
        description: order.made_to_order_products.description,
        price: order.made_to_order_products.price,
        colors: order.made_to_order_products.colors || [],
        sizes: order.made_to_order_products.sizes || [],
        category: order.made_to_order_products.category || '',
        isActive: order.made_to_order_products.isActive !== undefined ? order.made_to_order_products.isActive : true,
        displayOrder: order.made_to_order_products.displayOrder || 0,
        tags: order.made_to_order_products.tags || [],
        createdAt: order.made_to_order_products.createdAt || new Date(),
        updatedAt: order.made_to_order_products.updatedAt || new Date()
      };
    }
    // Fallback to lookup
    return getProductForOrder(order.productId);
  };

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const productsResponse = await fetch('/api/made-to-order');
      const productsData = await productsResponse.json();
      
      console.log('🔍 DEBUG: Made-to-order API response:', {
        success: productsData.success,
        dataType: typeof productsData.data,
        isArray: Array.isArray(productsData.data),
        dataLength: productsData.data?.length,
        fullResponse: productsData
      });
      
      // Handle the response properly
      const products = productsData.success && Array.isArray(productsData.data) ? productsData.data : [];
      
      console.log('✅ Loaded made-to-order products in manager:', products.length);
      console.log('🖼️ Product images in manager:', products.map((p: any) => ({ 
        id: p.id, 
        name: p.name, 
        hasImage: !!p.image, 
        imageLength: p.image?.length,
        hasImages: !!(p.images && p.images.length > 0),
        imagesLength: p.images?.length,
        firstImageLength: p.images?.[0]?.length
      })));
      setProducts(products);

      // Load orders
      const ordersResponse = await fetch('/api/made-to-order/orders');
      const ordersData = await ordersResponse.json();
      
      console.log('🔍 DEBUG: Made-to-order orders API response:', {
        success: ordersData.success,
        dataType: typeof ordersData.data,
        isArray: Array.isArray(ordersData.data),
        dataLength: ordersData.data?.length,
        fullResponse: ordersData
      });
      
      // Handle the response properly - orders API returns data directly
      const orders = Array.isArray(ordersData) ? ordersData : (ordersData.success && Array.isArray(ordersData.data) ? ordersData.data : []);
      
      console.log('✅ Loaded made-to-order orders in manager:', orders.length);
      console.log('📦 Order product IDs:', orders.map((o: any) => ({ orderId: o.id, productId: o.productId })));
      console.log('🔍 Order data structure:', orders[0] ? {
        hasProductData: !!orders[0].made_to_order_products,
        productData: orders[0].made_to_order_products,
        orderKeys: Object.keys(orders[0])
      } : 'No orders');
      setOrders(orders);
    } catch (error) {
      console.error('Error loading made-to-order data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      console.log('💾 Saving new product with image length:', newProduct.image?.length);
      const response = await fetch('/api/made-to-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        const createdProduct = await response.json();
        console.log('✅ Product saved successfully:', createdProduct.id);
        setProducts([...products, createdProduct]);
        setShowAddProduct(false);
        resetForm();
        alert('Product added successfully!');
      } else {
        console.error('❌ Failed to save product:', response.status);
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      console.log('💾 Updating product with image length:', editingProduct.image?.length);
      const response = await fetch('/api/made-to-order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        console.log('✅ Product updated successfully:', updatedProduct.id);
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
        setEditingProduct(null);
        alert('Product updated successfully!');
      } else {
        console.error('❌ Failed to update product:', response.status);
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/made-to-order?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
        alert('Product deleted successfully!');
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch('/api/made-to-order/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        alert('Order status updated successfully!');
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      image: '',
      images: [],
      colors: ['Noir'],
      sizes: ['S', 'M', 'L', 'XL'],
      category: 'Custom',
      tags: [],
      isActive: true,
      displayOrder: 0
    });
  };

  const addColor = () => {
    if (newColor.trim() && !newProduct.colors?.includes(newColor.trim())) {
      setNewProduct({
        ...newProduct,
        colors: [...(newProduct.colors || []), newColor.trim()]
      });
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setNewProduct({
      ...newProduct,
      colors: newProduct.colors?.filter(c => c !== color) || []
    });
  };

  const addSize = () => {
    if (newSize.trim() && !newProduct.sizes?.includes(newSize.trim())) {
      setNewProduct({
        ...newProduct,
        sizes: [...(newProduct.sizes || []), newSize.trim()]
      });
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    setNewProduct({
      ...newProduct,
      sizes: newProduct.sizes?.filter(s => s !== size) || []
    });
  };

  const addTag = () => {
    if (newTag.trim() && !newProduct.tags?.includes(newTag.trim())) {
      setNewProduct({
        ...newProduct,
        tags: [...(newProduct.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setNewProduct({
      ...newProduct,
      tags: newProduct.tags?.filter(t => t !== tag) || []
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'confirmed': return 'text-blue-400 bg-blue-900/20';
      case 'in_production': return 'text-orange-400 bg-orange-900/20';
      case 'ready': return 'text-green-400 bg-green-900/20';
      case 'shipped': return 'text-purple-400 bg-purple-900/20';
      case 'delivered': return 'text-emerald-400 bg-emerald-900/20';
      case 'cancelled': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-7xl h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Made to Order Management</h2>
            <p className="text-gray-400">Manage custom products and orders</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'products'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'orders'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5 inline mr-2" />
            Orders ({orders.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'products' && (
            <div>
              {/* Add Product Button */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Made to Order Products</h3>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg mb-2">{product.name}</h4>
                        <p className="text-gray-400 text-sm mb-2">{product.description}</p>
                        <p className="text-blue-400 font-bold text-xl">{product.price} DZD</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {getImageSrc(product) && (
                      <div className="mb-4">
                        {getImageSrc(product)?.startsWith('data:') ? (
                          <img
                            src={getImageSrc(product)!}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-lg"
                            onLoad={() => console.log('✅ Image loaded in manager for product:', product.name)}
                            onError={(e) => console.error('❌ Image failed to load in manager for product:', product.name, e)}
                          />
                        ) : (
                          <Image
                            src={getImageSrc(product)!}
                            alt={product.name}
                            width={400}
                            height={300}
                            className="w-full h-32 object-cover rounded-lg"
                            onLoad={() => console.log('✅ Image loaded in manager for product:', product.name)}
                            onError={(e) => console.error('❌ Image failed to load in manager for product:', product.name, e)}
                          />
                        )}
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-400">
                        <Palette className="w-4 h-4 mr-2" />
                        <span>{product.colors.join(', ')}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Ruler className="w-4 h-4 mr-2" />
                        <span>{product.sizes.join(', ')}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Tag className="w-4 h-4 mr-2" />
                        <span>{product.category}</span>
                      </div>
                      <div className="flex items-center">
                        {product.isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                        )}
                        <span className={product.isActive ? 'text-green-400' : 'text-red-400'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No products yet</h3>
                  <p className="text-gray-400">Add your first made-to-order product to get started.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Made to Order Orders</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left text-white font-medium py-3 px-4">Order ID</th>
                      <th className="text-left text-white font-medium py-3 px-4">Customer</th>
                      <th className="text-left text-white font-medium py-3 px-4">Product</th>
                      <th className="text-left text-white font-medium py-3 px-4">Size/Color</th>
                      <th className="text-left text-white font-medium py-3 px-4">Total</th>
                      <th className="text-left text-white font-medium py-3 px-4">Status</th>
                      <th className="text-left text-white font-medium py-3 px-4">Date</th>
                      <th className="text-left text-white font-medium py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-gray-800">
                        <td className="py-3 px-4 text-white font-mono">#{order.id.slice(-8)}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-white font-medium">{order.customerName}</div>
                            <div className="text-gray-400 text-xs">{order.customerPhone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {(() => {
                            // Show loading state if products are still loading
                            if (loading) {
                              return (
                                <div className="text-gray-400">
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                                    <span>Loading...</span>
                                  </div>
                                </div>
                              );
                            }
                            
                            const product = getProductFromOrder(order);
                            if (product) {
                              return (
                                <div className="flex items-center space-x-3">
                                  {getImageSrc(product) && (
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                      {getImageSrc(product)?.startsWith('data:') ? (
                                        <img
                                          src={getImageSrc(product)!}
                                          alt={product.name}
                                          className="w-full h-full object-cover"
                                          onLoad={() => console.log('✅ Order product image loaded:', product.name)}
                                          onError={(e) => console.error('❌ Order product image failed to load:', product.name, e)}
                                        />
                                      ) : (
                                        <Image
                                          src={getImageSrc(product)!}
                                          alt={product.name}
                                          width={48}
                                          height={48}
                                          className="w-full h-full object-cover"
                                          onLoad={() => console.log('✅ Order product image loaded:', product.name)}
                                          onError={(e) => console.error('❌ Order product image failed to load:', product.name, e)}
                                        />
                                      )}
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-white font-medium">{product.name}</div>
                                    <div className="text-gray-400 text-xs">ID: {order.productId}</div>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div className="text-gray-400">
                                <div className="flex items-center space-x-2">
                                  <Package className="w-4 h-4" />
                                  <span>Product not found</span>
                                </div>
                                <div className="text-xs mt-1">ID: {order.productId}</div>
                                <div className="text-xs text-gray-500">Loading products...</div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">{order.selectedSize}</div>
                          <div className="text-gray-400 text-xs">{order.selectedColor}</div>
                        </td>
                        <td className="py-3 px-4 text-white">{order.totalPrice} DZD</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_production">In Production</option>
                            <option value="ready">Ready</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {orders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                  <p className="text-gray-400">Orders will appear here when customers place made-to-order requests.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">Add Made to Order Product</h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Price (DZD)</label>
                  <input
                    type="number"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  rows={3}
                  placeholder="Enter product description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <input
                    type="text"
                    value={newProduct.category || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="e.g., Hoodies, T-Shirts"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Display Order</label>
                  <input
                    type="number"
                    value={newProduct.displayOrder || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Main Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result as string;
                        console.log('📸 New product image uploaded, length:', result?.length);
                        setNewProduct({ ...newProduct, image: result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                {newProduct.image && (
                  <div className="mt-2">
                    <img src={newProduct.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              {/* Multiple Images */}
              <div>
                <label className="block text-white font-medium mb-2">Additional Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      const newImages: string[] = [];
                      files.forEach((file) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          newImages.push(event.target?.result as string);
                          if (newImages.length === files.length) {
                            setNewProduct({ ...newProduct, images: [...(newProduct.images || []), ...newImages] });
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                />
                {newProduct.images && newProduct.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newProduct.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img src={img} alt={`Preview ${index + 1}`} className="w-16 h-16 object-cover rounded-lg" />
                        <button
                          onClick={() => {
                            const updatedImages = newProduct.images?.filter((_, i) => i !== index) || [];
                            setNewProduct({ ...newProduct, images: updatedImages });
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Colors */}
              <div>
                <label className="block text-white font-medium mb-2">Colors</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProduct.colors?.map((color) => (
                    <span
                      key={color}
                      className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {color}
                      <button
                        onClick={() => removeColor(color)}
                        className="ml-2 text-blue-200 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Add color"
                  />
                  <button
                    onClick={addColor}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-white font-medium mb-2">Sizes</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProduct.sizes?.map((size) => (
                    <span
                      key={size}
                      className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {size}
                      <button
                        onClick={() => removeSize(size)}
                        className="ml-2 text-green-200 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Add size"
                  />
                  <button
                    onClick={addSize}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProduct.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-purple-200 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Add tag"
                  />
                  <button
                    onClick={addTag}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newProduct.isActive || false}
                  onChange={(e) => setNewProduct({ ...newProduct, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-white">
                  Product is active
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 p-6 border-t border-gray-800">
              <button
                onClick={() => setShowAddProduct(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">Edit Product</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Price (DZD)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="e.g., Hoodies, T-Shirts"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Display Order</label>
                  <input
                    type="number"
                    value={editingProduct.displayOrder}
                    onChange={(e) => setEditingProduct({ ...editingProduct, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Main Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          console.log('📸 Edit product image uploaded, length:', result?.length);
                          setEditingProduct({ ...editingProduct, image: result });
                        };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                {editingProduct.image && (
                  <div className="mt-2">
                    <img src={editingProduct.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              {/* Multiple Images */}
              <div>
                <label className="block text-white font-medium mb-2">Additional Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      const newImages: string[] = [];
                      files.forEach((file) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          newImages.push(event.target?.result as string);
                          if (newImages.length === files.length) {
                            setEditingProduct({ ...editingProduct, images: [...(editingProduct.images || []), ...newImages] });
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                />
                {editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editingProduct.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img src={img} alt={`Preview ${index + 1}`} className="w-16 h-16 object-cover rounded-lg" />
                        <button
                          onClick={() => {
                            const updatedImages = editingProduct.images?.filter((_, i) => i !== index) || [];
                            setEditingProduct({ ...editingProduct, images: updatedImages });
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Colors */}
              <div>
                <label className="block text-white font-medium mb-2">Colors</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editingProduct.colors?.map((color) => (
                    <span
                      key={color}
                      className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {color}
                      <button
                        onClick={() => {
                          const updatedColors = editingProduct.colors?.filter(c => c !== color) || [];
                          setEditingProduct({ ...editingProduct, colors: updatedColors });
                        }}
                        className="ml-2 text-blue-200 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Add color"
                  />
                  <button
                    onClick={() => {
                      if (newColor.trim() && !editingProduct.colors?.includes(newColor.trim())) {
                        const updatedColors = [...(editingProduct.colors || []), newColor.trim()];
                        setEditingProduct({ ...editingProduct, colors: updatedColors });
                        setNewColor('');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-white font-medium mb-2">Sizes</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editingProduct.sizes?.map((size) => (
                    <span
                      key={size}
                      className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {size}
                      <button
                        onClick={() => {
                          const updatedSizes = editingProduct.sizes?.filter(s => s !== size) || [];
                          setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                        }}
                        className="ml-2 text-green-200 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Add size"
                  />
                  <button
                    onClick={() => {
                      if (newSize.trim() && !editingProduct.sizes?.includes(newSize.trim())) {
                        const updatedSizes = [...(editingProduct.sizes || []), newSize.trim()];
                        setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                        setNewSize('');
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editingProduct.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        onClick={() => {
                          const updatedTags = editingProduct.tags?.filter(t => t !== tag) || [];
                          setEditingProduct({ ...editingProduct, tags: updatedTags });
                        }}
                        className="ml-2 text-purple-200 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Add tag"
                  />
                  <button
                    onClick={() => {
                      if (newTag.trim() && !editingProduct.tags?.includes(newTag.trim())) {
                        const updatedTags = [...(editingProduct.tags || []), newTag.trim()];
                        setEditingProduct({ ...editingProduct, tags: updatedTags });
                        setNewTag('');
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editingProduct.isActive}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                />
                <label htmlFor="editIsActive" className="ml-2 text-white">
                  Product is active
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 p-6 border-t border-gray-800">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
