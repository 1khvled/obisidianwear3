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
import InventoryManager from '@/components/InventoryManager';
import EnhancedOrderManager from '@/components/EnhancedOrderManager';
import MaintenanceManager from '@/components/MaintenanceManager';
import SizeChartEditor from '@/components/SizeChartEditor';
import SizeChart from '@/components/SizeChart';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminProducts } from '@/context/ProductContext';
import { useTheme } from '@/context/ThemeContext';
import MobileAdminLayout from '@/components/MobileAdminLayout';
import ProductSkeleton, { TableSkeleton } from '@/components/ProductSkeleton';
import ImageUpload from '@/components/ImageUpload';
import MultiImageUpload from '@/components/MultiImageUpload';
import { sortedWilayas } from '@/data/wilayas';

export default function AdminPage() {
  const { isAuthenticated, logout, username } = useAuth();
  const { t } = useLanguage();
  const { products, addProduct: addProductContext, updateProduct: updateProductContext, deleteProduct: deleteProductContext, initializeDefaultProducts, refreshProducts } = useAdminProducts();
  const { theme } = useTheme();
  
  // Core state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wilayaTariffs, setWilayaTariffs] = useState<(Wilaya & { tariff: number })[]>(sortedWilayas.map(w => ({ ...w, tariff: 0 })));
  const [orders, setOrders] = useState<Order[]>([]);
  const [madeToOrderOrders, setMadeToOrderOrders] = useState<any[]>([]);
  const [madeToOrderProducts, setMadeToOrderProducts] = useState<any[]>([]);
  const [showAddMadeToOrderProduct, setShowAddMadeToOrderProduct] = useState(false);
  const [editingMadeToOrderProduct, setEditingMadeToOrderProduct] = useState<any>(null);
  const [newMadeToOrderProduct, setNewMadeToOrderProduct] = useState<any>({
    name: '',
    description: '',
    basePrice: 0,
    category: '',
    image: '',
    images: [],
    sizes: [],
    colors: [],
    allowCustomText: false,
    allowCustomDesign: false,
    customSizeChart: undefined,
    useCustomSizeChart: false,
    inStock: true,
    rating: 0,
    reviews: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Product>({
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
    rating: 0,
    reviews: 0,
    customSizeChart: undefined,
    useCustomSizeChart: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [loading, setLoading] = useState(false);
  const [showSizeChartEditor, setShowSizeChartEditor] = useState(false);
  const [showSizeChartEditorModal, setShowSizeChartEditorModal] = useState(false);

  // Navigation items - simplified
  const navigationItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    { id: 'products', icon: Package, label: 'Products', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
    { id: 'inventory', icon: Archive, label: 'Inventory', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
    { id: 'made-to-order', icon: Settings, label: 'Made to Order', color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    { id: 'maintenance', icon: AlertTriangle, label: 'Maintenance', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    { id: 'wilayas', icon: MapPin, label: 'Wilayas', color: 'text-red-400', bgColor: 'bg-red-500/20' }
  ];

  // Load all data
  useEffect(() => {
      const loadData = async () => {
        try {
          setLoading(true);

          // Load orders (skip during build time)
          if (typeof window !== 'undefined') {
            const savedOrders = await backendService.getOrders();
            setOrders(savedOrders);
          } else {
            console.log('Skipping orders load during build time');
            setOrders([]);
          }

            // Load made-to-order products (skip during build time)
            if (typeof window !== 'undefined') {
              const productsResponse = await fetch('/api/made-to-order');
              const madeToOrderProductsData = await productsResponse.json();
              setMadeToOrderProducts(madeToOrderProductsData);

              // Load made-to-order orders
              const ordersResponse = await fetch('/api/made-to-order/orders');
              if (!ordersResponse.ok) {
                console.error('❌ Failed to fetch made-to-order orders:', ordersResponse.status, ordersResponse.statusText);
                throw new Error(`Failed to fetch orders: ${ordersResponse.status}`);
              }
              const madeToOrderOrdersData = await ordersResponse.json();
        console.log('🔍 Admin Panel - Loaded made-to-order orders:', madeToOrderOrdersData.length);
        console.log('🔍 Admin Panel - Order data structure:', madeToOrderOrdersData[0] ? {
          id: madeToOrderOrdersData[0].id,
          customer_name: madeToOrderOrdersData[0].customer_name,
          product_name: madeToOrderOrdersData[0].made_to_order_products?.name,
          total_price: madeToOrderOrdersData[0].total_price,
          status: madeToOrderOrdersData[0].status
        } : 'No orders');
              setMadeToOrderOrders(madeToOrderOrdersData);
            } else {
              console.log('Skipping made-to-order data load during build time');
              setMadeToOrderProducts([]);
              setMadeToOrderOrders([]);
            }

            // Load wilaya tariffs (skip during build time)
            if (typeof window !== 'undefined') {
              const wilayaResponse = await fetch('/api/wilaya');
              const wilayaData = await wilayaResponse.json();
              console.log('🔧 Admin: Wilaya API response:', wilayaData);
              
              if (wilayaData && wilayaData.success && wilayaData.data && wilayaData.data.length > 0) {
                // Transform the data to match the expected format
                const transformedTariffs = wilayaData.data.map((tariff: any) => ({
                  id: tariff.wilaya_id || tariff.id,
                  name: tariff.name,
                  tariff: tariff.domicile_ecommerce || tariff.domicileEcommerce || 0, // Use domicile as default tariff
                  domicile_ecommerce: tariff.domicile_ecommerce || tariff.domicileEcommerce || 0,
                  stop_desk_ecommerce: tariff.stop_desk_ecommerce || tariff.stopDeskEcommerce || 0,
                  domicileEcommerce: tariff.domicile_ecommerce || tariff.domicileEcommerce || 0,
                  stopDeskEcommerce: tariff.stop_desk_ecommerce || tariff.stopDeskEcommerce || 0
                }));
                console.log('🔧 Admin: Transformed wilaya tariffs:', transformedTariffs);
                setWilayaTariffs(transformedTariffs);
              } else {
                console.log('⚠️ Admin: No wilaya data or invalid format, using defaults');
                setWilayaTariffs(sortedWilayas.map(w => ({ ...w, tariff: 0 })));
              }
            } else {
              console.log('Skipping wilaya data load during build time');
              setWilayaTariffs([]);
            }

        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Populate form when editing a product
  useEffect(() => {
    if (editingProduct) {
      console.log('🔍 Admin: Editing product with custom size chart data:', {
        id: editingProduct.id,
        name: editingProduct.name,
        customSizeChart: editingProduct.customSizeChart,
        useCustomSizeChart: editingProduct.useCustomSizeChart,
        sizeChartCategory: editingProduct.sizeChartCategory
      });
      
      setNewProduct({
        id: editingProduct.id,
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price || 0,
        category: editingProduct.category || '',
        image: editingProduct.image || '',
        stock: editingProduct.stock || {},
        images: editingProduct.images || [],
        sizes: editingProduct.sizes || [],
        colors: editingProduct.colors || [],
        inStock: editingProduct.inStock !== undefined ? editingProduct.inStock : true,
        rating: editingProduct.rating || 0,
        reviews: editingProduct.reviews || 0,
        customSizeChart: editingProduct.customSizeChart || undefined,
        useCustomSizeChart: editingProduct.useCustomSizeChart || false,
        sizeChartCategory: editingProduct.sizeChartCategory || editingProduct.category || 'T-Shirts',
        createdAt: editingProduct.createdAt || new Date(),
        updatedAt: editingProduct.updatedAt || new Date()
      });
    }
  }, [editingProduct]);

  // Handle add product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productData = {
        ...newProduct,
        id: Date.now().toString(), // Simple ID generation
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addProductContext(productData);
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
        customSizeChart: undefined,
        inStock: true,
        rating: 0,
        reviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle update product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setLoading(true);
    
    try {
      const updatedProduct = {
        ...editingProduct,
        ...newProduct,
        updatedAt: new Date()
      };
      
      console.log('🔧 Admin: handleUpdateProduct - updatedProduct:', {
        id: updatedProduct.id,
        name: updatedProduct.name,
        customSizeChart: updatedProduct.customSizeChart,
        useCustomSizeChart: updatedProduct.useCustomSizeChart,
        sizeChartCategory: updatedProduct.sizeChartCategory
      });
      
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
        customSizeChart: undefined,
        inStock: true,
        rating: 0,
        reviews: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  // Made-to-Order Product Management Functions
  const handleAddMadeToOrderProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newMadeToOrderProduct.name.trim()) {
      alert('Product name is required');
        return;
      }

    try {
      setLoading(true);
      const productData = {
        name: newMadeToOrderProduct.name,
        description: newMadeToOrderProduct.description,
        price: newMadeToOrderProduct.basePrice,
        category: newMadeToOrderProduct.category,
        image: newMadeToOrderProduct.image || '',
        images: newMadeToOrderProduct.images || [],
        colors: newMadeToOrderProduct.colors || ['Noir'],
        sizes: newMadeToOrderProduct.sizes || ['S', 'M', 'L', 'XL'],
        tags: [],
        displayOrder: 0,
        isActive: newMadeToOrderProduct.isActive,
        customSizeChart: newMadeToOrderProduct.customSizeChart,
        useCustomSizeChart: newMadeToOrderProduct.useCustomSizeChart,
        sizeChartCategory: newMadeToOrderProduct.sizeChartCategory
      };

      console.log('💾 Adding made-to-order product with data:', {
        name: productData.name,
        hasImage: !!productData.image,
        imageLength: productData.image?.length,
        hasImages: !!(productData.images && productData.images.length > 0),
        imagesCount: productData.images?.length
      });

      const response = await fetch('/api/made-to-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const createdProduct = await response.json();
        console.log('✅ Product added successfully:', createdProduct.id);
        setMadeToOrderProducts(prev => [...prev, createdProduct]);
        
        setNewMadeToOrderProduct({
          name: '',
          description: '',
          basePrice: 0,
          category: '',
          image: '',
          images: [],
          sizes: [],
          colors: [],
          allowCustomText: false,
          allowCustomDesign: false,
          customSizeChart: undefined,
          inStock: true,
    rating: 0,
    reviews: 0,
    createdAt: new Date(),
    updatedAt: new Date()
        });
        setShowAddMadeToOrderProduct(false);
        alert('Product added successfully!');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to add product:', errorData);
        throw new Error(errorData.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding made-to-order product:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMadeToOrderProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!editingMadeToOrderProduct?.name?.trim()) {
      alert('Product name is required');
        return;
      }

    try {
      setLoading(true);
      const productData = {
        id: editingMadeToOrderProduct.id,
        name: editingMadeToOrderProduct.name,
        description: editingMadeToOrderProduct.description,
        price: editingMadeToOrderProduct.basePrice,
        category: editingMadeToOrderProduct.category,
        image: editingMadeToOrderProduct.image || '',
        images: editingMadeToOrderProduct.images || [],
        colors: editingMadeToOrderProduct.colors || ['Noir'],
        sizes: editingMadeToOrderProduct.sizes || ['S', 'M', 'L', 'XL'],
        tags: editingMadeToOrderProduct.tags || [],
        displayOrder: editingMadeToOrderProduct.displayOrder || 0,
        isActive: editingMadeToOrderProduct.isActive,
        customSizeChart: editingMadeToOrderProduct.customSizeChart,
        useCustomSizeChart: editingMadeToOrderProduct.useCustomSizeChart,
        sizeChartCategory: editingMadeToOrderProduct.sizeChartCategory
      };

      console.log('💾 Updating made-to-order product with data:', {
        id: productData.id,
        name: productData.name,
        hasImage: !!productData.image,
        imageLength: productData.image?.length,
        hasImages: !!(productData.images && productData.images.length > 0),
        imagesCount: productData.images?.length
      });

      const response = await fetch('/api/made-to-order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        console.log('✅ Product updated successfully:', updatedProduct.id);
        setMadeToOrderProducts(prev => 
          prev.map(p => p.id === editingMadeToOrderProduct.id ? updatedProduct : p)
        );
        setEditingMadeToOrderProduct(null);
        alert('Product updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to update product:', errorData);
        
        // Show specific error messages based on the error type
        if (response.status === 408) {
          alert(`⏰ Timeout Error: ${errorData.error}\n\nTry uploading smaller images or contact support.`);
        } else if (errorData.code === '57014') {
          alert(`⏰ Database Timeout: ${errorData.error}\n\nThis usually happens with large images. Try reducing image size.`);
        } else {
          alert(`❌ Update Failed: ${errorData.error}\n\nDetails: ${errorData.details || 'Unknown error'}`);
        }
        return;
      }
    } catch (error) {
      console.error('Error updating made-to-order product:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          alert('⏰ Request timeout - please try again with smaller images');
        } else {
          alert(`❌ Error: ${error.message}`);
        }
      } else {
        alert('❌ Error updating product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMadeToOrderProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
      try {
      setLoading(true);
        const response = await fetch(`/api/made-to-order?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setMadeToOrderProducts(prev => prev.filter(p => p.id !== id));
        } else {
        throw new Error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting made-to-order product:', error);
        alert('Error deleting product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Order management functions
  const handleDeleteMadeToOrderOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
      try {
      setLoading(true);
        const response = await fetch(`/api/made-to-order/orders?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setMadeToOrderOrders(prev => prev.filter(o => o.id !== id));
        } else {
        throw new Error('Failed to delete order');
        }
      } catch (error) {
        console.error('Error deleting made-to-order order:', error);
        alert('Error deleting order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMadeToOrderOrder = async (id: string, status: string, notes?: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/made-to-order/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setMadeToOrderOrders(prev => 
          prev.map(o => o.id === id ? updatedOrder : o)
        );
      } else {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating made-to-order order:', error);
      alert('Error updating order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      setLoading(true);
      await backendService.deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      } catch (error) {
        console.error('Error deleting order:', error);
      alert('Error deleting order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Wilaya management functions
  const handleUpdateWilayaTariff = async (wilayaId: string, newTariff: number) => {
    try {
      setLoading(true);
      console.log('🔧 Admin: Updating wilaya tariff:', { wilayaId, newTariff });
      
      const response = await fetch('/api/wilaya', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wilayaId, 
          domicile_ecommerce: newTariff,
          stop_desk_ecommerce: newTariff * 0.8 // Stop desk is usually cheaper
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔧 Admin: Wilaya update result:', result);
        
        setWilayaTariffs(prev => 
          prev.map(w => w.id === parseInt(wilayaId) ? { 
            ...w, 
            tariff: newTariff,
            domicile_ecommerce: newTariff,
            domicileEcommerce: newTariff,
            stop_desk_ecommerce: newTariff * 0.8,
            stopDeskEcommerce: newTariff * 0.8
          } : w)
        );
        alert('Tariff updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('❌ Admin: Wilaya update failed:', errorData);
        throw new Error(errorData.error || 'Failed to update tariff');
      }
    } catch (error) {
      console.error('Error updating wilaya tariff:', error);
      alert('Error updating tariff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const renderContent = () => {
    if (loading && products.length === 0) {
  return (
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-32 mb-6"></div>
            <TableSkeleton rows={5} columns={6} />
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <EnhancedDashboard products={products} orders={orders} customers={[]} />}
        
        {activeTab === 'products' && (
          <div className="p-4 sm:p-6 space-y-8">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Products</h2>
            </div>
              <EnhancedProductManager
                products={products}
                onAddProduct={() => setShowAddProduct(true)}
              onEditProduct={(product) => setEditingProduct(product)}
              onDeleteProduct={deleteProductContext}
              onViewProduct={(product) => console.log('View product:', product)}
            />
            </div>
        )}

        {activeTab === 'inventory' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Inventory Management</h2>
              <p className="text-gray-400">Manage product inventory and stock levels</p>
                  </div>
            <InventoryManager onClose={() => setActiveTab('dashboard')} />
                    </div>
        )}


        {activeTab === 'orders' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Order Management</h2>
              <p className="text-gray-400">View and manage customer orders</p>
                    </div>
            <EnhancedOrderManager 
              orders={orders}
              onUpdateOrder={(id, updates) => {
                // Update order logic here
                console.log('Update order:', id, updates);
              }}
              onDeleteOrder={handleDeleteOrder}
              onViewOrder={(order) => console.log('View order:', order)}
                      />
                    </div>
        )}
                    
        {activeTab === 'maintenance' && <MaintenanceManager />}

        {activeTab === 'made-to-order' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                    <div>
                <h2 className="text-2xl font-bold text-white">Made to Order</h2>
                <p className="text-gray-400">Manage custom products and orders</p>
              </div>
                    </div>
                    
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-gray-400 text-sm">Custom Products</p>
                    <p className="text-2xl font-bold text-white">{madeToOrderProducts.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
                    </div>
                    
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-gray-400 text-sm">Production Time</p>
                    <p className="text-2xl font-bold text-yellow-400">20-18 days</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
                    </div>
                    
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-gray-400 text-sm">Deposit Required</p>
                    <p className="text-2xl font-bold text-green-400">50%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
                    </div>
                    
            {/* Made-to-Order Products Management */}
            <div className="mb-8">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Made-to-Order Products ({madeToOrderProducts.length})</h2>
                      <button
                  onClick={() => setShowAddMadeToOrderProduct(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                  <Plus className="w-4 h-4" />
                        Add Product
                      </button>
                    </div>

              {/* Add/Edit Product Form */}
              {(showAddMadeToOrderProduct || editingMadeToOrderProduct) && (
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {editingMadeToOrderProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddMadeToOrderProduct(false);
                        setEditingMadeToOrderProduct(null);
                        setNewMadeToOrderProduct({
                          name: '',
                          description: '',
                          basePrice: 0,
                          category: '',
                          image: '',
                          images: [],
                          sizes: [],
                          colors: [],
                          allowCustomText: false,
                          allowCustomDesign: false,
                          customSizeChart: undefined,
                          useCustomSizeChart: false,
                          sizeChartCategory: '',
                          inStock: true,
                          rating: 0,
                          reviews: 0,
                          createdAt: new Date(),
                          updatedAt: new Date()
                        });
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={editingMadeToOrderProduct ? handleUpdateMadeToOrderProduct : handleAddMadeToOrderProduct} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                      <input
                        type="text"
                          value={editingMadeToOrderProduct?.name || newMadeToOrderProduct.name}
                          onChange={(e) => {
                            if (editingMadeToOrderProduct) {
                              setEditingMadeToOrderProduct({...editingMadeToOrderProduct, name: e.target.value});
                            } else {
                              setNewMadeToOrderProduct({...newMadeToOrderProduct, name: e.target.value});
                            }
                          }}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter product name"
                          required
                      />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                        <select
                          value={editingMadeToOrderProduct?.category || newMadeToOrderProduct.category}
                          onChange={(e) => {
                            if (editingMadeToOrderProduct) {
                              setEditingMadeToOrderProduct({
                                ...editingMadeToOrderProduct, 
                                category: e.target.value,
                                sizeChartCategory: e.target.value // Auto-set size chart category
                              });
                            } else {
                              setNewMadeToOrderProduct({
                                ...newMadeToOrderProduct, 
                                category: e.target.value,
                                sizeChartCategory: e.target.value // Auto-set size chart category
                              });
                            }
                          }}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="T-Shirts">T-Shirts</option>
                          <option value="Hoodies">Hoodies</option>
                          <option value="Pants">Pants</option>
                          <option value="Shorts">Shorts</option>
                          <option value="Jackets">Jackets</option>
                          <option value="Sweaters">Sweaters</option>
                          <option value="Dresses">Dresses</option>
                          <option value="Shoes">Shoes</option>
                          <option value="Watches">Watches</option>
                          <option value="Bulk Orders">Bulk Orders</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Size Chart Category</label>
                        <select
                          value={editingMadeToOrderProduct?.sizeChartCategory || newMadeToOrderProduct.sizeChartCategory || editingMadeToOrderProduct?.category || newMadeToOrderProduct.category}
                          onChange={(e) => {
                            if (editingMadeToOrderProduct) {
                              setEditingMadeToOrderProduct({...editingMadeToOrderProduct, sizeChartCategory: e.target.value});
                            } else {
                              setNewMadeToOrderProduct({...newMadeToOrderProduct, sizeChartCategory: e.target.value});
                            }
                          }}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="T-Shirts">T-Shirts</option>
                          <option value="Hoodies">Hoodies</option>
                          <option value="Pants">Pants</option>
                          <option value="Shorts">Shorts</option>
                          <option value="Jackets">Jackets</option>
                          <option value="Sweaters">Sweaters</option>
                          <option value="Dresses">Dresses</option>
                          <option value="Shoes">Shoes</option>
                          <option value="Watches">Watches</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Choose the size chart template to use for this product</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Base Price (DA) *</label>
                      <input
                        type="number"
                          value={editingMadeToOrderProduct?.basePrice || newMadeToOrderProduct.basePrice}
                          onChange={(e) => {
                            if (editingMadeToOrderProduct) {
                              setEditingMadeToOrderProduct({...editingMadeToOrderProduct, basePrice: parseFloat(e.target.value) || 0});
                            } else {
                              setNewMadeToOrderProduct({...newMadeToOrderProduct, basePrice: parseFloat(e.target.value) || 0});
                            }
                          }}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          required
                      />
                    </div>
                    
                      <div className="flex items-center">
                        <label className="flex items-center">
                      <input
                            type="checkbox"
                            checked={editingMadeToOrderProduct?.isActive ?? newMadeToOrderProduct.isActive}
                        onChange={(e) => {
                              if (editingMadeToOrderProduct) {
                                setEditingMadeToOrderProduct({...editingMadeToOrderProduct, isActive: e.target.checked});
                              } else {
                                setNewMadeToOrderProduct({...newMadeToOrderProduct, isActive: e.target.checked});
                              }
                            }}
                            className="mr-2 w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-300">Active Product</span>
                        </label>
                    </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                      <textarea
                        value={editingMadeToOrderProduct?.description || newMadeToOrderProduct.description}
                        onChange={(e) => {
                          if (editingMadeToOrderProduct) {
                            setEditingMadeToOrderProduct({...editingMadeToOrderProduct, description: e.target.value});
                          } else {
                            setNewMadeToOrderProduct({...newMadeToOrderProduct, description: e.target.value});
                          }
                        }}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Describe the product, materials, customization options..."
                        required
                      />
                    </div>
                    
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Product Images</label>
                      <div className="space-y-4">
                        {/* File Upload */}
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Upload Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Validate file size (max 5MB)
                                if (file.size > 5 * 1024 * 1024) {
                                  alert('Image file is too large. Please choose an image smaller than 5MB.');
                                  return;
                                }
                                
                                // Validate file type
                                if (!file.type.startsWith('image/')) {
                                  alert('Please select a valid image file.');
                                  return;
                                }
                                
                                console.log('📸 Processing image upload:', {
                                  name: file.name,
                                  size: file.size,
                                  type: file.type
                                });
                                
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  console.log('📸 Made-to-order image uploaded, length:', result?.length);
                                  if (editingMadeToOrderProduct) {
                                    setEditingMadeToOrderProduct({...editingMadeToOrderProduct, image: result});
                                  } else {
                                    setNewMadeToOrderProduct({...newMadeToOrderProduct, image: result});
                                  }
                                };
                                reader.onerror = () => {
                                  console.error('❌ Error reading image file');
                                  alert('Error reading image file. Please try again.');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                          />
                          <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP</p>
                        </div>


                        {/* Image Preview */}
                        {(editingMadeToOrderProduct?.image || newMadeToOrderProduct.image) && (
                          <div className="mt-2">
                            <img
                              src={editingMadeToOrderProduct?.image || newMadeToOrderProduct.image}
                              alt="Product preview"
                              className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* Multiple Images Upload */}
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Additional Images</label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                // Validate files
                                const validFiles = files.filter(file => {
                                  if (file.size > 5 * 1024 * 1024) {
                                    console.warn(`⚠️ File ${file.name} is too large (${file.size} bytes)`);
                                    return false;
                                  }
                                  if (!file.type.startsWith('image/')) {
                                    console.warn(`⚠️ File ${file.name} is not a valid image`);
                                    return false;
                                  }
                                  return true;
                                });
                                
                                if (validFiles.length !== files.length) {
                                  alert(`Some files were skipped. Only valid image files under 5MB are accepted.`);
                                }
                                
                                if (validFiles.length === 0) return;
                                
                                console.log('📸 Processing multiple images:', validFiles.length);
                                
                                const newImages: string[] = [];
                                validFiles.forEach((file) => {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    newImages.push(event.target?.result as string);
                                    if (newImages.length === validFiles.length) {
                                      if (editingMadeToOrderProduct) {
                                        setEditingMadeToOrderProduct({
                                          ...editingMadeToOrderProduct, 
                                          images: [...(editingMadeToOrderProduct.images || []), ...newImages]
                                        });
                                      } else {
                                        setNewMadeToOrderProduct({
                                          ...newMadeToOrderProduct, 
                                          images: [...(newMadeToOrderProduct.images || []), ...newImages]
                                        });
                                      }
                                    }
                                  };
                                  reader.onerror = () => {
                                    console.error('❌ Error reading image file:', file.name);
                                  };
                                  reader.readAsDataURL(file);
                                });
                              }
                            }}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                          />
                          <p className="text-xs text-gray-500 mt-1">Select multiple images. Max 5MB each.</p>
                          
                          {/* Display additional images */}
                          {((editingMadeToOrderProduct?.images && editingMadeToOrderProduct.images.length > 0) || 
                            (newMadeToOrderProduct.images && newMadeToOrderProduct.images.length > 0)) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(editingMadeToOrderProduct?.images || newMadeToOrderProduct.images || []).map((img: string, index: number) => (
                                <div key={index} className="relative">
                                  <img 
                                    src={img} 
                                    alt={`Preview ${index + 1}`} 
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-600" 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentImages = editingMadeToOrderProduct?.images || newMadeToOrderProduct.images || [];
                                      const updatedImages = currentImages.filter((_: string, i: number) => i !== index);
                                      if (editingMadeToOrderProduct) {
                                        setEditingMadeToOrderProduct({...editingMadeToOrderProduct, images: updatedImages});
                                      } else {
                                        setNewMadeToOrderProduct({...newMadeToOrderProduct, images: updatedImages});
                                      }
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Available Sizes */}
                <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Available Sizes</label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {(editingMadeToOrderProduct?.sizes || newMadeToOrderProduct.sizes || []).map((size: string, index: number) => (
                            <div key={index} className="flex items-center bg-gray-700 rounded-lg px-3 py-1">
                              <span className="text-sm text-gray-300 mr-2">{size}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentSizes = editingMadeToOrderProduct?.sizes || newMadeToOrderProduct.sizes || [];
                                  const newSizes = currentSizes.filter((_: string, i: number) => i !== index);
                                  
                                  if (editingMadeToOrderProduct) {
                                    setEditingMadeToOrderProduct({...editingMadeToOrderProduct, sizes: newSizes});
                                  } else {
                                    setNewMadeToOrderProduct({...newMadeToOrderProduct, sizes: newSizes});
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add size (e.g., S, M, L, XL)"
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                const newSize = input.value.trim();
                                if (newSize) {
                                  const currentSizes = editingMadeToOrderProduct?.sizes || newMadeToOrderProduct.sizes || [];
                                  if (!currentSizes.includes(newSize)) {
                                    const newSizes = [...currentSizes, newSize];
                                    
                                    if (editingMadeToOrderProduct) {
                                      setEditingMadeToOrderProduct({...editingMadeToOrderProduct, sizes: newSizes});
                                    } else {
                                      setNewMadeToOrderProduct({...newMadeToOrderProduct, sizes: newSizes});
                                    }
                                  }
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                              const newSize = input.value.trim();
                              if (newSize) {
                                const currentSizes = editingMadeToOrderProduct?.sizes || newMadeToOrderProduct.sizes || [];
                                if (!currentSizes.includes(newSize)) {
                                  const newSizes = [...currentSizes, newSize];
                                  
                                  if (editingMadeToOrderProduct) {
                                    setEditingMadeToOrderProduct({...editingMadeToOrderProduct, sizes: newSizes});
                                  } else {
                                    setNewMadeToOrderProduct({...newMadeToOrderProduct, sizes: newSizes});
                                  }
                                }
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
            </div>

                    {/* Available Colors */}
              <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Available Colors</label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {(editingMadeToOrderProduct?.colors || newMadeToOrderProduct.colors || []).map((color: string, index: number) => (
                            <div key={index} className="flex items-center bg-gray-700 rounded-lg px-3 py-1">
                              <span className="text-sm text-gray-300 mr-2">{color}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentColors = editingMadeToOrderProduct?.colors || newMadeToOrderProduct.colors || [];
                                  const newColors = currentColors.filter((_: string, i: number) => i !== index);
                                  
                                  if (editingMadeToOrderProduct) {
                                    setEditingMadeToOrderProduct({...editingMadeToOrderProduct, colors: newColors});
                                  } else {
                                    setNewMadeToOrderProduct({...newMadeToOrderProduct, colors: newColors});
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add color (e.g., Black, White, Red)"
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                const newColor = input.value.trim();
                                if (newColor) {
                                  const currentColors = editingMadeToOrderProduct?.colors || newMadeToOrderProduct.colors || [];
                                  if (!currentColors.includes(newColor)) {
                                    const newColors = [...currentColors, newColor];
                                    
                                    if (editingMadeToOrderProduct) {
                                      setEditingMadeToOrderProduct({...editingMadeToOrderProduct, colors: newColors});
                                    } else {
                                      setNewMadeToOrderProduct({...newMadeToOrderProduct, colors: newColors});
                                    }
                                  }
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                              const newColor = input.value.trim();
                              if (newColor) {
                                const currentColors = editingMadeToOrderProduct?.colors || newMadeToOrderProduct.colors || [];
                                if (!currentColors.includes(newColor)) {
                                  const newColors = [...currentColors, newColor];
                                  
                                  if (editingMadeToOrderProduct) {
                                    setEditingMadeToOrderProduct({...editingMadeToOrderProduct, colors: newColors});
                                  } else {
                                    setNewMadeToOrderProduct({...newMadeToOrderProduct, colors: newColors});
                                  }
                                }
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
            </div>

                    {/* Size Chart Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Size Chart Category</label>
                      <select
                        value={editingMadeToOrderProduct?.sizeChartCategory || newMadeToOrderProduct.sizeChartCategory || editingMadeToOrderProduct?.category || newMadeToOrderProduct.category}
                        onChange={(e) => {
                          if (editingMadeToOrderProduct) {
                            setEditingMadeToOrderProduct({...editingMadeToOrderProduct, sizeChartCategory: e.target.value});
                          } else {
                            setNewMadeToOrderProduct({...newMadeToOrderProduct, sizeChartCategory: e.target.value});
                          }
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="T-Shirts">T-Shirts</option>
                        <option value="Hoodies">Hoodies</option>
                        <option value="Pants">Pants</option>
                        <option value="Shorts">Shorts</option>
                        <option value="Jackets">Jackets</option>
                        <option value="Sweaters">Sweaters</option>
                        <option value="Dresses">Dresses</option>
                        <option value="Shoes">Shoes</option>
                        <option value="Watches">Watches</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Choose the size chart template to use for this product</p>
                    </div>

                    {/* Size Chart Editor Button */}
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
                      <p className="text-xs text-gray-400 mt-1">Click to edit the size chart for this product</p>
                    </div>
              

                    <div className="flex justify-end gap-2">
                  <button
                        type="button"
                    onClick={() => {
                          setShowAddMadeToOrderProduct(false);
                          setEditingMadeToOrderProduct(null);
                          setNewMadeToOrderProduct({
                            name: '',
                            description: '',
                            basePrice: 0,
                            category: '',
                            image: '',
                            images: [],
                            sizes: [],
                            colors: [],
                            allowCustomText: false,
                            allowCustomDesign: false,
                            customSizeChart: undefined,
                            useCustomSizeChart: false,
                            inStock: true,
                            rating: 0,
                            reviews: 0,
                            createdAt: new Date(),
                            updatedAt: new Date()
                          });
                        }}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                      >
                        Cancel
                  </button>
                  <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editingMadeToOrderProduct ? 'Update Product' : 'Add Product'}
                  </button>
            </div>
                  </form>
              </div>
              )}

              {/* Products List */}
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                  <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                    <tbody className="divide-y divide-gray-700">
                      {madeToOrderProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-700/50">
                          <td className="px-4 py-4">
                                  <div>
                                    <div className="text-white font-medium">{product.name}</div>
                              <div className="text-gray-400 text-sm truncate max-w-xs">{product.description}</div>
                                </div>
                              </td>
                          <td className="px-4 py-4 text-gray-300">{product.category || 'N/A'}</td>
                          <td className="px-4 py-4 text-gray-300">{product.basePrice} DA</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setEditingMadeToOrderProduct(product)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMadeToOrderProduct(product.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                  >
                                <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>

            {/* Made-to-Order Orders Management */}
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Made-to-Order Orders ({madeToOrderOrders.length})</h2>
                <button
                  onClick={() => {
                    const loadData = async () => {
                      try {
                        setLoading(true);
                        const ordersResponse = await fetch('/api/made-to-order/orders');
                        if (!ordersResponse.ok) {
                          console.error('❌ Failed to fetch made-to-order orders:', ordersResponse.status);
                          return;
                        }
                        const madeToOrderOrdersData = await ordersResponse.json();
                        console.log('🔄 Refreshed made-to-order orders:', madeToOrderOrdersData.length);
                        setMadeToOrderOrders(madeToOrderOrdersData);
                      } catch (error) {
                        console.error('Error refreshing orders:', error);
                      } finally {
                        setLoading(false);
                      }
                    };
                    loadData();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                  Refresh Orders
                </button>
                </div>

              {madeToOrderOrders.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                  <p className="text-gray-400">Orders will appear here when customers place made-to-order requests.</p>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                          <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Size/Color</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                      <tbody className="divide-y divide-gray-700">
                        {madeToOrderOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-700/50">
                            <td className="px-4 py-4 text-white font-mono">#{order.id.slice(-8)}</td>
                            <td className="px-4 py-4">
                                    <div>
                                <div className="text-white font-medium">{order.customer_name}</div>
                                <div className="text-gray-400 text-sm">{order.customer_phone}</div>
                                  </div>
                                </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-3">
                                {order.made_to_order_products?.image && (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                      src={order.made_to_order_products.image}
                                      alt={order.made_to_order_products.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <div className="text-white font-medium text-sm">{order.made_to_order_products?.name || 'Product not found'}</div>
                                  <div className="text-gray-400 text-xs">ID: {order.product_id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-white">{order.selected_size}</div>
                              <div className="text-gray-400 text-xs">{order.selected_color}</div>
                            </td>
                            <td className="px-4 py-4 text-gray-300">{order.total_price} DA</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'ready' ? 'bg-green-100 text-green-800' :
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                                </td>
                            <td className="px-4 py-4 text-gray-400">
                              {new Date(order.order_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateMadeToOrderOrder(order.id, e.target.value)}
                                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="ready">Ready</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                    <button
                                      onClick={() => handleDeleteMadeToOrderOrder(order.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                      title="Delete Order"
                                    >
                                  <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
              )}
            </div>
          </div>
        )}

          {activeTab === 'wilayas' && (
            <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Wilaya Tariffs</h2>
              <p className="text-gray-400">Manage delivery tariffs for each wilaya</p>
              </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Wilaya</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Tariff (DA)</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-gray-700">
                    {wilayaTariffs.map((wilaya) => (
                      <tr key={wilaya.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-4">
                            <div>
                              <div className="text-white font-medium">{wilaya.name}</div>
                            <div className="text-gray-400 text-xs">#{wilaya.id}</div>
                            </div>
                          </td>
                        <td className="px-4 py-4 text-center">
                            <input
                              type="number"
                            value={wilaya.tariff}
                            onChange={(e) => {
                              const newTariff = parseFloat(e.target.value) || 0;
                              setWilayaTariffs(prev => 
                                prev.map(w => w.id === wilaya.id ? { ...w, tariff: newTariff } : w)
                              );
                            }}
                            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                            min="0"
                            step="0.01"
                            />
                          </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleUpdateWilayaTariff(wilaya.id.toString(), wilaya.tariff)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                          </button>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
    );
  };

  // Mobile layout
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return (
      <MobileAdminLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        username={username}
      >
        {renderContent()}
      </MobileAdminLayout>
    );
  }

  // Desktop layout
  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-gray-50 via-white to-gray-100' 
        : 'bg-gradient-to-br from-gray-900 via-black to-gray-900'
    }`}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
                <div>
            <h1 className="text-xl font-bold text-white">OBSIDIAN</h1>
            <p className="text-gray-400 text-sm">Admin Dashboard</p>
                </div>
                    <button
              onClick={logout}
            className="text-gray-400 hover:text-white transition-colors"
                    >
            Logout
                    </button>
                </div>
              </div>

      {/* Sidebar */}
      <div className="lg:w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0">
        <div className="p-6">
          <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">OBSIDIAN</h1>
            <p className="text-gray-400 text-sm">Admin Dashboard</p>
            
            {/* Exit and Logout Buttons */}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                <Home className="w-4 h-4" />
                <span>Exit to Store</span>
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
        </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                  activeTab === item.id
                    ? `${item.bgColor} ${item.color}` 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon className={`w-5 h-5 mb-1 ${activeTab === item.id ? 'text-black' : item.color}`} />
                <span className="ml-3 font-medium">{item.label}</span>
              </button>
            ))}
        </nav>
        </div>

        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{username}</p>
              <p className="text-gray-400 text-sm">Administrator</p>
                    </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
                </div>
                  </div>
      </div>

      {/* Main Content */}
        {renderContent()}

      {/* Add/Edit Product Modal */}
      {(showAddProduct || editingProduct) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
          <button
                onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ 
                      ...prev, 
                      category: e.target.value,
                      sizeChartCategory: e.target.value // Auto-set size chart category
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Pants">Pants</option>
                    <option value="Shorts">Shorts</option>
                    <option value="Jackets">Jackets</option>
                    <option value="Sweaters">Sweaters</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Size Chart Category</label>
                  <select
                    value={newProduct.sizeChartCategory || newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, sizeChartCategory: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Pants">Pants</option>
                    <option value="Shorts">Shorts</option>
                    <option value="Jackets">Jackets</option>
                    <option value="Sweaters">Sweaters</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Watches">Watches</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Choose the size chart template to use for this product</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (DA) *</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>

              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the product, materials, features..."
                  required
                />
              </div>

              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Main Product Image</label>
                <ImageUpload
                  value={newProduct.image}
                  onChange={(url) => setNewProduct(prev => ({ ...prev, image: url }))}
                  placeholder="Upload main product image"
                />
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Additional Images</label>
                <MultiImageUpload
                  value={newProduct.images || []}
                  onChange={(urls) => setNewProduct(prev => ({ ...prev, images: urls }))}
                  placeholder="Upload additional product images"
                  maxImages={5}
                />
              </div>

              {/* Available Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Available Sizes</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(newProduct.sizes || []).map((size: string, index: number) => (
                      <div key={index} className="flex items-center bg-gray-700 rounded-lg px-3 py-1">
                        <span className="text-sm text-gray-300 mr-2">{size}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentSizes = newProduct.sizes || [];
                            const newSizes = currentSizes.filter((_: string, i: number) => i !== index);
                            setNewProduct(prev => ({ ...prev, sizes: newSizes }));
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add size (e.g., S, M, L, XL)"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          const newSize = input.value.trim();
                          if (newSize) {
                            const currentSizes = newProduct.sizes || [];
                            if (!currentSizes.includes(newSize)) {
                              setNewProduct(prev => ({ ...prev, sizes: [...currentSizes, newSize] }));
                            }
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                        const newSize = input.value.trim();
                        if (newSize) {
                          const currentSizes = newProduct.sizes || [];
                          if (!currentSizes.includes(newSize)) {
                            setNewProduct(prev => ({ ...prev, sizes: [...currentSizes, newSize] }));
                          }
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Available Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Available Colors</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(newProduct.colors || []).map((color: string, index: number) => (
                      <div key={index} className="flex items-center bg-gray-700 rounded-lg px-3 py-1">
                        <span className="text-sm text-gray-300 mr-2">{color}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentColors = newProduct.colors || [];
                            const newColors = currentColors.filter((_: string, i: number) => i !== index);
                            setNewProduct(prev => ({ ...prev, colors: newColors }));
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add color (e.g., Black, White, Red)"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          const newColor = input.value.trim();
                          if (newColor) {
                            const currentColors = newProduct.colors || [];
                            if (!currentColors.includes(newColor)) {
                              setNewProduct(prev => ({ ...prev, colors: [...currentColors, newColor] }));
                            }
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                        const newColor = input.value.trim();
                        if (newColor) {
                          const currentColors = newProduct.colors || [];
                          if (!currentColors.includes(newColor)) {
                            setNewProduct(prev => ({ ...prev, colors: [...currentColors, newColor] }));
                          }
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Size Chart Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Size Chart Category</label>
                <select
                  value={newProduct.sizeChartCategory || newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, sizeChartCategory: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Hoodies">Hoodies</option>
                  <option value="Pants">Pants</option>
                  <option value="Shorts">Shorts</option>
                  <option value="Jackets">Jackets</option>
                  <option value="Sweaters">Sweaters</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Watches">Watches</option>
                  <option value="Accessories">Accessories</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Choose the size chart template to use for this product</p>
              </div>

              {/* Size Chart Editor Button */}
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
                <p className="text-xs text-gray-400 mt-1">Click to edit the size chart for this product</p>
              </div>

              <div className="flex justify-end space-x-3">
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
                      customSizeChart: undefined,
                      inStock: true,
    rating: 0,
    reviews: 0,
    createdAt: new Date(),
    updatedAt: new Date()
                    });
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Size Chart Modal - Same as product page */}
      <SizeChart
        category={editingProduct ? (editingProduct.sizeChartCategory || editingProduct.category || 't-shirts') : 
                 editingMadeToOrderProduct ? (editingMadeToOrderProduct.size_chart_category || editingMadeToOrderProduct.category || 't-shirts') :
                 (newProduct.sizeChartCategory || newProduct.category || 't-shirts')}
        isOpen={showSizeChartEditor}
        onClose={() => setShowSizeChartEditor(false)}
        customSizeChart={editingProduct?.customSizeChart ? {
                          ...editingProduct.customSizeChart,
                          category: editingProduct.sizeChartCategory || editingProduct.category || 't-shirts'
                        } : 
                        (editingMadeToOrderProduct?.custom_size_chart ? {
                          title: editingMadeToOrderProduct.custom_size_chart.title,
                          measurements: editingMadeToOrderProduct.custom_size_chart.measurements,
                          instructions: editingMadeToOrderProduct.custom_size_chart.instructions,
                          category: editingMadeToOrderProduct.size_chart_category || editingMadeToOrderProduct.category || 't-shirts'
                        } : undefined) || 
                        (newProduct?.customSizeChart ? {
                          ...newProduct.customSizeChart,
                          category: newProduct.sizeChartCategory || newProduct.category || 't-shirts'
                        } : undefined)}
        useCustomSizeChart={editingProduct?.useCustomSizeChart || editingMadeToOrderProduct?.useCustomSizeChart || newProduct?.useCustomSizeChart}
        isAdmin={true}
        onSave={async (customSizeChart) => {
          try {
            // Update the appropriate product with the new size chart data
            if (editingProduct) {
              // Save to database
              const updatedProduct = await updateProduct(editingProduct.id, {
                customSizeChart: customSizeChart,
                useCustomSizeChart: true,
                sizeChartCategory: customSizeChart.category
              });
              
              if (updatedProduct) {
                // Update local state
                setEditingProduct(updatedProduct);
                // Refresh products list using the context function
                refreshProducts();
                alert('Size chart saved successfully!');
              } else {
                alert('Error saving size chart to database');
              }
            } else if (editingMadeToOrderProduct) {
              // Update made-to-order product in database
              const { error } = await supabase
                .from('made_to_order_products')
                .update({
                  custom_size_chart: customSizeChart,
                  use_custom_size_chart: true,
                  size_chart_category: customSizeChart.category
                })
                .eq('id', editingMadeToOrderProduct.id);
              
              if (error) {
                console.error('Error updating made-to-order product:', error);
                alert('Error saving size chart to database');
              } else {
                // Update local state
                setEditingMadeToOrderProduct((prev: MadeToOrderProduct | null) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    customSizeChart: customSizeChart,
                    useCustomSizeChart: true,
                    sizeChartCategory: customSizeChart.category
                  };
                });
                alert('Size chart saved successfully!');
              }
            } else {
              setNewProduct(prev => ({
                ...prev,
                customSizeChart: customSizeChart,
                useCustomSizeChart: true,
                sizeChartCategory: customSizeChart.category
              }));
              alert('Size chart prepared for new product!');
            }
          } catch (error) {
            console.error('Error saving size chart:', error);
            alert('Error saving size chart: ' + (error instanceof Error ? error.message : String(error)));
          }
        }}
      />

    </div>
  );
}
