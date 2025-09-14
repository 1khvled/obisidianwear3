'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Product, Order } from '@/types';
import Chart from './ui/Chart';
import StatCard from './ui/StatCard';
import AnimatedCounter from './ui/AnimatedCounter';
import Button from './ui/Button';

interface AnalyticsProps {
  products: Product[];
  orders: Order[];
  customers: any[];
}

type TimeRange = '7d' | '14d' | '30d' | '90d' | '1y' | 'custom';

export default function Analytics({ products, orders, customers }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate date range
  const getDateRange = (range: TimeRange) => {
    const now = new Date();
    const days = {
      '7d': 7,
      '14d': 14,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    if (range === 'custom') {
      // For custom range, use the last 7 days as default
      const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { startDate, endDate: now };
    }
    
    const startDate = new Date(now.getTime() - days[range] * 24 * 60 * 60 * 1000);
    return { startDate, endDate: now };
  };

  const { startDate, endDate } = getDateRange(timeRange);

  // Filter data by time range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Calculate analytics from real data only
  const analytics = {
    totalRevenue: filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0),
    totalOrders: filteredOrders.length,
    totalCustomers: customers.length,
    totalProducts: products.length,
    averageOrderValue: filteredOrders.length > 0 ? filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0) / filteredOrders.length : 0,
    conversionRate: customers.length > 0 ? (filteredOrders.length / customers.length) * 100 : 0,
    topProducts: getTopProducts(),
    revenueByDay: getRevenueByDay(),
    ordersByStatus: getOrdersByStatus(),
    revenueByCategory: getRevenueByCategory()
  };

  function getTopProducts() {
    const productSales = products.map(product => {
      const productOrders = filteredOrders.filter(order => order.productId === product.id);
      const totalRevenue = productOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalQuantity = productOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);
      return {
        product,
        orders: productOrders.length,
        revenue: totalRevenue,
        quantity: totalQuantity
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return productSales;
  }

  function getRevenueByDay() {
    const days = [];
    const currentDate = new Date(startDate);
    
    // Debug: Log the data we're working with
    console.log('getRevenueByDay - Start date:', startDate);
    console.log('getRevenueByDay - End date:', endDate);
    console.log('getRevenueByDay - Filtered orders count:', filteredOrders.length);
    console.log('getRevenueByDay - Sample orders:', filteredOrders.slice(0, 2));
    
    while (currentDate <= endDate) {
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        const isSameDay = orderDate.getFullYear() === currentDate.getFullYear() &&
                         orderDate.getMonth() === currentDate.getMonth() &&
                         orderDate.getDate() === currentDate.getDate();
        
        if (isSameDay) {
          console.log('Found matching order for', currentDate.toDateString(), ':', order);
        }
        
        return isSameDay;
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      console.log('Day:', currentDate.toDateString(), 'Orders:', dayOrders.length, 'Revenue:', revenue);
      
      days.push({
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue,
        orders: dayOrders.length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log('getRevenueByDay - Final days data:', days);
    return days;
  }

  function getOrdersByStatus() {
    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    filteredOrders.forEach(order => {
      statusCounts[order.status as keyof typeof statusCounts]++;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: getStatusColor(status)
    }));
  }

  function getRevenueByCategory() {
    const categoryRevenue: Record<string, number> = {};
    
    filteredOrders.forEach(order => {
      const product = products.find(p => p.id === order.productId);
      if (product) {
        categoryRevenue[product.category] = (categoryRevenue[product.category] || 0) + (order.total || 0);
      }
    });
    
    return Object.entries(categoryRevenue).map(([category, revenue]) => ({
      label: category,
      value: revenue,
      color: getCategoryColor(category)
    }));
  }

  function getStatusColor(status: string) {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#8b5cf6'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  }

  function getCategoryColor(category: string) {
    const colors = {
      'T-Shirts': '#3b82f6',
      'Hoodies': '#8b5cf6',
      'Accessories': '#10b981',
      'Other': '#6b7280'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  }

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExport = () => {
    // Create CSV data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', analytics.totalRevenue],
      ['Total Orders', analytics.totalOrders],
      ['Total Customers', analytics.totalCustomers],
      ['Average Order Value', analytics.averageOrderValue],
      ['Conversion Rate', analytics.conversionRate]
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-gray-400">Track your store performance and insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="14d">Last 2 weeks</option>
            <option value="30d">Last month</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`${analytics.totalRevenue.toLocaleString()} DA`}
          icon={DollarSign}
          color="green"
          loading={isLoading}
        />
        <StatCard
          title="Total Orders"
          value={<AnimatedCounter value={analytics.totalOrders} />}
          icon={ShoppingCart}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="Average Order Value"
          value={`${Math.round(analytics.averageOrderValue).toLocaleString()} DA`}
          icon={TrendingUp}
          color="purple"
          loading={isLoading}
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics.conversionRate.toFixed(1)}%`}
          icon={Users}
          color="orange"
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
            <div className="text-sm text-gray-400">
              {timeRange === '7d' ? '7 days' : 
               timeRange === '14d' ? '2 weeks' : 
               timeRange === '30d' ? '1 month' : 
               timeRange === '90d' ? '3 months' : '1 year'}
            </div>
          </div>
          <div className="min-h-[200px]">
            <Chart 
              data={analytics.revenueByDay.map(day => ({
                label: day.date,
                value: day.revenue,
                color: '#3b82f6'
              }))} 
              type="bar" 
              height={200} 
            />
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Orders by Status</h3>
            <div className="text-sm text-gray-400">{analytics.totalOrders} total</div>
          </div>
          <Chart 
            data={analytics.ordersByStatus} 
            type="doughnut" 
            height={200} 
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Top Products</h3>
            <div className="text-sm text-gray-400">By revenue</div>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {analytics.topProducts.map((item, index) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.product.name}</p>
                    <p className="text-gray-400 text-sm">{item.product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{item.revenue.toLocaleString()} DA</p>
                  <p className="text-gray-400 text-sm">{item.quantity} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue by Category</h3>
            <div className="text-sm text-gray-400">
              {analytics.revenueByCategory.reduce((sum, cat) => sum + cat.value, 0).toLocaleString()} DA
            </div>
          </div>
          <Chart 
            data={analytics.revenueByCategory} 
            type="bar" 
            height={200} 
          />
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-white">{analytics.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Customers</p>
              <p className="text-2xl font-bold text-white">{analytics.totalCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Time Period</p>
              <p className="text-2xl font-bold text-white">
                {timeRange === '7d' ? '7D' : 
                 timeRange === '30d' ? '30D' : 
                 timeRange === '90d' ? '90D' : '1Y'}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
