'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign,
  Eye,
  Star,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react';
import StatCard from './ui/StatCard';
import Chart from './ui/Chart';
import AnimatedCounter from './ui/AnimatedCounter';
import { Product, Order } from '@/types';

interface EnhancedDashboardProps {
  products: Product[];
  orders: Order[];
  customers: any[];
}

export default function EnhancedDashboard({ products, orders, customers }: EnhancedDashboardProps) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<{product: Product, orders: number}[]>([]);

  useEffect(() => {
    // Calculate statistics
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalCustomers = customers.length;
    
    // Low stock products (less than 10 total stock)
    const lowStockProducts = products.filter(product => {
      if (!product.stock) return true;
      const totalStock = Object.values(product.stock).reduce((total, colorStock) => {
        return total + Object.values(colorStock).reduce((sum, qty) => sum + qty, 0);
      }, 0);
      return totalStock < 10;
    }).length;

    // Pending orders
    const pendingOrders = orders.filter(order => order.status === 'pending').length;

    // Monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyRevenue = orders
      .filter(order => new Date(order.orderDate) >= thirtyDaysAgo)
      .reduce((sum, order) => sum + order.total, 0);

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalProducts,
      totalOrders,
      totalRevenue,
      totalCustomers,
      lowStockProducts,
      pendingOrders,
      monthlyRevenue,
      averageOrderValue
    });

    // Recent orders (last 5)
    setRecentOrders(orders.slice(0, 5));

    // Top products by order count
    const productOrderCounts = products.map(product => {
      const productOrders = orders.filter(order => order.productId === product.id);
      return { product, orders: productOrders.length };
    }).sort((a, b) => b.orders - a.orders).slice(0, 5);

    setTopProducts(productOrderCounts);
  }, [products, orders, customers]);

  // Chart data
  const revenueData = [
    { label: 'Jan', value: 12000, color: '#3b82f6' },
    { label: 'Feb', value: 15000, color: '#3b82f6' },
    { label: 'Mar', value: 18000, color: '#3b82f6' },
    { label: 'Apr', value: 22000, color: '#3b82f6' },
    { label: 'May', value: 25000, color: '#3b82f6' },
    { label: 'Jun', value: stats.monthlyRevenue, color: '#10b981' }
  ];

  const categoryData = products.reduce((acc, product) => {
    const category = product.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    label: category,
    value: count,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={<AnimatedCounter value={stats.totalProducts} />}
          change={12}
          changeType="positive"
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={<AnimatedCounter value={stats.totalOrders} />}
          change={8}
          changeType="positive"
          icon={ShoppingCart}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={`${stats.totalRevenue.toLocaleString()} DA`}
          change={15}
          changeType="positive"
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Total Customers"
          value={<AnimatedCounter value={stats.totalCustomers} />}
          change={5}
          changeType="positive"
          icon={Users}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Low Stock Products"
          value={<AnimatedCounter value={stats.lowStockProducts} />}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Pending Orders"
          value={<AnimatedCounter value={stats.pendingOrders} />}
          icon={Calendar}
          color="orange"
        />
        <StatCard
          title="Monthly Revenue"
          value={`${stats.monthlyRevenue.toLocaleString()} DA`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Avg Order Value"
          value={`${Math.round(stats.averageOrderValue).toLocaleString()} DA`}
          icon={Star}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
            <div className="flex items-center text-green-400 text-sm">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +15% from last month
            </div>
          </div>
          <Chart data={revenueData} type="bar" height={200} />
        </div>

        {/* Category Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Products by Category</h3>
            <div className="text-sm text-gray-400">{products.length} total</div>
          </div>
          <Chart data={categoryChartData} type="doughnut" height={200} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
              View all
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{order.customerName}</p>
                      <p className="text-gray-400 text-sm">{order.productName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{order.total.toLocaleString()} DA</p>
                    <p className="text-gray-400 text-sm">{order.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Top Products</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
              View all
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((item, index) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.product.name}</p>
                      <p className="text-gray-400 text-sm">{item.product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{item.orders} orders</p>
                    <p className="text-gray-400 text-sm">{item.product.price.toLocaleString()} DA</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No products yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
