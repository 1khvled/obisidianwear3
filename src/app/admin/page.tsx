'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Archive, 
  Settings, 
  ShoppingCart, 
  AlertTriangle, 
  MapPin,
  Plus,
  Edit,
  Trash2,
  X,
  Clock,
  CheckCircle,
  Loader2,
  Ruler,
  Home,
  LogOut
} from 'lucide-react';
import { Product, MadeToOrderProduct, Order, Customer, Wilaya } from '@/types';
import { backendService } from '@/services/backendService';
import { supabase, updateProduct } from '@/lib/supabaseDatabase';
import AdminLogin from '@/components/AdminLogin';
import EnhancedDashboard from '@/components/EnhancedDashboard';
import EnhancedProductManager from '@/components/EnhancedProductManager';
import SimpleInventoryManager from '@/components/SimpleInventoryManager';
import EnhancedOrderManager from '@/components/EnhancedOrderManager';
import MaintenanceManager from '@/components/MaintenanceManager';
import SizeChartEditor from '@/components/SizeChartEditor';
import SizeChart from '@/components/SizeChart';
import { useAuth } from '@/context/AuthContext';
import { useDesign } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminProducts } from '@/context/ProductContext';
import { useTheme } from '@/context/ThemeContext';
import MobileAdminLayout from '@/components/MobileAdminLayout';
import ProductSkeleton, { TableSkeleton } from '@/components/ProductSkeleton';
import ImageUpload from '@/components/ImageUpload';
import MultiImageUpload from '@/components/MultiImageUpload';
import { sortedWilayas } from '@/data/wilayas';
import { CATEGORIES } from '@/data/categories';
import MadeToOrderManager from '@/components/MadeToOrderManager';

