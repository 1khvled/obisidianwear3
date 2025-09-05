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
  Archive,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import EnhancedDashboard from '@/components/EnhancedDashboard';
import ProductManager from '@/components/ProductManager';
import EnhancedProductManager from '@/components/EnhancedProductManager';
import InventoryManager from '@/components/InventoryManager';
import EnhancedOrderManager from '@/components/EnhancedOrderManager';
import Analytics from '@/components/Analytics';
import OptimizedMaintenanceManager from '@/components/OptimizedMaintenanceManager';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProducts } from '@/context/ProductContext';
import { useTheme } from '@/context/ThemeContext';
import { useRealtime } from '@/hooks/useRealtime';
import MobileAdminLayout from '@/components/MobileAdminLayout';
import ProductSkeleton, { ProductListSkeleton, TableSkeleton } from '@/components/ProductSkeleton';
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
  const { isConnected: isRealtimeConnected } = useRealtime();
  
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [wilayaTariffs, setWilayaTariffs] = useState<Wilaya[]>(sortedWilayas);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { theme } = useTheme();
  
  // Check for low stock and send notifications (only once on mount)
  useEffect(() => {
    if (products.length > 0) {
      const lowStockProducts: string[] = [];
      const outOfStockProducts: string[] = [];
      
      products.forEach(product => {
        if (product.stock) {
          const totalStock = Object.values(product.stock).reduce((total: number, colorStock: any) => {
            if (typeof colorStock === 'object' && colorStock !== null) {
              return total + Object.values(colorStock).reduce((sum: number, qty: any) => {
                return sum + (typeof qty === 'number' ? qty : 0);
              }, 0);
            }
            return total;
          }, 0);
          
          if (totalStock <= 5 && totalStock > 0) {
            lowStockProducts.push(`${product.name} (${totalStock} left)`);
          } else if (totalStock === 0) {
            outOfStockProducts.push(product.name);
          }
        }
      });
      
      // Stock alerts removed - no notifications
    }
  }, []); // Only run once on mount
  
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

  // Load data on component mount with performance optimization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load data from shared data service
      const loadData = async (retryAttempt = 0) => {
        try {
          setLoading(true);
          setError(null);
          
          // Load wilaya tariffs with retry
          try {
        const savedWilayaTariffs = await backendService.getWilayaTariffs();
        if (savedWilayaTariffs.length > 0) {
          setWilayaTariffs(savedWilayaTariffs);
        } else {
          setWilayaTariffs(sortedWilayas);
              await backendService.updateWilayaTariffs(sortedWilayas);
            }
          } catch (wilayaError) {
            console.warn('Failed to load wilaya tariffs, using defaults:', wilayaError);
            setWilayaTariffs(sortedWilayas);
          }

          // Load orders with loading state and retry
          setOrdersLoading(true);
          try {
        const savedOrders = await backendService.getOrders();
        setOrders(savedOrders);
          } catch (ordersError) {
            console.warn('Failed to load orders:', ordersError);
            setOrders([]);
            if (retryAttempt < 2) {
              setTimeout(() => loadData(retryAttempt + 1), 1000 * (retryAttempt + 1));
              return;
            }
          }
          setOrdersLoading(false);
          
          // Load customers with retry
          try {
        const savedCustomers = await backendService.getCustomers();
        setCustomers(savedCustomers);
          } catch (customersError) {
            console.warn('Failed to load customers:', customersError);
            setCustomers([]);
          }
          
        } catch (error) {
          console.error('Error loading data:', error);
          setError(`Failed to load admin data: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Retry logic
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => loadData(retryCount + 1), 2000 * (retryCount + 1));
          }
        } finally {
          setLoading(false);
          setOrdersLoading(false);
        }
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

  // Error display component
  const ErrorDisplay = () => {
    if (!error) return null;
    
    return (
      <div className="fixed top-4 right-4 z-50 max-w-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => {
                  setError(null);
                  setRetryCount(0);
                  window.location.reload();
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium underline"
              >
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                ×
              </button>
            </div>
          </div>
          {retryCount > 0 && (
            <div className="mt-2 text-xs text-red-600">
              Retry attempt {retryCount}/3
            </div>
          )}
        </div>
      </div>
    );
  };

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
      // Create a proper copy with updated timestamp
      const updatedProduct: Product = {
        ...editingProduct,
        updatedAt: new Date()
      };
      
      updateProductContext(editingProduct.id, updatedProduct);
      setEditingProduct(null);
      
      console.log(`"${updatedProduct.name}" has been updated successfully!`);
      console.log('Product updated:', updatedProduct.name);
    } catch (error) {
      console.error('Failed to update product. Please try again.');
      console.error('Error updating product:', error);
    }
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

  const handleDeleteOrder = (id: string) => {
    const order = orders.find(o => o.id === id);
    const orderId = order?.id || 'Unknown Order';
    
    if (confirm(`Are you sure you want to delete order "${orderId}"? This action cannot be undone.`)) {
      try {
        setOrders(prev => prev.filter(order => order.id !== id));
        console.log(`Order "${orderId}" has been deleted successfully.`);
      } catch (error) {
        console.error('Failed to delete order. Please try again.');
        console.error('Error deleting order:', error);
      }
    }
  };

  const exportOrdersToExcel = () => {
    if (orders.length === 0) {
      console.warn('No orders to export');
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
    
    console.log('Orders exported to CSV file');
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

  const updateOrderStatus = async (orderId: string, updates: Partial<Order>) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    );
    setOrders(updatedOrders);
    
    // Update in shared data service
    await backendService.updateOrder(orderId, updates);
    
    console.log(`Order #${orderId} updated successfully`);
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
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    { id: 'products', icon: Package, label: 'Products', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
    { id: 'inventory', icon: Archive, label: 'Inventory', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
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
          <div className="mt-4 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Loading admin data...</p>
            {retryCount > 0 && (
              <p className="text-sm">Retry attempt {retryCount}/3</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <EnhancedDashboard products={products} orders={orders} customers={customers} />}
        
        {activeTab === 'products' && (
          <div className="p-4 sm:p-6">
            {productsLoading ? (
              <ProductListSkeleton count={8} />
            ) : (
              <EnhancedProductManager
                products={products}
                onAddProduct={() => setShowAddProduct(true)}
                onEditProduct={(product) => setEditingProduct(product)}
                onDeleteProduct={handleDeleteProduct}
                onViewProduct={(product) => window.open(`/product/${product.id}`, '_blank')}
              />
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Inventory Management</h2>
                <p className="text-gray-400 text-sm sm:text-base">Manage product stock and inventory levels</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                <p className="text-gray-400">Add products to manage inventory.</p>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Product</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Category</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Colors</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Sizes</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Stock</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Total</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Status</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const getTotalStock = () => {
                          if (!product.stock) return 0;
                          return Object.values(product.stock).reduce((total: number, colorStock: any) => {
                            if (typeof colorStock === 'object' && colorStock !== null) {
                              return total + Object.values(colorStock).reduce((sum: number, qty: any) => {
                                return sum + (typeof qty === 'number' ? qty : 0);
                              }, 0);
                            }
                            return total;
                          }, 0);
                        };

                        const getStockBySize = (size: string) => {
                          if (!product.stock) return 0;
                          return Object.values(product.stock).reduce((total: number, colorStock: any) => {
                            if (typeof colorStock === 'object' && colorStock !== null) {
                              return total + (typeof colorStock[size] === 'number' ? colorStock[size] : 0);
                            }
                            return total;
                          }, 0);
                        };

                        const totalStock = getTotalStock();
                        const isLowStock = totalStock < 10;
                        const isOutOfStock = totalStock === 0;

                        return (
                          <tr key={product.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                            <td className="py-3 px-3 sm:px-6">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="text-white font-medium text-sm sm:text-base truncate">{product.name}</div>
                                  <div className="text-gray-400 text-xs">SKU: {product.sku || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-6">
                              <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                                {product.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 sm:px-6">
                              <div className="flex flex-wrap gap-1">
                                {product.colors.slice(0, 2).map((color, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-700 text-gray-300 px-1 py-0.5 rounded text-xs"
                                  >
                                    {color}
                                  </span>
                                ))}
                                {product.colors.length > 2 && (
                                  <span className="text-gray-400 text-xs">+{product.colors.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-6">
                              <div className="flex flex-wrap gap-1">
                                {product.sizes.slice(0, 3).map((size, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-700 text-gray-300 px-1 py-0.5 rounded text-xs"
                                  >
                                    {size}
                                  </span>
                                ))}
                                {product.sizes.length > 3 && (
                                  <span className="text-gray-400 text-xs">+{product.sizes.length - 3}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-6">
                              <div className="space-y-1">
                                {product.sizes.slice(0, 2).map((size) => {
                                  const sizeStock = getStockBySize(size);
                                  return (
                                    <div key={size} className="flex items-center justify-between text-xs">
                                      <span className="text-gray-300">{size}:</span>
                                      <span className={`font-medium ${
                                        sizeStock === 0 ? 'text-red-400' :
                                        sizeStock < 5 ? 'text-yellow-400' :
                                        'text-green-400'
                                      }`}>
                                        {sizeStock}
                                      </span>
                                    </div>
                                  );
                                })}
                                {product.sizes.length > 2 && (
                                  <div className="text-gray-400 text-xs">...</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-6">
                              <div className="text-white font-semibold text-sm sm:text-lg">{totalStock}</div>
                            </td>
                            <td className="py-3 px-3 sm:px-6">
                              <div className="flex items-center space-x-1">
                                {isOutOfStock ? (
                                  <span className="flex items-center text-red-400 text-xs">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Out
                                  </span>
                                ) : isLowStock ? (
                                  <span className="flex items-center text-yellow-400 text-xs">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Low
                                  </span>
                                ) : (
                                  <span className="flex items-center text-green-400 text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    OK
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-6">
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                title="Edit Stock"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Customers</h2>
                <p className="text-gray-400 text-sm sm:text-base">Manage customer information and order history</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
                <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Customer Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-xl sm:text-2xl font-bold text-white">{customers.length}</div>
                <div className="text-xs sm:text-sm text-gray-400">Total Customers</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-xl sm:text-2xl font-bold text-green-400">
                  {customers.filter(c => c.status === 'active').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Active</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-xl sm:text-2xl font-bold text-blue-400">
                  {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Total Orders</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-xl sm:text-2xl font-bold text-purple-400">
                  {customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length) : 0} DA
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Avg. Value</div>
              </div>
            </div>

            {customers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No customers yet</h3>
                <p className="text-gray-400">Customer data will appear here when orders are placed.</p>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Customer</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Contact</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Location</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Orders</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Total Spent</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Status</th>
                        <th className="text-left text-white font-medium py-3 px-3 sm:px-6 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-3 sm:px-6">
                            <div className="text-white font-medium text-sm">{customer.name}</div>
                            <div className="text-gray-400 text-xs">ID: {customer.id}</div>
                          </td>
                          <td className="py-3 px-3 sm:px-6">
                            <div className="text-white text-xs sm:text-sm">{customer.phone}</div>
                            {customer.email && (
                              <div className="text-gray-400 text-xs truncate max-w-[120px]">{customer.email}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 sm:px-6">
                            <div className="text-white text-xs sm:text-sm">{customer.wilayaName}</div>
                            <div className="text-gray-400 text-xs truncate max-w-[100px]">{customer.address}</div>
                          </td>
                          <td className="py-3 px-3 sm:px-6">
                            <div className="text-white font-semibold text-sm">{customer.totalOrders}</div>
                          </td>
                          <td className="py-3 px-3 sm:px-6">
                            <div className="text-white font-semibold text-sm">{customer.totalSpent.toLocaleString()} DA</div>
                          </td>
                          <td className="py-3 px-3 sm:px-6">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              customer.status === 'active' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-gray-900 text-gray-300'
                            }`}>
                              {customer.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-6">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  alert(`Customer Details:\n\nName: ${customer.name}\nPhone: ${customer.phone}\nEmail: ${customer.email || 'N/A'}\nAddress: ${customer.address}\nWilaya: ${customer.wilayaName}\nTotal Orders: ${customer.totalOrders}\nTotal Spent: ${customer.totalSpent} DA\nStatus: ${customer.status}`);
                                }}
                                className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const customerOrders = orders.filter(order => 
                                    order.customerName === customer.name || 
                                    order.customerEmail === customer.email ||
                                    order.customerPhone === customer.phone
                                  );
                                  alert(`Customer Orders (${customerOrders.length}):\n\n${customerOrders.map(order => 
                                    `Order ${order.id}: ${order.productName} - ${order.total} DA (${order.status})`
                                  ).join('\n')}`);
                                }}
                                className="text-green-400 hover:text-green-300 transition-colors p-1"
                                title="View Orders"
                              >
                                <ShoppingCart className="w-4 h-4" />
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
        )}

        {activeTab === 'maintenance' && (
          <div className="p-4 sm:p-6">
            <OptimizedMaintenanceManager />
          </div>
        )}

        {activeTab === 'wilayas' && (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Wilaya Tariffs</h2>
                <p className="text-gray-400 text-sm sm:text-base">Manage shipping costs for each wilaya</p>
              </div>
              <button
                onClick={resetWilayaTariffs}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors w-full sm:w-auto"
              >
                Reset to Default
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left text-white font-medium py-3 px-3 sm:px-4">Wilaya</th>
                      <th className="text-center text-white font-medium py-3 px-3 sm:px-4">Stop Desk</th>
                      <th className="text-center text-white font-medium py-3 px-3 sm:px-4">Home Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wilayaTariffs.map((wilaya) => (
                      <tr key={wilaya.id} className="border-t border-gray-800">
                        <td className="py-3 px-3 sm:px-4">
                          <div>
                            <div className="text-white font-medium text-sm">{wilaya.name}</div>
                            <div className="text-gray-400 text-xs">#{wilaya.id}</div>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center">
                          <input
                            type="number"
                            value={wilaya.stopDeskEcommerce}
                            onChange={(e) => updateWilayaTariff(wilaya.id, 'stopDeskEcommerce', parseInt(e.target.value) || 0)}
                            className="w-20 sm:w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-white text-sm"
                          />
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center">
                          <input
                            type="number"
                            value={wilaya.domicileEcommerce}
                            onChange={(e) => updateWilayaTariff(wilaya.id, 'domicileEcommerce', parseInt(e.target.value) || 0)}
                            className="w-20 sm:w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-white text-sm"
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
    );
  };

  // Use mobile layout for mobile devices - improved detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <>
        <ErrorDisplay />
      <MobileAdminLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        username={username}
      >
        {renderContent()}
      </MobileAdminLayout>
      </>
    );
  }

  return (
    <>
      <ErrorDisplay />
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

          {activeTab === 'inventory' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
                  <p className="text-gray-400">Manage product stock and inventory levels</p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                  <p className="text-gray-400">Add products to manage inventory.</p>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="text-left text-white font-medium py-4 px-6">Product</th>
                          <th className="text-left text-white font-medium py-4 px-6">Category</th>
                          <th className="text-left text-white font-medium py-4 px-6">Colors</th>
                          <th className="text-left text-white font-medium py-4 px-6">Sizes</th>
                          <th className="text-left text-white font-medium py-4 px-6">Stock Levels</th>
                          <th className="text-left text-white font-medium py-4 px-6">Total Stock</th>
                          <th className="text-left text-white font-medium py-4 px-6">Status</th>
                          <th className="text-left text-white font-medium py-4 px-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => {
                          const getTotalStock = () => {
                            if (!product.stock) return 0;
                            return Object.values(product.stock).reduce((total: number, colorStock: any) => {
                              if (typeof colorStock === 'object' && colorStock !== null) {
                                return total + Object.values(colorStock).reduce((sum: number, qty: any) => {
                                  return sum + (typeof qty === 'number' ? qty : 0);
                                }, 0);
                              }
                              return total;
                            }, 0);
                          };

                          const getStockBySize = (size: string) => {
                            if (!product.stock) return 0;
                            return Object.values(product.stock).reduce((total: number, colorStock: any) => {
                              if (typeof colorStock === 'object' && colorStock !== null) {
                                return total + (typeof colorStock[size] === 'number' ? colorStock[size] : 0);
                              }
                              return total;
                            }, 0);
                          };

                          const totalStock = getTotalStock();
                          const isLowStock = totalStock < 10;
                          const isOutOfStock = totalStock === 0;

                          return (
                            <tr key={product.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div>
                                    <div className="text-white font-medium">{product.name}</div>
                                    <div className="text-gray-400 text-sm">SKU: {product.sku || 'N/A'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
                                  {product.category}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-wrap gap-1">
                                  {product.colors.map((color, index) => (
                                    <span
                                      key={index}
                                      className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                                    >
                                      {color}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-wrap gap-1">
                                  {product.sizes.map((size, index) => (
                                    <span
                                      key={index}
                                      className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                                    >
                                      {size}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="space-y-1">
                                  {product.sizes.map((size) => {
                                    const sizeStock = getStockBySize(size);
                                    return (
                                      <div key={size} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-300">{size}:</span>
                                        <span className={`font-medium ${
                                          sizeStock === 0 ? 'text-red-400' :
                                          sizeStock < 5 ? 'text-yellow-400' :
                                          'text-green-400'
                                        }`}>
                                          {sizeStock}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-white font-semibold text-lg">{totalStock}</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  {isOutOfStock ? (
                                    <span className="flex items-center text-red-400 text-sm">
                                      <AlertTriangle className="w-4 h-4 mr-1" />
                                      Out of Stock
                                    </span>
                                  ) : isLowStock ? (
                                    <span className="flex items-center text-yellow-400 text-sm">
                                      <AlertTriangle className="w-4 h-4 mr-1" />
                                      Low Stock
                                    </span>
                                  ) : (
                                    <span className="flex items-center text-green-400 text-sm">
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      In Stock
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <button
                                  onClick={() => setEditingProduct(product)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Edit Stock"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'maintenance' && <OptimizedMaintenanceManager />}

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
                <div className="flex space-x-2">
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>

              {/* Customer Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-white">{customers.length}</div>
                  <div className="text-sm text-gray-400">Total Customers</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-green-400">
                    {customers.filter(c => c.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-400">Active Customers</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-blue-400">
                    {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total Orders</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-purple-400">
                    {customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length) : 0} DA
                  </div>
                  <div className="text-sm text-gray-400">Avg. Customer Value</div>
                </div>
              </div>

              {customers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No customers yet</h3>
                  <p className="text-gray-400">Customer data will appear here when orders are placed.</p>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="text-left text-white font-medium py-4 px-6">Customer</th>
                          <th className="text-left text-white font-medium py-4 px-6">Contact</th>
                          <th className="text-left text-white font-medium py-4 px-6">Location</th>
                          <th className="text-left text-white font-medium py-4 px-6">Orders</th>
                          <th className="text-left text-white font-medium py-4 px-6">Total Spent</th>
                          <th className="text-left text-white font-medium py-4 px-6">Last Order</th>
                          <th className="text-left text-white font-medium py-4 px-6">Status</th>
                          <th className="text-left text-white font-medium py-4 px-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="text-white font-medium">{customer.name}</div>
                              <div className="text-gray-400 text-sm">ID: {customer.id}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-white text-sm">{customer.phone}</div>
                              {customer.email && (
                                <div className="text-gray-400 text-sm">{customer.email}</div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-white text-sm">{customer.wilayaName}</div>
                              <div className="text-gray-400 text-sm max-w-xs truncate">{customer.address}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-white font-semibold">{customer.totalOrders}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-white font-semibold">{customer.totalSpent.toLocaleString()} DA</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-gray-300 text-sm">
                                {new Date(customer.lastOrderDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                customer.status === 'active' 
                                  ? 'bg-green-900 text-green-300' 
                                  : 'bg-gray-900 text-gray-300'
                              }`}>
                                {customer.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    // View customer details
                                    alert(`Customer Details:\n\nName: ${customer.name}\nPhone: ${customer.phone}\nEmail: ${customer.email || 'N/A'}\nAddress: ${customer.address}\nWilaya: ${customer.wilayaName}\nTotal Orders: ${customer.totalOrders}\nTotal Spent: ${customer.totalSpent} DA\nStatus: ${customer.status}`);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    // View customer orders
                                    const customerOrders = orders.filter(order => 
                                      order.customerName === customer.name || 
                                      order.customerEmail === customer.email ||
                                      order.customerPhone === customer.phone
                                    );
                                    alert(`Customer Orders (${customerOrders.length}):\n\n${customerOrders.map(order => 
                                      `Order ${order.id}: ${order.productName} - ${order.total} DA (${order.status})`
                                    ).join('\n')}`);
                                  }}
                                  className="text-green-400 hover:text-green-300 transition-colors"
                                  title="View Orders"
                                >
                                  <ShoppingCart className="w-4 h-4" />
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
                                  onChange={(e) => updateOrderStatus(order.id, { status: e.target.value as Order['status'] })}
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
                console.log(`Data synced! Version: ${data.version}, Products: ${data.products?.length || 0}`);
              } else {
                console.error('Failed to fetch data from API');
              }
            } catch (error) {
              console.error('Manual sync error:', error);
              console.error('Failed to sync data');
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
              console.log('Default products have been added to your store');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
          >
            📦 Add Sample Products
          </button>
        )}
      </div>
    </div>
    </>
  );
}