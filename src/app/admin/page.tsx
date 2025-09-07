'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Settings, 
  MapPin, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  LogOut,
  Bell,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Calendar,
  Mail,
  Menu,
  X,
  Home,
  Archive,
  RefreshCw,
  CheckCircle,
  Clock,
  Ruler
} from 'lucide-react';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import EnhancedDashboard from '@/components/EnhancedDashboard';
import ProductManager from '@/components/ProductManager';
import EnhancedProductManager from '@/components/EnhancedProductManager';
import InventoryManager from '@/components/InventoryManager';
import EnhancedOrderManager from '@/components/EnhancedOrderManager';
import Analytics from '@/components/Analytics';
import MaintenanceManager from '@/components/MaintenanceManager';
import MadeToOrderManager from '@/components/MadeToOrderManager';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProducts } from '@/context/ProductContext';
import { useTheme } from '@/context/ThemeContext';
import MobileAdminLayout from '@/components/MobileAdminLayout';
import ProductSkeleton, { ProductListSkeleton, TableSkeleton } from '@/components/ProductSkeleton';
import ImageUpload from '@/components/ImageUpload';
import MultiImageUpload from '@/components/MultiImageUpload';
import CustomSizeChartEditor from '@/components/CustomSizeChartEditor';
import { sortedWilayas, Wilaya } from '@/data/wilayas';
import { Product, Order, Customer } from '@/types';
import { backendService } from '@/services/backendService';
import DataSyncIndicator from '@/components/DataSyncIndicator';

