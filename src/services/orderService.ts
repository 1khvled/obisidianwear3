'use client';

import { Order, Product } from '@/types';
// Email notifications are now handled in the API routes
import { backendService } from './backendService';

export interface CreateOrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  wilayaId: number;
  wilayaName: string;
  productId: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingType: 'domicileEcommerce' | 'stopDeskEcommerce';
  paymentMethod: 'cod' | 'bank_transfer';
  notes?: string;
}

class OrderService {
  private orders: Order[] = [];

  constructor() {
    this.initializeOrders();
    this.setupDataSync();
  }

  private async initializeOrders() {
    await this.loadOrders();
  }

  // Load orders from shared data service
  private async loadOrders() {
    this.orders = await backendService.getOrders();
  }

  // Setup data synchronization
  private setupDataSync() {
    if (typeof window !== 'undefined') {
      const handleDataUpdate = (event: CustomEvent) => {
        const data = event.detail;
        if (data && data.orders) {
          this.orders = data.orders;
        }
      };

      window.addEventListener('data-updated', handleDataUpdate as EventListener);
    }
  }

  // Generate unique order ID
  private generateOrderId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `OBS${timestamp.slice(-6)}${random}`;
  }

  // Create new order
  async createOrder(orderData: CreateOrderData, product: Product): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      // First, validate and reserve inventory
      const availableStock = product.stock?.[orderData.selectedSize]?.[orderData.selectedColor] || 0;
      
      if (availableStock < orderData.quantity) {
        console.error('❌ Insufficient stock for order:', { 
          available: availableStock, 
          requested: orderData.quantity,
          size: orderData.selectedSize,
          color: orderData.selectedColor
        });
        return { 
          success: false, 
          error: `Not enough stock available. Only ${availableStock} items available in ${orderData.selectedSize} ${orderData.selectedColor}.` 
        };
      }

      // Reserve inventory by calling the inventory API
      const reserveResponse = await fetch('/api/inventory/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: orderData.productId,
          size: orderData.selectedSize,
          color: orderData.selectedColor,
          quantity: orderData.quantity
        })
      });

      if (!reserveResponse.ok) {
        const errorData = await reserveResponse.json();
        console.error('❌ Failed to reserve inventory:', errorData);
        return { 
          success: false, 
          error: `Inventory reservation failed: ${errorData.error || 'Unknown error'}` 
        };
      }

      console.log('✅ Inventory reserved successfully for order');

      const orderId = this.generateOrderId();
      const now = new Date();

      const order: Order = {
        id: orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        customerCity: orderData.customerCity || '',
        wilayaId: orderData.wilayaId,
        wilayaName: orderData.wilayaName,
        productId: orderData.productId,
        productName: product.name,
        productImage: product.image,
        selectedSize: orderData.selectedSize,
        selectedColor: orderData.selectedColor,
        quantity: orderData.quantity,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        total: orderData.total,
        shippingType: orderData.shippingType === 'domicileEcommerce' ? 'homeDelivery' : 'stopDesk',
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        orderDate: now,
        notes: orderData.notes || '',
        trackingNumber: '',
        estimatedDelivery: this.calculateEstimatedDelivery(orderData.shippingType),
        createdAt: now,
        updatedAt: now
      };

      // Add order to shared data service
      await backendService.addOrder(order);
      this.orders.unshift(order); // Add to beginning for newest first

      // Email notifications are now handled automatically in the API routes
      console.log('✅ Order created successfully with inventory reserved, email will be sent via API');

      return { success: true, orderId };
    } catch (error) {
      console.error('❌ Failed to create order:', error);
      return { success: false, error: 'Failed to create order. Please try again.' };
    }
  }

  // Get all orders
  getOrders(): Order[] {
    return this.orders;
  }

  // Get order by ID
  getOrder(orderId: string): Order | undefined {
    return this.orders.find(order => order.id === orderId);
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string): Promise<boolean> {
    try {
      const orderIndex = this.orders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) return false;

      const updatedOrder = {
        ...this.orders[orderIndex],
        status,
        trackingNumber: trackingNumber || this.orders[orderIndex].trackingNumber,
        updatedAt: new Date()
      };

      // Update in shared data service
      await backendService.updateOrder(orderId, updatedOrder);
      
      // Update local orders
      this.orders[orderIndex] = updatedOrder;
      
      return true;
    } catch (error) {
      console.error('Failed to update order status:', error);
      return false;
    }
  }

  // Calculate estimated delivery
  private calculateEstimatedDelivery(shippingType: string): string {
    const deliveryDays = shippingType === 'domicileEcommerce' ? 3 : 2;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get orders statistics
  getOrderStats() {
    const total = this.orders.length;
    const pending = this.orders.filter(o => o.status === 'pending').length;
    const confirmed = this.orders.filter(o => o.status === 'confirmed').length;
    const shipped = this.orders.filter(o => o.status === 'shipped').length;
    const delivered = this.orders.filter(o => o.status === 'delivered').length;
    const cancelled = this.orders.filter(o => o.status === 'cancelled').length;

    const totalRevenue = this.orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);

    return {
      total,
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
      totalRevenue
    };
  }

  // Set orders (for export functionality)
  setOrders(orders: Order[]): void {
    this.orders = orders;
  }

  // Export orders to CSV
  exportOrdersCSV(): string {
    const headers = [
      'Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Product', 
      'Size', 'Color', 'Quantity', 'Total', 'Status', 'Wilaya', 'Shipping'
    ];

    const rows = this.orders.map(order => {
      // Handle date formatting - support both Date objects and strings
      let formattedDate = '';
      try {
        if (order.orderDate instanceof Date) {
          formattedDate = order.orderDate.toISOString().split('T')[0];
        } else if (typeof order.orderDate === 'string') {
          // Try to parse the string as a date
          const date = new Date(order.orderDate);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0];
          } else {
            formattedDate = order.orderDate; // Use as-is if can't parse
          }
        } else {
          formattedDate = 'Unknown';
        }
      } catch (error) {
        console.warn('Error formatting date for order:', order.id, error);
        formattedDate = 'Unknown';
      }

      return [
        order.id || 'N/A',
        formattedDate,
        order.customerName || 'N/A',
        order.customerEmail || 'N/A',
        order.customerPhone || 'N/A',
        order.productName || 'N/A',
        order.selectedSize || 'N/A',
        order.selectedColor || 'N/A',
        order.quantity || 0,
        order.total || 0,
        order.status || 'N/A',
        order.wilayaName || 'N/A',
        order.shippingType || 'N/A'
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Clear all orders (for testing)
  clearOrders() {
    this.orders = [];
    // Note: This would need to be implemented in dataService if needed
  }
}

// Create singleton instance
export const orderService = new OrderService();

export default orderService;
