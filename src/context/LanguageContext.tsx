'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys - English only
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.collection': 'Collection',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    'nav.madeToOrder': 'Special Order',
    
    // Hero Section
    'hero.title': 'More than clothing,',
    'hero.title2': 'an attitude.',
    'hero.subtitle': 'Discover our exclusive collection of clothing that defines your unique style.',
    'hero.cta': 'View Collection',
    
    // Products
    'products.title': 'Our Collection',
    'products.empty': 'Empty Collection - Ready for Your Products',
    'products.empty.desc': 'Add your products to start selling',
    'products.addToCart': 'Add to Cart',
    'products.selectSize': 'Select Size',
    'products.selectColor': 'Select Color',
    'products.quantity': 'Quantity',
    'products.inStock': 'In Stock',
    'products.outOfStock': 'Out of Stock',
    'products.selectOptions': 'Select Options',
    'products.available': 'available',
    'products.viewProduct': 'View Product',
    'common.cancel': 'Cancel',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shipping': 'Shipping Options',
    'checkout.payment': 'Payment Method',
    'checkout.cod': 'Cash on Delivery (COD)',
    'checkout.cod.desc': 'Pay when your order arrives',
    'checkout.stopDesk': 'Stop Desk',
    'checkout.stopDesk.desc': 'Pick up your order at the relay point',
    'checkout.homeDelivery': 'Home Delivery',
    'checkout.homeDelivery.desc': 'Delivery directly to your home',
    'checkout.freeShipping': 'Free shipping! Your order exceeds',
    'checkout.subtotal': 'Subtotal',
    'checkout.shippingCost': 'Shipping',
    'checkout.total': 'Total',
    'checkout.placeOrder': 'Place Order',
    'checkout.form.name': 'Full Name',
    'checkout.form.phone': 'Phone Number',
    'checkout.form.address': 'Address',
    'checkout.form.city': 'City',
    'checkout.form.zipCode': 'ZIP Code',
    'checkout.form.notes': 'Order Notes (Optional)',
    'checkout.backToProduct': 'Back to Product',
    'checkout.orderSummary': 'Order Summary',
    'checkout.deliveryInformation': 'Delivery Information',
    'checkout.deliveryOptions': 'Delivery Options',
    'checkout.selectDeliveryOption': 'Please select a delivery option',
    'checkout.selected': 'SELECTED',
    'checkout.stopDeskDescription': 'Pick up your order at the relay point',
    'checkout.homeDeliveryDescription': 'Delivery directly to your home',
    'checkout.personalInformation': 'Personal Information',
    'checkout.deliveryAddress': 'Delivery Address',
    'checkout.pickupLocation': 'Pickup Location',
    'checkout.fullName': 'Full Name',
    'checkout.enterFullName': 'Enter your full name',
    'checkout.phoneNumber': 'Phone Number',
    'checkout.enterPhoneNumber': 'Enter your phone number',
    'checkout.emailAddress': 'Email Address',
    'checkout.optional': 'Optional',
    'checkout.enterEmailAddress': 'Enter your email address',
    'checkout.streetAddress': 'Street Address',
    'checkout.enterStreetAddress': 'Enter your street address',
    'checkout.city': 'City',
    'checkout.enterCity': 'Enter your city',
    'checkout.wilaya': 'Wilaya',
    'checkout.selectWilaya': 'Select a wilaya',
    'checkout.deliveryNotes': 'Delivery Notes',
    'checkout.deliveryInstructionsPlaceholder': 'Any special delivery instructions?',
    'checkout.placingOrder': 'Placing Order...',
    'checkout.size': 'Size',
    'checkout.color': 'Color',
    'checkout.quantity': 'Quantity',
    
    // Order Success
    'orderSuccess.title': 'Order Placed Successfully!',
    'orderSuccess.message': 'Thank you for your order. We will contact you soon to confirm the details.',
    'orderSuccess.continue': 'Continue Shopping',
    
    // Made to Order
    'madeToOrder.title': 'Special Order',
    'madeToOrder.subtitle': 'Premium items available for special order',
    'madeToOrder.productionTime': '20-18 days delivery',
    'madeToOrder.depositRequired': '50% deposit required',
    'madeToOrder.whatsappOrder': 'Order via WhatsApp',
    'madeToOrder.whyChoose': 'Why choose our special order service?',
    'madeToOrder.totalCustomization': 'Wide selection',
    'madeToOrder.totalCustomizationDesc': 'Choose from a variety of colors, sizes and styles',
    'madeToOrder.premiumQuality': 'Premium quality',
    'madeToOrder.premiumQualityDesc': 'High-quality items with excellent craftsmanship',
    'madeToOrder.uniquePiece': 'Special order',
    'madeToOrder.uniquePieceDesc': 'Items are ordered fresh for each customer, ensuring quality and availability',
    'madeToOrder.ourProducts': 'Available for special order',
    'madeToOrder.noProducts': 'No products available',
    'madeToOrder.noProductsDesc': 'Come back soon to see our latest catalog!',
    'madeToOrder.orderNow': 'Order now',
    'madeToOrder.howItWorks': 'How does it work?',
    'madeToOrder.step1': 'Choose your product',
    'madeToOrder.step1Desc': 'Select from our catalog of available items',
    'madeToOrder.step2': 'Place your order',
    'madeToOrder.step2Desc': 'Provide your details and pay the 50% deposit',
    'madeToOrder.step3': 'We process your order',
    'madeToOrder.step3Desc': 'We prepare your special order for shipping',
    'madeToOrder.step4': 'Receive your order',
    'madeToOrder.step4Desc': 'Your item is delivered to you in 20-18 days',
    'madeToOrder.readyToCreate': 'Ready to place your special order?',
    'madeToOrder.readyToCreateDesc': 'Contact us now to discuss your order',
    'madeToOrder.orderViaWhatsApp': 'Order via WhatsApp',
    'madeToOrder.viewCollection': 'View Collection',
    'madeToOrder.backToHome': 'Back to Home',
    
    // Home page translations
    'home.viewCollection': 'View Collection',
    'home.madeToOrder': 'Made to Order',
    'home.fastDelivery': 'Fast Delivery',
    'home.fastDeliveryDesc': 'Quick & reliable shipping',
    'home.quality': 'Quality',
    'home.qualityDesc': 'Premium materials',
    'home.easy': 'Easy',
    'home.easyDesc': 'Simple returns',
    'madeToOrder.customOrder': 'Special Order',
    'madeToOrder.premium': 'Premium',
    'madeToOrder.colors': 'Colors',
    'madeToOrder.sizes': 'Sizes',
    'madeToOrder.orderForm': 'Order Form',
    'madeToOrder.personalInfo': 'Personal Information',
    'madeToOrder.fullName': 'Full Name',
    'madeToOrder.phoneNumber': 'Phone Number',
    'madeToOrder.email': 'Email Address',
    'madeToOrder.address': 'Address',
    'madeToOrder.wilaya': 'Wilaya',
    'madeToOrder.selectWilaya': 'Select your wilaya',
    'madeToOrder.shippingType': 'Delivery Type',
    'madeToOrder.homeDelivery': 'Home Delivery',
    'madeToOrder.stopDesk': 'Stop Desk',
    'madeToOrder.productCustomization': 'Product Customization',
    'madeToOrder.size': 'Size',
    'madeToOrder.color': 'Color',
    'madeToOrder.quantity': 'Quantity',
    'madeToOrder.notes': 'Notes',
    'madeToOrder.orderSummary': 'Order Summary',
    'madeToOrder.product': 'Product',
    'madeToOrder.unitPrice': 'Unit Price',
    'madeToOrder.subtotal': 'Subtotal',
    'madeToOrder.shipping': 'Shipping',
    'madeToOrder.total': 'Total',
    'madeToOrder.deposit': 'Deposit (50%)',
    'madeToOrder.importantNotes': 'Important Notes',
    'madeToOrder.depositNote': '• A 50% deposit is required to confirm your order',
    'madeToOrder.productionNote': '• Production time: 20-18 days',
    'madeToOrder.whatsappNote': '• We will contact you via WhatsApp to finalize the order',
    'madeToOrder.balanceNote': '• The remaining balance will be paid upon delivery',
    'madeToOrder.cancel': 'Cancel',
    'madeToOrder.submitOrder': 'Submit Order',
    'madeToOrder.whatsappMessage': 'Hello! I am interested in placing a special order. Please contact me to complete my order.',
    
    // Admin
    'admin.title': 'Admin Panel',
    'admin.subtitle': 'Manage your OBSIDIAN WEAR products and settings',
    'admin.products': 'Products',
    'admin.shipping': 'Shipping',
    'admin.addProduct': 'Add Product',
    'admin.editProduct': 'Edit Product',
    'admin.deleteProduct': 'Delete Product',
    'admin.productName': 'Product Name',
    'admin.price': 'Price (DZD)',
    'admin.originalPrice': 'Original Price (DZD)',
    'admin.imageUrl': 'Image URL',
    'admin.description': 'Description',
    'admin.category': 'Category',
    'admin.inStock': 'In Stock',
    'admin.shippingSettings': 'Shipping Settings',
    'admin.stopDeskFee': 'Stop Desk Fee (DZD)',
    'admin.homeDeliveryFee': 'Home Delivery Fee (DZD)',
    'admin.freeShippingThreshold': 'Free Shipping Threshold (DZD)',
    'admin.saveSettings': 'Save Settings',
    'admin.settingsUpdated': 'Shipping settings updated!',
    'admin.confirmDelete': 'Are you sure you want to delete this product?',
    
    // Footer
    'footer.tagline': 'More than clothing, an attitude. Discover our exclusive collection that defines your unique style with premium pieces.',
    'footer.followUs': 'FOLLOW US',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    'footer.rights': 'All rights reserved.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.close': 'Close',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Always use English - no language switching
    if (typeof window !== 'undefined') {
      setLanguage('en');
      localStorage.setItem('obsidian-language', 'en');
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('obsidian-language', lang);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
