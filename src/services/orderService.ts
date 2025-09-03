'use client';

import { Order, Product } from '@/types';
import { sendOrderNotification, sendCustomerConfirmation, OrderEmailData } from './emailService';
import { dataService } from './dataService';

export interface CreateOrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
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
    this.loadOrders();
    this.setupDataSync();
  }

  // Load orders from shared data service
  private loadOrders() {
    this.orders = dataService.getOrders();
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
      const orderId = this.generateOrderId();
      const now = new Date();

      const order: Order = {
        id: orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
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
      dataService.addOrder(order);
      this.orders.unshift(order); // Add to beginning for newest first

      // Prepare email data
      const emailData: OrderEmailData = {
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        wilayaName: order.wilayaName,
        productName: order.productName,
        productImage: order.productImage,
        selectedSize: order.selectedSize,
        selectedColor: order.selectedColor,
        quantity: order.quantity,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
        shippingType: order.shippingType === 'homeDelivery' ? 'Home Delivery' : 'Pickup Point',
        orderDate: order.orderDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        paymentMethod: order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'
      };

      // Send email notifications (don't block order creation if emails fail)
      try {
        await Promise.all([
          sendOrderNotification(emailData),
          sendCustomerConfirmation(emailData)
        ]);
        console.log('✅ Order notifications sent successfully');
      } catch (emailError) {
        console.warn('⚠️ Order created but email notifications failed:', emailError);
      }

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
  updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string): boolean {
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
      dataService.updateOrder(orderId, updatedOrder);
      
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

  // Export orders to CSV
  exportOrdersCSV(): string {
    const headers = [
      'Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Product', 
      'Size', 'Color', 'Quantity', 'Total', 'Status', 'Wilaya', 'Shipping'
    ];

    const rows = this.orders.map(order => [
      order.id,
      order.orderDate.toISOString().split('T')[0],
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      order.productName,
      order.selectedSize,
      order.selectedColor,
      order.quantity,
      order.total,
      order.status,
      order.wilayaName,
      order.shippingType
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
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
