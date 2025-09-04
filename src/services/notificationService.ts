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
  private emit(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const newNotification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date()
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
          this.emit(`New Order: #${order.id} from ${order.customerName} - ${order.total} DA`, 'info');
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
          this.emit(`Low Stock Alert: ${product.name} is running low on stock`, 'warning');
        });
      }
    } catch (error) {
      console.error('Error checking for low stock:', error);
    }
  }

  // Manual notification methods
  public notifyOrderCreated(order: any): void {
    this.emit(`New Order: #${order.id} from ${order.customerName} - ${order.total} DA`, 'info');
  }

  public notifyStockLow(product: any): void {
    this.emit(`Low Stock Alert: ${product.name} is running low on stock`, 'warning');
  }

  public notifySuccess(message: string): void {
    this.emit(message, 'success');
  }

  public notifyError(message: string): void {
    this.emit(message, 'error');
  }

  public notifyInfo(message: string): void {
    this.emit(message, 'info');
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
