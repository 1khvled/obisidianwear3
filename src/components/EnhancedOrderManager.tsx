'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Package,
  User,
  Calendar,
  DollarSign,
  MoreVertical,
  Download,
  RefreshCw,
  X,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Order } from '@/types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { orderService } from '@/services/orderService';
import { backendService } from '@/services/backendService';

interface EnhancedOrderManagerProps {
  orders?: Order[];
  onUpdateOrder?: (id: string, updates: Partial<Order>) => void;
  onDeleteOrder?: (id: string) => void;
  onViewOrder?: (order: Order) => void;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed';

export default function EnhancedOrderManager({ 
  orders = [], 
  onUpdateOrder = () => {}, 
  onDeleteOrder = () => {},
  onViewOrder = () => {}
}: EnhancedOrderManagerProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ordersData, setOrdersData] = useState<Order[]>(orders);
  const [madeToOrderOrders, setMadeToOrderOrders] = useState<any[]>([]);
  const [showMadeToOrderTab, setShowMadeToOrderTab] = useState(false);

  // Load orders data
  const loadOrders = async () => {
    try {
      setLoading(true);
      const savedOrders = await backendService.getOrders();
      setOrdersData(savedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load made-to-order orders
  const loadMadeToOrderOrders = async () => {
    try {
      const response = await fetch('/api/made-to-order/orders');
      const data = await response.json();
      setMadeToOrderOrders(data?.orders || []);
    } catch (error) {
      console.error('Error loading made-to-order orders:', error);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadOrders(), loadMadeToOrderOrders()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadMadeToOrderOrders();
  }, []);

  // Helper function to get the best image source for orders
  const getOrderImageSrc = (order: Order) => {
    if (order.productImage && order.productImage.length > 100) {
      return order.productImage;
    }
    return null;
  };
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Export orders to CSV
  const handleExportOrders = () => {
    try {
      const currentOrders = showMadeToOrderTab ? madeToOrderOrders : ordersData;
      console.log('Starting export with orders:', currentOrders.length);
      
      // Check if we have orders to export
      if (!currentOrders || currentOrders.length === 0) {
        alert('No orders to export.');
        return;
      }
      
      // Update orderService with current orders
      orderService.setOrders(currentOrders);
      
      // Generate CSV content
      const csvContent = orderService.exportOrdersCSV();
      
      if (!csvContent || csvContent.trim() === '') {
        throw new Error('Generated CSV content is empty');
      }
      
      console.log('Generated CSV content length:', csvContent.length);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const orderType = showMadeToOrderTab ? 'made-to-order' : 'collection';
      link.setAttribute('download', `${orderType}-orders-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      console.log('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      alert(`Failed to export orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  // Filter and sort orders
  const currentOrders = showMadeToOrderTab ? madeToOrderOrders : ordersData;
  const filteredOrders = (currentOrders || [])
    .filter(order => {
      const matchesSearch = 
        (order.customerName || order.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.productName || order.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.id || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      const matchesPayment = paymentFilter === 'All' || order.paymentStatus === paymentFilter;
      
      return matchesSearch && matchesStatus && matchesPayment;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof Order];
      let bValue = b[sortBy as keyof Order];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortOrder === 'asc' ? -1 : 1;
      if (bValue === undefined) return sortOrder === 'asc' ? 1 : -1;
      
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'processing': return 'text-blue-400 bg-blue-900/20';
      case 'shipped': return 'text-purple-400 bg-purple-900/20';
      case 'delivered': return 'text-green-400 bg-green-900/20';
      case 'cancelled': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'paid': return 'text-green-400 bg-green-900/20';
      case 'failed': return 'text-red-400 bg-red-900/20';
      case 'refunded': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    setSelectedOrders(
      selectedOrders.length === filteredOrders.length 
        ? [] 
        : filteredOrders.map(o => o.id)
    );
  };

  const handleBulkStatusUpdate = (status: OrderStatus) => {
    selectedOrders.forEach(id => onUpdateOrder(id, { status }));
    setSelectedOrders([]);
    setShowBulkActions(false);
  };

  const handleDelete = (order: Order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      try {
        setLoading(true);
        
        // Delete from database
        const response = await fetch(`/api/orders/${orderToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Remove from local state
          setOrdersData(prev => prev.filter(order => order.id !== orderToDelete.id));
          setMadeToOrderOrders(prev => prev.filter(order => order.id !== orderToDelete.id));
          
          // Call the prop function if provided
          onDeleteOrder(orderToDelete.id);
          
          console.log('Order deleted successfully');
        } else {
          const errorData = await response.json();
          console.error('Failed to delete order:', errorData.error);
          alert(`Failed to delete order: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order. Please try again.');
      } finally {
        setLoading(false);
        setShowDeleteModal(false);
        setOrderToDelete(null);
      }
    }
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update local state
        setOrdersData(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
        setMadeToOrderOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
        
        // Call the prop function if provided
        onUpdateOrder(orderId, { status });
        
        console.log('Order status updated successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to update order status:', errorData.error);
        alert(`Failed to update order status: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus }),
      });

      if (response.ok) {
        // Update local state
        setOrdersData(prev => prev.map(order => 
          order.id === orderId ? { ...order, paymentStatus } : order
        ));
        setMadeToOrderOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, paymentStatus } : order
        ));
        
        // Call the prop function if provided
        onUpdateOrder(orderId, { paymentStatus });
        
        console.log('Order payment status updated successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to update payment status:', errorData.error);
        alert(`Failed to update payment status: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  useEffect(() => {
    setShowBulkActions(selectedOrders.length > 0);
  }, [selectedOrders]);

  // Calculate statistics
  const allOrders = [...ordersData, ...madeToOrderOrders];
  const stats = {
    total: allOrders.length,
    pending: allOrders.filter(o => o.status === 'pending').length,
    processing: allOrders.filter(o => o.status === 'processing' || o.status === 'in_production').length,
    shipped: allOrders.filter(o => o.status === 'shipped').length,
    delivered: allOrders.filter(o => o.status === 'delivered').length,
    totalRevenue: allOrders.reduce((sum, order) => sum + (order.total || order.total_price || 0), 0),
    averageOrderValue: allOrders.length > 0 ? allOrders.reduce((sum, order) => sum + (order.total || order.total_price || 0), 0) / allOrders.length : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders Management</h2>
          <p className="text-gray-400">Manage customer orders and track fulfillment</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExportOrders}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Order Type Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setShowMadeToOrderTab(false)}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !showMadeToOrderTab
              ? 'bg-purple-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Collection Orders ({ordersData.length})
        </button>
        <button
          onClick={() => setShowMadeToOrderTab(true)}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showMadeToOrderTab
              ? 'bg-purple-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Made-to-Order ({madeToOrderOrders.length})
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Orders</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-sm text-gray-400">Pending</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{stats.processing}</div>
          <div className="text-sm text-gray-400">Processing</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-purple-400">{stats.shipped}</div>
          <div className="text-sm text-gray-400">Shipped</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">{stats.delivered}</div>
          <div className="text-sm text-gray-400">Delivered</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{stats.totalRevenue.toLocaleString()} DA</div>
          <div className="text-sm text-gray-400">Total Revenue</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'All')}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="orderDate-desc">Newest First</option>
            <option value="orderDate-asc">Oldest First</option>
            <option value="total-desc">Highest Value</option>
            <option value="total-asc">Lowest Value</option>
            <option value="customerName-asc">Customer A-Z</option>
            <option value="customerName-desc">Customer Z-A</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center gap-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <span className="text-blue-300 text-sm">
              {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <select
                onChange={(e) => handleBulkStatusUpdate(e.target.value as OrderStatus)}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="">Update Status</option>
                <option value="processing">Mark as Processing</option>
                <option value="shipped">Mark as Shipped</option>
                <option value="delivered">Mark as Delivered</option>
                <option value="cancelled">Cancel Orders</option>
              </select>
              <Button variant="outline" size="sm" onClick={() => setSelectedOrders([])}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">Order ID</th>
                <th className="px-4 py-3 text-left text-white font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-white font-medium">Product</th>
                <th className="px-4 py-3 text-left text-white font-medium">Shipping</th>
                <th className="px-4 py-3 text-left text-white font-medium">Status</th>
                <th className="px-4 py-3 text-left text-white font-medium">Payment</th>
                <th className="px-4 py-3 text-left text-white font-medium">Total</th>
                <th className="px-4 py-3 text-left text-white font-medium">Date</th>
                <th className="px-4 py-3 text-left text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-mono text-sm">#{order.id.slice(-8)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{order.customerName || order.customer_name || 'Unknown Customer'}</div>
                    <div className="text-gray-400 text-sm flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.customerPhone || order.customer_phone || 'No phone'}
                    </div>
                    <div className="text-gray-400 text-xs flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {order.customerEmail || order.customer_email || 'No email'}
                    </div>
                    {(order.customerCity || order.wilaya_name) && (
                      <div className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {order.customerCity || order.wilaya_name}
                      </div>
                    )}
                    {(order.customerAddress || order.customer_address) && (
                      <div className="text-gray-500 text-xs mt-1 truncate max-w-[200px]" title={order.customerAddress || order.customer_address}>
                        📍 {order.customerAddress || order.customer_address}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      {getOrderImageSrc(order) && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          {getOrderImageSrc(order)?.startsWith('data:') ? (
                            <img
                              src={getOrderImageSrc(order)!}
                              alt={order.productName}
                              className="w-full h-full object-cover"
                              onLoad={() => console.log('✅ Order product image loaded:', order.productName)}
                              onError={(e) => console.error('❌ Order product image failed to load:', order.productName, e)}
                            />
                          ) : (
                            <Image
                              src={getOrderImageSrc(order)!}
                              alt={order.productName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              onLoad={() => console.log('✅ Order product image loaded:', order.productName)}
                              onError={(e) => console.error('❌ Order product image failed to load:', order.productName, e)}
                            />
                          )}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">{order.productName || order.product_name || 'Unknown Product'}</div>
                        <div className="text-gray-400 text-sm">
                          {order.selectedSize || order.selected_size || 'N/A'} • {order.selectedColor || order.selected_color || 'N/A'}
                        </div>
                        <div className="text-gray-400 text-xs">Qty: {order.quantity || 1}</div>
                        {showMadeToOrderTab && order.deposit_amount && (
                          <div className="text-yellow-400 text-xs">
                            Deposit: {order.deposit_amount} DA
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white text-sm">
                      {order.shippingType === 'homeDelivery' ? 'Home Delivery' : 'Stop Desk'}
                    </div>
                    <div className="text-gray-400 text-xs">{order.wilayaName || order.wilaya_name || 'Unknown Wilaya'}</div>
                    <div className="text-gray-400 text-xs">{order.shippingCost || order.shipping_cost || 0} DA</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value as PaymentStatus)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 ${getPaymentStatusColor(order.paymentStatus)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-semibold">{(order.total || order.total_price || 0).toLocaleString()} DA</div>
                    {showMadeToOrderTab && order.remaining_amount && (
                      <div className="text-yellow-400 text-xs">
                        Remaining: {order.remaining_amount} DA
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300 text-sm">
                      {order.orderDate || order.order_date ? new Date(order.orderDate || order.order_date).toLocaleDateString() : 'Unknown Date'}
                    </div>
                    {showMadeToOrderTab && order.estimated_completion_date && (
                      <div className="text-blue-400 text-xs">
                        Est: {new Date(order.estimated_completion_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="View Order"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(order)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
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

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No orders found</h3>
          <p className="text-gray-400">
            {searchQuery || statusFilter !== 'All' || paymentFilter !== 'All'
              ? 'Try adjusting your search or filters'
              : 'Orders will appear here when customers make purchases'
            }
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Order"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete order <strong>{orderToDelete?.id}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">Order Details</h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order ID:</span>
                      <span className="text-white font-mono">#{selectedOrder.id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order Date:</span>
                      <span className="text-white">{new Date(selectedOrder.orderDate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Payment Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="text-white">{selectedOrder.subtotal.toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shipping Cost:</span>
                      <span className="text-white">{selectedOrder.shippingCost.toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-2">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-white font-semibold text-lg">{selectedOrder.total.toLocaleString()} DA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Name</div>
                    <div className="text-white font-medium">{selectedOrder.customerName}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Phone</div>
                    <div className="text-white">{selectedOrder.customerPhone}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Email</div>
                    <div className="text-white">{selectedOrder.customerEmail || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">City</div>
                    <div className="text-white">{selectedOrder.customerCity || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Address</div>
                    <div className="text-white">{selectedOrder.customerAddress || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Product Name</div>
                    <div className="text-white font-medium">{selectedOrder.productName}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Size & Color</div>
                    <div className="text-white">{selectedOrder.selectedSize} • {selectedOrder.selectedColor}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Quantity</div>
                    <div className="text-white">{selectedOrder.quantity}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Unit Price</div>
                    <div className="text-white">{(selectedOrder.subtotal / selectedOrder.quantity).toLocaleString()} DA</div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Shipping Type</div>
                    <div className="text-white">
                      {selectedOrder.shippingType === 'homeDelivery' ? 'Home Delivery' : 'Stop Desk'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Wilaya</div>
                    <div className="text-white">{selectedOrder.wilayaName}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Shipping Cost</div>
                    <div className="text-white">{selectedOrder.shippingCost.toLocaleString()} DA</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Payment Method</div>
                    <div className="text-white">
                      {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedOrder.notes || selectedOrder.trackingNumber || selectedOrder.estimatedDelivery) && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Additional Information</h4>
                  <div className="space-y-3 text-sm">
                    {selectedOrder.trackingNumber && (
                      <div>
                        <div className="text-gray-400 mb-1">Tracking Number</div>
                        <div className="text-white font-mono">{selectedOrder.trackingNumber}</div>
                      </div>
                    )}
                    {selectedOrder.estimatedDelivery && (
                      <div>
                        <div className="text-gray-400 mb-1">Estimated Delivery</div>
                        <div className="text-white">{selectedOrder.estimatedDelivery}</div>
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <div>
                        <div className="text-gray-400 mb-1">Notes</div>
                        <div className="text-white">{selectedOrder.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-800">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
