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
  TrendingUp,
  Calendar,
  Mail,
  Menu,
  X,
  Home,
  Archive
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
import NotificationSystem, { useNotifications } from '@/components/NotificationSystem';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProducts } from '@/context/ProductContext';
import ImageUpload from '@/components/ImageUpload';
import MultiImageUpload from '@/components/MultiImageUpload';
import { sortedWilayas, Wilaya } from '@/data/wilayas';
import { Product, Order, Customer } from '@/types';
import { backendService } from '@/services/backendService';
import DataSyncIndicator from '@/components/DataSyncIndicator';

export default function AdminPage() {
  const { isAuthenticated, logout, username } = useAuth();
  const { t } = useLanguage();
  const { products, addProduct: addProductContext, updateProduct: updateProductContext, deleteProduct: deleteProductContext, initializeDefaultProducts } = useProducts();
  const { notifications, removeNotification, showSuccess, showError, showWarning, showInfo } = useNotifications();
  
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [wilayaTariffs, setWilayaTariffs] = useState<Wilaya[]>(sortedWilayas);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
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

  // Load data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load data from shared data service
      const loadData = async () => {
        // Load wilaya tariffs
        const savedWilayaTariffs = await backendService.getWilayaTariffs();
        if (savedWilayaTariffs.length > 0) {
          setWilayaTariffs(savedWilayaTariffs);
        } else {
          setWilayaTariffs(sortedWilayas);
          backendService.updateWilayaTariffs(sortedWilayas);
        }

        // Load orders
        const savedOrders = await backendService.getOrders();
        setOrders(savedOrders);

        // Load customers
        const savedCustomers = await backendService.getCustomers();
        setCustomers(savedCustomers);
      };

      loadData();

      // Listen for data updates
      const handleDataUpdate = (event: CustomEvent) => {
        const data = event.detail;
        if (data) {
          if (data.orders) setOrders(data.orders);
          if (data.customers) setCustomers(data.customers);
          if (data.wilayaTariffs) setWilayaTariffs(data.wilayaTariffs);
        }
      };

      // Listen for dashboard button clicks
      const handleTabChange = (event: CustomEvent) => {
        setActiveTab(event.detail);
      };

      window.addEventListener('data-updated', handleDataUpdate as EventListener);
      window.addEventListener('admin-tab-change', handleTabChange as EventListener);
      
      return () => {
        window.removeEventListener('data-updated', handleDataUpdate as EventListener);
        window.removeEventListener('admin-tab-change', handleTabChange as EventListener);
      };
    }
  }, []);

  // SECURITY: Require authentication
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      showError('Validation Error', 'Product name and price are required');
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
      showSuccess('Product Added', `"${product.name}" has been added successfully!`);
      
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
      showError('Error', 'Failed to add product. Please try again.');
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    try {
      // Create a proper copy with updated timestamp
      const updatedProduct: Product = {
        ...editingProduct,
        updatedAt: new Date()
      };
      
      updateProductContext(editingProduct.id, updatedProduct);
      setEditingProduct(null);
      
      showSuccess('Product Updated', `"${updatedProduct.name}" has been updated successfully!`);
      console.log('Product updated:', updatedProduct.name);
    } catch (error) {
      showError('Update Failed', 'Failed to update product. Please try again.');
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    const productName = product?.name || 'Unknown Product';
    
    if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      try {
        deleteProductContext(id);
        showSuccess('Product Deleted', `"${productName}" has been deleted successfully.`);
      } catch (error) {
        showError('Delete Failed', 'Failed to delete product. Please try again.');
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleDeleteOrder = (id: string) => {
    const order = orders.find(o => o.id === id);
    const orderId = order?.id || 'Unknown Order';
    
    if (confirm(`Are you sure you want to delete order "${orderId}"? This action cannot be undone.`)) {
      try {
        setOrders(prev => prev.filter(order => order.id !== id));
        showSuccess('Order Deleted', `Order "${orderId}" has been deleted successfully.`);
      } catch (error) {
        showError('Delete Failed', 'Failed to delete order. Please try again.');
        console.error('Error deleting order:', error);
      }
    }
  };

  const exportOrdersToExcel = () => {
    if (orders.length === 0) {
      showError('No Data', 'No orders to export');
      return;
    }

    const csvContent = [
      ['Order ID', 'Customer Name', 'Phone', 'Email', 'Address', 'Wilaya', 'Product', 'Size', 'Color', 'Quantity', 'Shipping Type', 'Shipping Cost', 'Subtotal', 'Total', 'Date'],
      ...orders.map(order => [
        order.id,
        order.customerName,
        order.customerPhone,
        order.customerEmail || '',
        order.customerAddress,
        order.wilayaName,
        order.productName,
        order.selectedSize,
        order.selectedColor,
        order.quantity,
        order.shippingType === 'homeDelivery' ? 'Home Delivery' : 'Stop Desk',
        order.shippingCost,
        order.subtotal,
        order.total,
        new Date(order.orderDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Export Successful', 'Orders exported to CSV file');
  };

  const viewOrderDetails = (order: Order) => {
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
    `;
    
    alert(details);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
    );
    setOrders(updatedOrders);
    
    // Update in shared data service
    await backendService.updateOrder(orderId, { status: newStatus as Order['status'] });
    
    showSuccess('Status Updated', `Order #${orderId} status updated to ${newStatus}`);
  };

  const updateWilayaTariff = async (wilayaId: number, field: keyof Wilaya, value: number) => {
    const updatedTariffs = wilayaTariffs.map(wilaya => 
      wilaya.id === wilayaId ? { ...wilaya, [field]: value } : wilaya
    );
    setWilayaTariffs(updatedTariffs);
    await backendService.updateWilayaTariffs(updatedTariffs);
  };

  const resetWilayaTariffs = async () => {
    setWilayaTariffs(sortedWilayas);
    await backendService.updateWilayaTariffs(sortedWilayas);
    alert('Tarifs des wilayas réinitialisés !');
  };

  const addColor = () => {
    if (newColor.trim() && !newProduct.colors?.includes(newColor.trim())) {
      const updatedColors = [...(newProduct.colors || []), newColor.trim()];
      const updatedStock = { ...newProduct.stock };
      
      // Add new color to all sizes with default stock of 10
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
    
    // Remove color from all sizes
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
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-blue-400' },
    { id: 'products', icon: Package, label: 'Products', color: 'text-green-400' },
    { id: 'inventory', icon: Archive, label: 'Inventory', color: 'text-cyan-400' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders', color: 'text-orange-400' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', color: 'text-pink-400' },
    { id: 'customers', icon: Users, label: 'Customers', color: 'text-purple-400' },
    { id: 'maintenance', icon: AlertTriangle, label: 'Maintenance', color: 'text-yellow-400' },
    { id: 'wilayas', icon: MapPin, label: 'Wilayas', color: 'text-red-400' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
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
      <div className="hidden lg:flex w-64 bg-gray-900 border-r border-gray-800 flex-col">
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
                    ? 'bg-white text-black shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                  activeTab === item.id ? 'text-black' : item.color + ' group-hover:text-white'
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
        <div className="flex-1 overflow-auto">
                      {activeTab === 'dashboard' && <EnhancedDashboard products={products} orders={orders} customers={customers} />}
          
          {activeTab === 'products' && (
            <div className="p-4 sm:p-6">
              <EnhancedProductManager
                products={products}
                onAddProduct={() => setShowAddProduct(true)}
                onEditProduct={(product) => setEditingProduct(product)}
                onDeleteProduct={handleDeleteProduct}
                onViewProduct={(product) => window.open(`/product/${product.id}`, '_blank')}
              />
            </div>
          )}

          {activeTab === 'inventory' && <InventoryManager />}

          {activeTab === 'maintenance' && <MaintenanceManager />}

          {activeTab === 'orders' && (
            <div className="p-4 sm:p-6">
              <EnhancedOrderManager
                orders={orders}
                onUpdateOrder={(id, updates) => {
                  // Update order logic here
                  console.log('Update order:', id, updates);
                }}
                onDeleteOrder={handleDeleteOrder}
                onViewOrder={(order) => {
                  // View order logic here
                  console.log('View order:', order);
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
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Customers</h3>
                <p className="text-gray-400">Customer management coming soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'wilayas' && (
            <div className="p-6">
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Wilayas</h3>
                <p className="text-gray-400">Wilaya management coming soon.</p>
              </div>
            </div>
          )}

          {/* Legacy orders section - keeping for reference */}
          {false && (
            <div className="p-6">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                  <p className="text-gray-400">Orders will appear here when customers make purchases.</p>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="text-left text-white font-medium py-4 px-6">Order ID</th>
                          <th className="text-left text-white font-medium py-4 px-6">Customer</th>
                          <th className="text-left text-white font-medium py-4 px-6">Product</th>
                          <th className="text-left text-white font-medium py-4 px-6">Address</th>
                          <th className="text-left text-white font-medium py-4 px-6">Shipping</th>
                          <th className="text-left text-white font-medium py-4 px-6">Total</th>
                          <th className="text-left text-white font-medium py-4 px-6">Date</th>
                          <th className="text-left text-white font-medium py-4 px-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-t border-gray-800">
                            <td className="py-4 px-6 text-white font-mono text-sm">#{order.id}</td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-white font-medium">{order.customerName}</p>
                                <p className="text-gray-400 text-sm">{order.customerPhone}</p>
                                {order.customerEmail && (
                                  <p className="text-gray-400 text-sm">{order.customerEmail}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-white font-medium">{order.productName}</p>
                                <p className="text-gray-400 text-sm">{order.selectedSize} - {order.selectedColor}</p>
                                <p className="text-gray-400 text-sm">Qty: {order.quantity}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-white text-sm">{order.customerAddress || 'No address provided'}</p>
                                <p className="text-gray-400 text-sm">{order.wilayaName}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  order.shippingType === 'homeDelivery' 
                                    ? 'bg-green-900 text-green-300' 
                                    : 'bg-blue-900 text-blue-300'
                                }`}>
                                  {order.shippingType === 'homeDelivery' ? 'Home Delivery' : 'Stop Desk'}
                                </span>
                                <p className="text-gray-400 text-sm mt-1">{order.shippingCost} DA</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-white font-semibold">{order.total} DA</p>
                                <p className="text-gray-400 text-sm">Subtotal: {order.subtotal} DA</p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-gray-400">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => viewOrderDetails(order)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <select
                                  value={order.status || 'pending'}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                  className="bg-gray-800 border border-gray-700 rounded text-white text-xs px-2 py-1 focus:outline-none focus:border-white"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
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
          )}

          {activeTab === 'customers' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Customers</h2>
                  <p className="text-gray-400">Manage your customer base</p>
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
                      {wilayaTariffs.map((wilaya) => (
                        <tr key={wilaya.id} className="border-t border-gray-800">
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-white font-medium">{wilaya.name}</div>
                              <div className="text-gray-400 text-xs">#{wilaya.id}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <input
                              type="number"
                              value={wilaya.stopDeskEcommerce}
                              onChange={(e) => updateWilayaTariff(wilaya.id, 'stopDeskEcommerce', parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-white"
                            />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <input
                              type="number"
                              value={wilaya.domicileEcommerce}
                              onChange={(e) => updateWilayaTariff(wilaya.id, 'domicileEcommerce', parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-white"
                            />
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
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-white">Add New Product</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={newProduct.name || ''}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                      placeholder="OBSIDIAN HOODIE BLACK"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Price (DZD) *</label>
                      <input
                        type="number"
                        value={newProduct.price || ''}
                        onChange={(e) => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Original Price (DZD)</label>
                      <input
                        type="number"
                        value={newProduct.originalPrice || ''}
                        onChange={(e) => setNewProduct({...newProduct, originalPrice: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Description</label>
                    <textarea
                      value={newProduct.description || ''}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white resize-none"
                      placeholder="Premium cotton hoodie with embroidered logo..."
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-white font-medium mb-2">Product Images</label>
                  <MultiImageUpload
                    value={newProduct.images || []}
                    onChange={(urls) => {
                      setNewProduct({
                        ...newProduct, 
                        images: urls,
                        image: urls[0] || '' // Set first image as main image
                      });
                    }}
                    placeholder="Upload product images"
                    maxImages={5}
                  />
                  {newProduct.images && newProduct.images.length > 0 && (
                    <p className="text-gray-400 text-sm mt-2">
                      First image will be used as the main product image
                    </p>
                  )}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <select
                    value={newProduct.category || 'T-Shirts'}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  >
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Pants">Pants</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    value={newProduct.sku || ''}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProduct.weight || ''}
                    onChange={(e) => setNewProduct({...newProduct, weight: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Color Management */}
              <div>
                <h4 className="text-white font-semibold mb-4">Available Colors</h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(newProduct.colors || []).map(color => (
                      <div key={color} className="flex items-center bg-gray-800 rounded-lg px-3 py-2">
                        <span className="text-white mr-2">{color}</span>
                        <button
                          onClick={() => removeColor(color)}
                          className="text-red-400 hover:text-red-300 ml-2"
                          title="Remove color"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Add new color (e.g., Red, Blue, White)"
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    />
                    <button
                      onClick={addColor}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Color
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock Management */}
              <div>
                <h4 className="text-white font-semibold mb-4">Stock Management by Size & Color</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-white font-medium py-2">Size</th>
                        {(newProduct.colors || ['Black']).map(color => (
                          <th key={color} className="text-center text-white font-medium py-2 min-w-[100px]">{color}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['S', 'M', 'L', 'XL'].map(size => (
                        <tr key={size}>
                          <td className="text-white font-medium py-2">{size}</td>
                          {(newProduct.colors || ['Black']).map(color => (
                            <td key={color} className="py-2">
                              <input
                                type="number"
                                value={newProduct.stock?.[size]?.[color] || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setNewProduct({
                                    ...newProduct, 
                                    stock: {
                                      ...newProduct.stock,
                                      [size]: {
                                        ...newProduct.stock?.[size],
                                        [color]: value
                                      }
                                    }
                                  });
                                }}
                                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-white"
                                placeholder="0"
                                min="0"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-gray-800 flex justify-end space-x-4">
              <button
                onClick={() => setShowAddProduct(false)}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-white">Edit Product</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Product Name</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Price (DZD)</label>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Original Price (DZD)</label>
                      <input
                        type="number"
                        value={editingProduct.originalPrice || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, originalPrice: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Description</label>
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Product Images</label>
                  <MultiImageUpload
                    value={editingProduct.images || []}
                    onChange={(urls) => {
                      setEditingProduct(prev => prev ? ({
                        ...prev, 
                        images: urls,
                        image: urls[0] || prev.image // Keep current image if no new images
                      }) : null);
                    }}
                    placeholder="Upload product images"
                    maxImages={5}
                  />
                  {editingProduct.images && editingProduct.images.length > 0 && (
                    <p className="text-gray-400 text-sm mt-2">
                      First image will be used as the main product image
                    </p>
                  )}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <select
                    value={editingProduct.category || 'T-Shirts'}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  >
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Pants">Pants</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingProduct.weight || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, weight: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Color Management */}
              <div>
                <h4 className="text-white font-semibold mb-4">Available Colors</h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(editingProduct.colors || []).map(color => (
                      <div key={color} className="flex items-center bg-gray-800 rounded-lg px-3 py-2">
                        <span className="text-white mr-2">{color}</span>
                        <button
                          onClick={() => {
                            const updatedColors = (editingProduct.colors || []).filter(c => c !== color);
                            setEditingProduct({...editingProduct, colors: updatedColors});
                          }}
                          className="text-red-400 hover:text-red-300 ml-2"
                          title="Remove color"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Add new color (e.g., Red, Blue, White)"
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    />
                    <button
                      onClick={() => {
                        if (newColor.trim() && !(editingProduct.colors || []).includes(newColor.trim())) {
                          const updatedColors = [...(editingProduct.colors || []), newColor.trim()];
                          setEditingProduct({...editingProduct, colors: updatedColors});
                          setNewColor('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Color
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock Management */}
              <div>
                <h4 className="text-white font-semibold mb-4">Stock Management by Size & Color</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-white font-medium py-2">Size</th>
                        {(editingProduct.colors || ['Black']).map(color => (
                          <th key={color} className="text-center text-white font-medium py-2 min-w-[100px]">{color}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['S', 'M', 'L', 'XL'].map(size => (
                        <tr key={size}>
                          <td className="text-white font-medium py-2">{size}</td>
                          {(editingProduct.colors || ['Black']).map(color => (
                            <td key={color} className="py-2">
                              <input
                                type="number"
                                value={editingProduct.stock?.[size]?.[color] || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setEditingProduct({
                                    ...editingProduct, 
                                    stock: {
                                      ...editingProduct.stock,
                                      [size]: {
                                        ...editingProduct.stock?.[size],
                                        [color]: value
                                      }
                                    }
                                  });
                                }}
                                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-white"
                                placeholder="0"
                                min="0"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-end space-x-4">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      {/* Data Sync Indicator */}
      <DataSyncIndicator />
      
      {/* Manual Sync Button */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={async () => {
            try {
              console.log('Manual sync triggered');
              const response = await fetch('/api/data');
              if (response.ok) {
                const data = await response.json();
                console.log('Manual sync result:', data);
                showSuccess('Sync Test', `Data synced! Version: ${data.version}, Products: ${data.products?.length || 0}`);
              } else {
                showError('Sync Failed', 'Failed to fetch data from API');
              }
            } catch (error) {
              console.error('Manual sync error:', error);
              showError('Sync Error', 'Failed to sync data');
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Test Sync
        </button>
        
        {products.length === 0 && (
          <button
            onClick={() => {
              initializeDefaultProducts();
              showSuccess('Products Initialized', 'Default products have been added to your store');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
          >
            📦 Add Sample Products
          </button>
        )}
      </div>
    </div>
  );
}