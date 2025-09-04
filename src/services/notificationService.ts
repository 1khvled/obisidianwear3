import { Notification } from '@/context/NotificationContext';

class NotificationService {
  private static instance: NotificationService;
  private listeners: Set<(notification: Notification) => void> = new Set();
  private lastOrderCheck: Date = new Date();
  private lastStockCheck: Date = new Date();
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startPeriodicChecks();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Subscribe to notifications
  public subscribe(listener: (notification: Notification) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Emit notification to all listeners
  private emit(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    this.listeners.forEach(listener => listener(newNotification));
  }

  // Start periodic checks for new orders and low stock
  private startPeriodicChecks(): void {
    this.checkInterval = setInterval(async () => {
      await this.checkForNewOrders();
      await this.checkForLowStock();
    }, 30000); // Check every 30 seconds
  }

  // Check for new orders
  private async checkForNewOrders(): Promise<void> {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) return;

      const orders = await response.json();
      const newOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.orderDate);
        return orderDate > this.lastOrderCheck;
      });

      if (newOrders.length > 0) {
        newOrders.forEach((order: any) => {
          this.emit({
            type: 'order',
            title: 'New Order Received',
            message: `Order #${order.id} from ${order.customerName} - ${order.total} DA`,
            actionUrl: `/admin?tab=orders`
          });
        });

        this.lastOrderCheck = new Date();
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  }

  // Check for low stock
  private async checkForLowStock(): Promise<void> {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) return;

      const products = await response.json();
      const lowStockProducts = products.filter((product: any) => {
        if (!product.stock || !product.inStock) return false;
        
        // Calculate total stock
        let totalStock = 0;
        if (typeof product.stock === 'object') {
          Object.values(product.stock).forEach((sizeStock: any) => {
            if (typeof sizeStock === 'object') {
              Object.values(sizeStock).forEach((colorStock: any) => {
                if (typeof colorStock === 'number') {
                  totalStock += colorStock;
                }
              });
            }
          });
        }
        
        return totalStock > 0 && totalStock <= 5; // Low stock threshold
      });

      if (lowStockProducts.length > 0) {
        lowStockProducts.forEach((product: any) => {
          this.emit({
            type: 'stock',
            title: 'Low Stock Alert',
            message: `${product.name} is running low on stock`,
            actionUrl: `/admin?tab=inventory`
          });
        });
      }
    } catch (error) {
      console.error('Error checking for low stock:', error);
    }
  }

  // Manual notification methods
  public notifyOrderCreated(order: any): void {
    this.emit({
      type: 'order',
      title: 'New Order Received',
      message: `Order #${order.id} from ${order.customerName} - ${order.total} DA`,
      actionUrl: `/admin?tab=orders`
    });
  }

  public notifyStockLow(product: any): void {
    this.emit({
      type: 'stock',
      title: 'Low Stock Alert',
      message: `${product.name} is running low on stock`,
      actionUrl: `/admin?tab=inventory`
    });
  }

  public notifySuccess(title: string, message: string): void {
    this.emit({
      type: 'success',
      title,
      message
    });
  }

  public notifyError(title: string, message: string): void {
    this.emit({
      type: 'error',
      title,
      message
    });
  }

  public notifyInfo(title: string, message: string): void {
    this.emit({
      type: 'info',
      title,
      message
    });
  }

  // Cleanup
  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners.clear();
  }
}

export default NotificationService;
