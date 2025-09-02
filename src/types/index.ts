export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  category: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  stock: {
    S: number;
    M: number;
    L: number;
    XL: number;
  };
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderDate: Date;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
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

export interface ShippingOption {
  type: 'stopDesk' | 'homeDelivery';
  wilayaId: number;
  price: number;
}