export default function AdminPage() {
  const { isAuthenticated, logout, username } = useAuth();
  const { t } = useLanguage();
  const { products, addProduct: addProductContext, updateProduct: updateProductContext, deleteProduct: deleteProductContext, initializeDefaultProducts, refreshProducts } = useProducts();
  
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCustomSizeChartEditor, setShowCustomSizeChartEditor] = useState(false);
  const [wilayaTariffs, setWilayaTariffs] = useState<Wilaya[]>(sortedWilayas);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showInventoryManager, setShowInventoryManager] = useState(false);
  const [showMadeToOrderManager, setShowMadeToOrderManager] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const { theme } = useTheme();
  
  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    originalPrice: 0,
    image: '',
    images: [],
    description: '',
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black'],
    inStock: true,
    rating: 5,
    reviews: 0,
    stock: {
      S: { Black: 10 },
      M: { Black: 15 },
      L: { Black: 12 },
      XL: { Black: 8 }
    },
    sku: '',
    weight: 0,
    tags: [],
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const [newColor, setNewColor] = useState('');

  // Load inventory data
  const loadInventory = async () => {
    try {
      setInventoryLoading(true);
      const response = await fetch('/api/inventory');
      const data = await response.json();
      
      if (data.success) {
        setInventory(data.data);
      } else {
        console.error('Failed to load inventory:', data.error);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadData = async () => {
        try {
          setLoading(true);
          
        // Load wilaya tariffs
        const savedWilayaTariffs = await backendService.getWilayaTariffs();
        if (savedWilayaTariffs.length > 0) {
          setWilayaTariffs(savedWilayaTariffs);
        } else {
          setWilayaTariffs(sortedWilayas);
          backendService.updateWilayaTariffs(sortedWilayas);
        }

          // Load orders
          setOrdersLoading(true);
        const savedOrders = await backendService.getOrders();
        setOrders(savedOrders);
          setOrdersLoading(false);

        // Load customers
        const savedCustomers = await backendService.getCustomers();
        setCustomers(savedCustomers);

          // Load inventory
          await loadInventory();
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
          setOrdersLoading(false);
        }
      };

      loadData();
    }
  }, []);

  // SECURITY: Require authentication
  if (!isAuthenticated) {
    return <AdminLogin />;
  }
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      console.error('Product name and price are required');
      return;
    }

    try {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name!,
        price: newProduct.price!,
        originalPrice: newProduct.originalPrice,
        image: newProduct.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop',
        images: newProduct.images || [],
        description: newProduct.description || '',
        category: newProduct.category || 'T-Shirts',
        sizes: newProduct.sizes || ['S', 'M', 'L', 'XL'],
        colors: newProduct.colors || ['Black'],
        inStock: newProduct.inStock ?? true,
        rating: newProduct.rating || 0,
        reviews: newProduct.reviews || 0,
        stock: newProduct.stock || {
          S: { Black: 10 },
          M: { Black: 15 },
          L: { Black: 12 },
          XL: { Black: 8 }
        },
        sku: newProduct.sku || `OBS-${Date.now()}`,
        weight: newProduct.weight || 0,
        dimensions: newProduct.dimensions,
        tags: newProduct.tags || [],
        featured: newProduct.featured || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addProductContext(product);
      console.log(`"${product.name}" has been added successfully!`);
      
      // Reset form
      setNewProduct({
        name: '',
        price: 0,
        originalPrice: 0,
        image: '',
        images: [],
        description: '',
        category: 'T-Shirts',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black'],
        inStock: true,
        rating: 5,
        reviews: 0,
        stock: {
          S: { Black: 10 },
          M: { Black: 15 },
          L: { Black: 12 },
          XL: { Black: 8 }
        },
        sku: '',
        weight: 0,
        tags: [],
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setShowAddProduct(false);
    } catch (error) {
      console.error('Failed to add product. Please try again.');
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    try {
      const updatedProduct: Product = {
        ...editingProduct,
        updatedAt: new Date()
      };
      
      updateProductContext(editingProduct.id, updatedProduct);
      setEditingProduct(null);
      
      console.log(`"${updatedProduct.name}" has been updated successfully!`);
    } catch (error) {
      console.error('Failed to update product. Please try again.');
      console.error('Error updating product:', error);
    }
  };

  const handleSaveCustomSizeChart = (customSizeChart: any) => {
    if (!editingProduct) return;
    
    console.log('Saving custom size chart:', customSizeChart);
    setEditingProduct({
      ...editingProduct,
      customSizeChart,
      useCustomSizeChart: true
    });
    setShowCustomSizeChartEditor(false);
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    const productName = product?.name || 'Unknown Product';
    
    if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      try {
        deleteProductContext(id);
        console.log(`"${productName}" has been deleted successfully.`);
      } catch (error) {
        console.error('Failed to delete product. Please try again.');
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const order = orders.find(o => o.id === id);
    const orderId = order?.id || 'Unknown Order';
    
    if (confirm(`Are you sure you want to delete order "${orderId}"? This action cannot be undone.`)) {
      try {
        const success = await backendService.deleteOrder(id);
        
        if (success) {
        setOrders(prev => prev.filter(order => order.id !== id));
        console.log(`Order "${orderId}" has been deleted successfully.`);
        } else {
          console.error('Failed to delete order from database. Please try again.');
        }
      } catch (error) {
        console.error('Failed to delete order. Please try again.');
        console.error('Error deleting order:', error);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, updates: Partial<Order>) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    );
    setOrders(updatedOrders);
    
    await backendService.updateOrder(orderId, updates);
    console.log(`Order #${orderId} updated successfully`);
  };

  const updateWilayaTariff = async (wilayaId: number, field: string, value: number) => {
    const updatedTariffs = wilayaTariffs.map(wilaya => {
      if (wilaya.id === wilayaId) {
        const updated = { ...wilaya };
        
        // Update the field
        switch (field) {
          case 'stopDeskEcommerce':
            updated.stopDeskEcommerce = value;
            break;
          case 'domicileEcommerce':
            updated.domicileEcommerce = value;
            break;
        }
        
        return updated;
      }
      return wilaya;
    });
    
    setWilayaTariffs(updatedTariffs);
    
    try {
      // Update database
      await backendService.updateWilayaTariffs(updatedTariffs);
      
      // Sync to static file for better performance
      const syncResponse = await fetch('/api/wilaya/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTariffs),
      });
      
      if (!syncResponse.ok) {
        throw new Error('Failed to sync wilaya tariffs to static file');
      }
      
      console.log('Wilaya tariffs updated and synced to static file');
    } catch (error) {
      console.error('Error updating wilaya tariffs:', error);
      // Revert local changes on error
      setWilayaTariffs(wilayaTariffs);
    }
  };

  const resetWilayaTariffs = async () => {
    try {
      setWilayaTariffs(sortedWilayas);
      await backendService.updateWilayaTariffs(sortedWilayas);
      
      // Sync to static file
      const syncResponse = await fetch('/api/wilaya/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sortedWilayas),
      });
      
      if (!syncResponse.ok) {
        throw new Error('Failed to sync wilaya tariffs to static file');
      }
      
      alert('Tarifs des wilayas r�initialis�s et synchronis�s !');
    } catch (error) {
      console.error('Error resetting wilaya tariffs:', error);
      alert('Erreur lors de la r�initialisation des tarifs');
    }
  };

  const addColor = () => {
    if (newColor.trim() && !newProduct.colors?.includes(newColor.trim())) {
      const updatedColors = [...(newProduct.colors || []), newColor.trim()];
      const updatedStock = { ...newProduct.stock };
      
      newProduct.sizes?.forEach(size => {
        if (updatedStock[size]) {
          updatedStock[size][newColor.trim()] = 10;
        }
      });
      
      setNewProduct({
        ...newProduct,
        colors: updatedColors,
        stock: updatedStock
      });
      setNewColor('');
    }
  };

  const removeColor = (colorToRemove: string) => {
    const updatedColors = newProduct.colors?.filter(color => color !== colorToRemove) || [];
    const updatedStock = { ...newProduct.stock };
    
    Object.keys(updatedStock).forEach(size => {
      if (updatedStock[size]) {
        delete updatedStock[size][colorToRemove];
      }
    });
    
    setNewProduct({
      ...newProduct,
      colors: updatedColors,
      stock: updatedStock
    });
  };

  const sidebarItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    { id: 'products', icon: Package, label: 'Products', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
    { id: 'inventory', icon: Archive, label: 'Inventory', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
    { id: 'made-to-order', icon: Settings, label: 'Made to Order', color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    { id: 'customers', icon: Users, label: 'Customers', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
    { id: 'maintenance', icon: AlertTriangle, label: 'Maintenance', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    { id: 'wilayas', icon: MapPin, label: 'Wilayas', color: 'text-red-400', bgColor: 'bg-red-500/20' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  // Render content function for mobile layout
  const renderContent = () => {
    if (loading) {
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
        {activeTab === 'dashboard' && <EnhancedDashboard products={products} orders={orders} customers={customers} />}
        
        {activeTab === 'products' && (
          <div className="p-4 sm:p-6">
            {/* Refresh Button */}
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Products Management</h2>
              <button
                onClick={async () => {
                  setProductsLoading(true);
                  await refreshProducts();
                  setProductsLoading(false);
                }}
                className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Products
              </button>
            </div>
            
            {productsLoading ? (
              <ProductListSkeleton count={8} />
            ) : (
              <EnhancedProductManager
                products={products}
                onAddProduct={() => setShowAddProduct(true)}
                onEditProduct={(product) => {
                  console.log('Editing product:', product);
                  setEditingProduct({
                    ...product,
                    useCustomSizeChart: product.useCustomSizeChart || false,
                    customSizeChart: product.customSizeChart || undefined
                  });
                }}
                onDeleteProduct={handleDeleteProduct}
                onViewProduct={(product) => window.open(`/product/${product.id}`, '_blank')}
              />
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="p-6">
            {/* Prominent Inventory Manager Button */}
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-6 mb-6 border border-blue-500/50">
              <div className="text-center">
                <Package className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">📦 Inventory Management System</h2>
                <p className="text-gray-300 mb-6">Complete inventory control with real-time database integration</p>
              <button 
                  onClick={() => {
                    console.log('🖱️ Inventory Manager button clicked!');
                    setShowInventoryManager(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg text-xl font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 border-4 border-yellow-400"
                  style={{ zIndex: 1000, position: 'relative' }}
                >
                  <Package className="w-6 h-6 mr-3 inline" />
                  🚀 OPEN INVENTORY MANAGER 🚀
              </button>
                <p className="text-gray-400 mt-4 text-sm">
                  Access detailed inventory management, stock editing, and real-time updates
                </p>
            </div>
              </div>

            {/* Inventory Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                                <div>
                    <p className="text-gray-400 text-sm">Total Inventory Items</p>
                    <p className="text-3xl font-bold text-white">
                      {inventoryLoading ? '...' : inventory.length}
                    </p>
                                </div>
                  <Package className="w-10 h-10 text-blue-400" />
                              </div>
                              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
                    <p className="text-gray-400 text-sm">Low Stock Items</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {inventoryLoading ? '...' : inventory.filter(item => 
                        item.available_quantity <= item.min_stock_level && item.available_quantity > 0
                      ).length}
                    </p>
          </div>
                  <AlertTriangle className="w-10 h-10 text-yellow-400" />
        </div>
      </div>

              <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Out of Stock</p>
                    <p className="text-3xl font-bold text-red-400">
                      {inventoryLoading ? '...' : inventory.filter(item => 
                        item.available_quantity === 0
                      ).length}
                    </p>
              </div>
                  <XCircle className="w-10 h-10 text-red-400" />
          </div>
        </div>
      </div>

            {/* Simple message directing users to the inventory manager */}
                <div className="text-center py-12">
              <Package className="w-20 h-20 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Use the Inventory Manager Above</h3>
              <p className="text-gray-400 text-lg">Click the "Open Inventory Manager" button above to access detailed inventory management with real-time database integration.</p>
                </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="p-4 sm:p-6">
              <EnhancedOrderManager
                orders={orders}
                onUpdateOrder={updateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
                onViewOrder={(order) => {
                  const details = `
Order Details:
ID: #${order.id}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
${order.customerEmail ? `Email: ${order.customerEmail}` : ''}
Address: ${order.customerAddress || 'No address provided'}
Wilaya: ${order.wilayaName}

Product: ${order.productName}
Size: ${order.selectedSize}
Color: ${order.selectedColor}
Quantity: ${order.quantity}

Shipping: ${order.shippingType === 'homeDelivery' ? 'Home Delivery' : 'Stop Desk'}
Shipping Cost: ${order.shippingCost} DA
Subtotal: ${order.subtotal} DA
Total: ${order.total} DA

Order Date: ${new Date(order.orderDate).toLocaleString()}
Status: ${order.status}
Payment Status: ${order.paymentStatus}
                  `;
                  alert(details);
                }}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-4 sm:p-6">
              <Analytics products={products} orders={orders} customers={customers} />
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Customers</h2>
                  <p className="text-gray-400">Manage customer information and order history</p>
                </div>
              </div>

              {customers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No customers yet</h3>
                  <p className="text-gray-400">Customer profiles will appear here after their first order.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customers.map((customer) => (
                    <div key={customer.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-black" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-white font-semibold">{customer.name}</h3>
                          <p className="text-gray-400 text-sm">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Orders:</span>
                          <span className="text-white">{customer.totalOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Spent:</span>
                          <span className="text-white">{customer.totalSpent} DZD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Wilaya:</span>
                          <span className="text-white">{customer.wilayaName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <button 
                onClick={() => setShowMadeToOrderManager(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                <Settings className="w-4 h-4 mr-2 inline" />
                Open Manager
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Custom Products</p>
                    <p className="text-2xl font-bold text-white">∞</p>
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

            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Made to Order Management</h3>
              <p className="text-gray-400">Click "Open Manager" to manage custom products and track orders.</p>
            </div>
          </div>
        )}

          {activeTab === 'wilayas' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Wilaya Tariffs</h2>
                  <p className="text-gray-400">Manage shipping costs for each wilaya</p>
                </div>
                <button
                  onClick={resetWilayaTariffs}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Reset to Default
                </button>
              </div>

              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="text-left text-white font-medium py-4 px-4">Wilaya</th>
                        <th className="text-center text-white font-medium py-4 px-4">Stop Desk E-Commerce</th>
                        <th className="text-center text-white font-medium py-4 px-4">Domicile E-Commerce</th>
                      </tr>
                    </thead>
                    <tbody>
                    {wilayaTariffs.map((wilaya) => {
                      const wilayaId = wilaya.id;
                      const stopDeskPrice = wilaya.stopDeskEcommerce || 0;
                      const homeDeliveryPrice = wilaya.domicileEcommerce || 0;
                      
                      return (
                        <tr key={wilayaId} className="border-t border-gray-800">
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-white font-medium">{wilaya.name}</div>
                              <div className="text-gray-400 text-xs">#{wilayaId}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <input
                              type="number"
                              value={stopDeskPrice}
                              onChange={(e) => updateWilayaTariff(wilayaId, 'stopDeskEcommerce', parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-white"
                            />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <input
                              type="number"
                              value={homeDeliveryPrice}
                              onChange={(e) => updateWilayaTariff(wilayaId, 'domicileEcommerce', parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-white"
                            />
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
    );
  };
  // Use mobile layout for mobile devices
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
            <p className="text-gray-400 text-sm">Admin Panel</p>
                </div>
          <div className="flex items-center space-x-2">
                        <button
              onClick={() => window.open('/', '_blank')}
              className="touch-target text-gray-400 hover:text-white transition-colors"
              title="Back to Shop"
            >
              <Home className="w-5 h-5" />
                        </button>
                    <button
              onClick={logout}
              className="touch-target text-gray-400 hover:text-white transition-colors"
                    >
              <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

      {/* Sidebar */}
      <div className="hidden lg:flex w-64 bg-gradient-to-b from-gray-900 to-black border-r border-gray-700/50 flex-col backdrop-blur-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white">OBSIDIAN</h1>
          <p className="text-gray-400 text-sm">Admin Panel</p>
              <button
            onClick={() => window.open('/', '_blank')}
            className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
            <Home className="w-4 h-4 mr-2" />
            Back to Shop
              </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all group ${
                  activeTab === item.id
                    ? `${item.bgColor} ${item.color} shadow-lg border border-current/20`
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                  activeTab === item.id ? item.color : item.color + ' group-hover:text-white'
                }`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-black" />
            </div>
              <div className="ml-3">
                <p className="text-white text-sm font-medium">Admin</p>
                <p className="text-gray-400 text-xs">{username}</p>
                  </div>
                    </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
                </div>
                </div>
              </div>

      {/* Mobile Navigation Tabs */}
      <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-1 p-3 min-w-max">
          {sidebarItems.map((item) => (
                        <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white active:scale-95'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${activeTab === item.id ? 'text-black' : item.color}`} />
              {item.label}
                        </button>
                    ))}
                  </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-900 border-b border-gray-800 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white w-full sm:w-80 lg:w-96 text-base"
                />
                  </div>
                </div>
            <div className="hidden sm:flex items-center space-x-4">
              <button className="touch-target text-gray-400 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="text-gray-400 text-sm">
                {new Date().toLocaleDateString('fr-FR')}
              </div>
                </div>
              </div>
            </div>

        {/* Content Area */}
        {renderContent()}
            </div>

      {/* Data Sync Indicator */}
      <DataSyncIndicator />
      
      {/* Manual Sync Button */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        
        {products.length === 0 && (
          <button
            onClick={() => {
              initializeDefaultProducts();
              console.log('Default products have been added to your store');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
          >
            📦 Add Sample Products
          </button>
        )}
      </div>

      {/* Inventory Manager Modal */}
      {showInventoryManager && (
        <div>
          <InventoryManager onClose={() => {
            setShowInventoryManager(false);
          }} />
        </div>
      )}

      {/* Made to Order Manager Modal */}
      {showMadeToOrderManager && (
        <div>
          <MadeToOrderManager onClose={() => {
            setShowMadeToOrderManager(false);
          }} />
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  >
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Pants">Pants</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Colors Management */}
              <div>
                <label className="block text-white font-medium mb-2">Colors</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {editingProduct.colors?.map((color, index) => (
                      <div key={index} className="flex items-center bg-gray-800 rounded-lg px-3 py-1">
                        <span className="text-white text-sm">{color}</span>
                        <button
                          onClick={() => {
                            const newColors = editingProduct.colors?.filter((_, i) => i !== index) || [];
                            setEditingProduct({ ...editingProduct, colors: newColors });
                          }}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Add new color"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    />
                    <button
                      onClick={() => {
                        if (newColor.trim() && !editingProduct.colors?.includes(newColor.trim())) {
                          setEditingProduct({
                            ...editingProduct,
                            colors: [...(editingProduct.colors || []), newColor.trim()]
                          });
                          setNewColor('');
                        }
                      }}
                      className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sizes Management */}
              <div>
                <label className="block text-white font-medium mb-2">Sizes</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {editingProduct.sizes?.map((size, index) => (
                      <div key={index} className="flex items-center bg-gray-800 rounded-lg px-3 py-1">
                        <span className="text-white text-sm">{size}</span>
                        <button
                          onClick={() => {
                            const newSizes = editingProduct.sizes?.filter((_, i) => i !== index) || [];
                            setEditingProduct({ ...editingProduct, sizes: newSizes });
                          }}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => {
                        const newSize = e.target.value;
                        if (newSize && !editingProduct.sizes?.includes(newSize)) {
                          setEditingProduct({
                            ...editingProduct,
                            sizes: [...(editingProduct.sizes || []), newSize]
                          });
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    >
                      <option value="">Select size to add</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="XXXL">XXXL</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Size Chart Management */}
              <div>
                <label className="block text-white font-medium mb-2">Size Chart Settings</label>
                
                {/* Use Custom Size Chart Toggle */}
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="useCustomSizeChart"
                    checked={editingProduct.useCustomSizeChart === true}
                    onChange={(e) => {
                      console.log('Checkbox changed:', e.target.checked);
                      setEditingProduct({ 
                        ...editingProduct, 
                        useCustomSizeChart: e.target.checked 
                      });
                    }}
                    className="w-4 h-4 text-white bg-gray-800 border-gray-700 rounded focus:ring-white focus:ring-2"
                  />
                  <label htmlFor="useCustomSizeChart" className="text-white text-sm cursor-pointer">
                    Use custom size chart for this product
                  </label>
                </div>

                {editingProduct.useCustomSizeChart ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        console.log('Opening custom size chart editor');
                        setShowCustomSizeChartEditor(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Ruler className="w-4 h-4" />
                      {editingProduct.customSizeChart ? 'Edit Custom Size Chart' : 'Create Custom Size Chart'}
                    </button>
                    {editingProduct.customSizeChart && (
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-white text-sm font-medium">{editingProduct.customSizeChart.title}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {editingProduct.customSizeChart.measurements?.length || 0} sizes configured
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <select
                      value={editingProduct.sizeChartCategory || 'T-Shirts'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sizeChartCategory: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    >
                      <option value="T-Shirts">T-Shirts</option>
                      <option value="Hoodies">Hoodies</option>
                      <option value="Pants">Pants</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Watches">Watches</option>
                    </select>
                    <p className="text-gray-400 text-sm mt-1">
                      Select the default size chart category for this product
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProduct}
                  className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Update Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Size Chart Editor Modal */}
      {showCustomSizeChartEditor && editingProduct && (
        <CustomSizeChartEditor
          product={editingProduct}
          onSave={handleSaveCustomSizeChart}
          onCancel={() => {
            console.log('Closing custom size chart editor');
            setShowCustomSizeChartEditor(false);
          }}
        />
      )}
    </div>
  );
}

