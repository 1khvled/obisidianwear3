'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  BarChart3, 
  Package, 
  Archive, 
  Settings, 
  ShoppingCart, 
  AlertTriangle, 
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdminLogin from '@/components/AdminLogin';
import ProductSkeleton from '@/components/ProductSkeleton';

// Lazy load heavy components
const EnhancedDashboard = lazy(() => import('@/components/EnhancedDashboard'));
const EnhancedProductManager = lazy(() => import('@/components/EnhancedProductManager'));
const SimpleInventoryManager = lazy(() => import('@/components/SimpleInventoryManager'));
const MadeToOrderManager = lazy(() => import('@/components/MadeToOrderManager'));
const EnhancedOrderManager = lazy(() => import('@/components/EnhancedOrderManager'));
const MaintenanceManager = lazy(() => import('@/components/MaintenanceManager'));

// Memoized components to prevent unnecessary re-renders
const MenuButton = React.memo(({ item, activeTab, setActiveTab }: {
  item: { id: string; label: string; icon: any };
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const Icon = item.icon;
  return (
    <button
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
});

MenuButton.displayName = 'MenuButton';

export default function AdminPage() {
  const { isAuthenticated, logout, username } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data only when needed
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadInitialData = async () => {
      if (activeTab === 'dashboard') {
        setLoading(true);
        try {
          // Load minimal data for dashboard
          const [productsRes, ordersRes] = await Promise.all([
            fetch('/api/products?limit=10'),
            fetch('/api/orders?limit=10')
          ]);
          
          const productsData = await productsRes.json();
          const ordersData = await ordersRes.json();
          
          setProducts(productsData.data || []);
          setOrders(ordersData.data || []);
        } catch (error) {
          console.error('Error loading initial data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, [activeTab, isAuthenticated]);

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
    if (loading) {
      return <ProductSkeleton />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Suspense fallback={<ProductSkeleton />}>
            <EnhancedDashboard products={products} orders={orders} customers={[]} />
          </Suspense>
        );
      case 'products':
        return (
          <Suspense fallback={<ProductSkeleton />}>
            <EnhancedProductManager
              products={products}
              onAddProduct={() => {}}
              onEditProduct={() => {}}
              onDeleteProduct={() => {}}
              onViewProduct={() => {}}
            />
          </Suspense>
        );
      case 'inventory':
        return (
          <Suspense fallback={<ProductSkeleton />}>
            <SimpleInventoryManager onClose={() => setActiveTab('dashboard')} />
          </Suspense>
        );
      case 'made-to-order':
        return (
          <Suspense fallback={<ProductSkeleton />}>
            <MadeToOrderManager onClose={() => setActiveTab('dashboard')} />
          </Suspense>
        );
      case 'orders':
        return (
          <Suspense fallback={<ProductSkeleton />}>
            <EnhancedOrderManager orders={orders} />
          </Suspense>
        );
      case 'maintenance':
        return (
          <Suspense fallback={<ProductSkeleton />}>
            <MaintenanceManager />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<ProductSkeleton />}>
            <EnhancedDashboard products={products} orders={orders} customers={[]} />
          </Suspense>
        );
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
            {menuItems.map((item) => (
              <MenuButton
                key={item.id}
                item={item}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
}