export default function AdminPage() {
  const { isStreetwear } = useDesign();
  const { isAuthenticated, logout, username } = useAuth();
  const { t } = useLanguage();
  const { products, addProduct: addProductContext, updateProduct: updateProductContext, deleteProduct: deleteProductFromContext, initializeDefaultProducts, refreshProducts } = useAdminProducts();
  const { theme } = useTheme();
  
  // Core state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wilayaTariffs, setWilayaTariffs] = useState<(Wilaya & { tariff: number })[]>(sortedWilayas.map(w => ({ ...w, tariff: 0 })));
  const [orders, setOrders] = useState<Order[]>([]);
  const [madeToOrderOrders, setMadeToOrderOrders] = useState<any[]>([]);
  const [madeToOrderProducts, setMadeToOrderProducts] = useState<any[]>([]);
  const [showAddMadeToOrderProduct, setShowAddMadeToOrderProduct] = useState(false);
  const [editingMadeToOrderProduct, setEditingMadeToOrderProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dataCache, setDataCache] = useState<{
    orders?: Order[];
    madeToOrderProducts?: any[];
    madeToOrderOrders?: any[];
    wilayaTariffs?: (Wilaya & { tariff: number })[];
  }>({
    orders: undefined,
    madeToOrderProducts: undefined,
    madeToOrderOrders: undefined,
    wilayaTariffs: undefined
  });

  // Modal states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    stock: {},
    images: [],
    sizes: [],
    colors: [],
    inStock: true,
    customSizeChart: undefined,
    useCustomSizeChart: false,
    sizeChartCategory: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [showSizeChartEditor, setShowSizeChartEditor] = useState(false);

  // Load data only when switching to specific tabs
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;

    const loadTabData = async () => {
      try {
        setLoading(true);

        // Only load data for the current active tab
        if (activeTab === 'orders' && !dataCache.orders) {
          const savedOrders = await backendService.getOrders();
          setOrders(savedOrders);
          setDataCache(prev => ({ ...prev, orders: savedOrders }));
        }

        if (activeTab === 'made-to-order' && (!dataCache.madeToOrderProducts || !dataCache.madeToOrderOrders)) {
          const [productsResponse, ordersResponse] = await Promise.all([
            fetch('/api/made-to-order'),
            fetch('/api/made-to-order/orders')
          ]);

          const productsData = await productsResponse.json();
          const ordersData = await ordersResponse.json();
          
          const madeToOrderProducts = Array.isArray(productsData) ? productsData : (productsData?.data || []);
          const madeToOrderOrders = ordersData?.orders || [];
          
          setMadeToOrderProducts(madeToOrderProducts);
          setMadeToOrderOrders(madeToOrderOrders);
          setDataCache(prev => ({ 
            ...prev, 
            madeToOrderProducts, 
            madeToOrderOrders 
          }));
        }

        if (activeTab === 'wilaya' && !dataCache.wilayaTariffs) {
          const response = await fetch('/api/wilaya');
          const data = await response.json();
          const tariffs = data?.data || [];
          setWilayaTariffs(tariffs);
          setDataCache(prev => ({ ...prev, wilayaTariffs: tariffs }));
        }

      } catch (error) {
        console.error('Error loading tab data:', error);
      } finally {
        setLoading(false);
      }
    };

      loadTabData();
  }, [activeTab, isAuthenticated, dataCache]);

  // Handle add product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔧 Admin: handleAddProduct called');
    
    setLoading(true);
    
    try {
      const productToAdd = {
        ...newProduct,
        id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('🔧 Admin: handleAddProduct - productToAdd:', productToAdd);
      
      await addProductContext(productToAdd as Product);
      setShowAddProduct(false);
      setNewProduct({
        id: '',
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        stock: {},
        images: [],
        sizes: [],
        colors: [],
        inStock: true,
        customSizeChart: undefined,
        useCustomSizeChart: false,
        sizeChartCategory: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('❌ Admin: Error in handleAddProduct:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle update product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔧 Admin: handleUpdateProduct called');
    if (!editingProduct) return;
    
    setLoading(true);
    
    try {
      const updatedProduct = {
        ...editingProduct,
        ...newProduct,
        updatedAt: new Date()
      };
      
      console.log('🔧 Admin: handleUpdateProduct - updatedProduct:', updatedProduct);
      
      await updateProductContext(editingProduct.id, updatedProduct);
      setEditingProduct(null);
      setNewProduct({
        id: '',
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        stock: {},
        images: [],
        sizes: [],
        colors: [],
        inStock: true,
        customSizeChart: undefined,
        useCustomSizeChart: false,
        sizeChartCategory: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('❌ Admin: Error in handleUpdateProduct:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProductFromContext(id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Archive },
    { id: 'made-to-order', label: 'Made-to-Order', icon: Settings },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'maintenance', label: 'Maintenance', icon: AlertTriangle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EnhancedDashboard products={products} orders={orders} customers={[]} />;
      case 'products':
  return (
              <EnhancedProductManager
                products={products}
            onAddProduct={() => {
              console.log('🔧 Admin: Add Product button clicked!');
              setShowAddProduct(true);
            }} 
            onEditProduct={(product) => {
              console.log('🔧 Admin: Edit Product button clicked!');
              setEditingProduct(product);
              setNewProduct(product);
              setShowAddProduct(true);
            }} 
              onDeleteProduct={handleDeleteProduct}
              onViewProduct={(product) => console.log('View product:', product)}
            />
        );
      case 'inventory':
        return <SimpleInventoryManager onClose={() => setActiveTab('dashboard')} />;
      case 'made-to-order':
        return <MadeToOrderManager onClose={() => setActiveTab('dashboard')} />;
      case 'orders':
        return <EnhancedOrderManager orders={orders} />;
      case 'maintenance':
        return <MaintenanceManager />;
      default:
        return <EnhancedDashboard products={products} orders={orders} customers={[]} />;
    }
  };

    return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <div className="h-1 w-20 bg-purple-500"></div>
                </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {username}</span>
                    <button
              onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
            </div>
        </div>

      {/* Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === item.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
              </button>
              );
            })}
        </nav>
                  </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>

      {/* COMPLETE PRODUCT MODAL */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                  setNewProduct({
                    id: '',
                    name: '',
                    description: '',
                    price: 0,
                    category: '',
                    image: '',
                    stock: {},
                    images: [],
                    sizes: [],
                    colors: [],
                    inStock: true,
                    customSizeChart: undefined,
                    useCustomSizeChart: false,
                    sizeChartCategory: '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log('Form submitted!');
              if (editingProduct) {
                handleUpdateProduct(e);
              } else {
                handleAddProduct(e);
              }
            }} className="p-6 space-y-6">
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (DZD) *</label>
                  <input
                    type="number"
                    value={newProduct.price || 0}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter price"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <select
                  value={newProduct.category || ''}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Images</label>
                <div className="space-y-4">
                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Main Image</label>
                    <ImageUpload
                      value={newProduct.image || ''}
                      onChange={(imageUrl) => setNewProduct({...newProduct, image: imageUrl})}
                      placeholder="Enter image URL or upload"
                    />
                  </div>
                  
                  {/* Additional Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Additional Images</label>
                    <MultiImageUpload
                      value={newProduct.images || []}
                      onChange={(imageUrls) => setNewProduct({...newProduct, images: imageUrls})}
                      placeholder="Upload multiple images"
                      maxImages={5}
                    />
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const currentSizes = newProduct.sizes || [];
                        const newSizes = currentSizes.includes(size)
                          ? currentSizes.filter(s => s !== size)
                          : [...currentSizes, size];
                        setNewProduct({...newProduct, sizes: newSizes});
                      }}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        (newProduct.sizes || []).includes(size)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Available Colors</label>
                <div className="flex flex-wrap gap-2">
                  {['Black', 'White', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        const currentColors = newProduct.colors || [];
                        const newColors = currentColors.includes(color)
                          ? currentColors.filter(c => c !== color)
                          : [...currentColors, color];
                        setNewProduct({...newProduct, colors: newColors});
                      }}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        (newProduct.colors || []).includes(color)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Management */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Management</label>
                <div className="bg-gray-800 p-4 rounded-md">
                  <p className="text-sm text-gray-400 mb-2">
                    Stock will be automatically managed based on selected sizes and colors.
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={newProduct.inStock !== false}
                      onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="inStock" className="text-sm text-gray-300">
                      Product is in stock
                    </label>
                  </div>
                </div>
              </div>

              {/* Size Chart */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Size Chart</label>
                <button
                  type="button"
                  onClick={() => setShowSizeChartEditor(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Ruler className="w-4 h-4" />
                  Edit Size Chart
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setNewProduct({
                      id: '',
                      name: '',
                      description: '',
                      price: 0,
                      category: '',
                      image: '',
                      stock: {},
                      images: [],
                      sizes: [],
                      colors: [],
                      inStock: true,
                      customSizeChart: undefined,
                      useCustomSizeChart: false,
                      sizeChartCategory: '',
                      createdAt: new Date(),
                      updatedAt: new Date()
                    });
                  }}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      <SizeChart
        category={editingProduct ? (editingProduct.sizeChartCategory || editingProduct.category || 't-shirts') : 
                 (newProduct.sizeChartCategory || newProduct.category || 't-shirts')}
        isOpen={showSizeChartEditor}
        onClose={() => setShowSizeChartEditor(false)}
        customSizeChart={editingProduct?.customSizeChart ? {
                          ...editingProduct.customSizeChart,
                          category: editingProduct.sizeChartCategory || editingProduct.category || 't-shirts'
                        } : undefined}
        onSave={async (customSizeChart) => {
          try {
            if (editingProduct) {
              // Save to database
              const updatedProduct = await updateProduct(editingProduct.id, {
                customSizeChart: customSizeChart,
                useCustomSizeChart: true,
                sizeChartCategory: customSizeChart.category
              });
              
              if (updatedProduct) {
                setEditingProduct(updatedProduct);
                refreshProducts();
              }
            } else {
              // For new products, just update the local state
              setNewProduct(prev => ({
                ...prev,
                customSizeChart: customSizeChart,
                useCustomSizeChart: true,
                sizeChartCategory: customSizeChart.category
              }));
            }
            
            setShowSizeChartEditor(false);
          } catch (error) {
            console.error('Error saving size chart:', error);
          }
        }}
      />

    </div>
  );
}
