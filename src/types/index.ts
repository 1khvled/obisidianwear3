export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description: string;
  category: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  stock: {
    [size: string]: {
      [color: string]: number;
    };
  };
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  featured?: boolean;
  sizeChartCategory?: string;
  customSizeChart?: {
    title: string;
    measurements: Array<{
      size: string;
      [key: string]: string | number;
    }>;
    instructions: string;
  };
  useCustomSizeChart?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  wilayaId: number;
  wilayaName: string;
  shippingType: 'stopDesk' | 'homeDelivery';
  shippingCost: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  subtotal: number;
  total: number;
  orderDate: Date;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  paymentMethod: 'cod' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed';
  estimatedDelivery?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Wilaya {
  id: number;
  name: string;
  nameAr: string;
  stopDeskEcommerce: number;
  domicileEcommerce: number;
}

export interface WilayaTariff {
  id: string;
  wilaya_id: number;
  name: string;
  domicile_ecommerce: number;
  stop_desk_ecommerce: number;
  order: number;
  created_at?: string;
  updated_at?: string;
  // Legacy compatibility (will be removed in future versions)
  home_delivery?: number;
  stop_desk?: number;
  homeDelivery?: number;
  stopDesk?: number;
  domicileEcommerce?: number;
  stopDeskEcommerce?: number;
}

export interface ShippingOption {
  type: 'stopDesk' | 'homeDelivery';
  wilayaId: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  wilayaId: number;
  wilayaName: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
  status: 'active' | 'inactive';
}

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }[];
  ordersByStatus: {
    status: string;
    count: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    orders: number;
  }[];
  topWilayas: {
    wilayaId: number;
    wilayaName: string;
    orderCount: number;
    revenue: number;
  }[];
}

export interface StockAlert {
  productId: string;
  productName: string;
  size: string;
  color: string;
  currentStock: number;
  threshold: number;
  severity: 'low' | 'critical' | 'out';
}

export interface CustomSizeChart {
  title: string;
  instructions: string;
  measurements: Array<{
    size: string;
    [key: string]: string | number;
  }>;
}

export interface MadeToOrderProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  colors: string[];
  sizes: string[];
  category: string;
  tags?: string[];
  isActive: boolean;
  displayOrder: number;
  customSizeChart?: CustomSizeChart;
  custom_size_chart?: CustomSizeChart;
  useCustomSizeChart?: boolean;
  use_custom_size_chart?: boolean;
  sizeChartCategory?: string;
  size_chart_category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MadeToOrderOrder {
  id: string;
  productId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  wilayaId: number;
  wilayaName: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  depositAmount: number; // 50% of total price
  remainingAmount: number; // 50% of total price
  shippingTime: string; // "20-18 days"
  status: 'pending' | 'confirmed' | 'in_production' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  whatsappContact?: string;
  notes?: string;
  orderDate: Date;
  estimatedCompletionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
