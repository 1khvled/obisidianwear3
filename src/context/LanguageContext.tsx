'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
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
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.collection': 'Collection',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    'nav.madeToOrder': 'Article sur commande',
    
    // Hero Section
    'hero.title': 'Plus qu\'un vêtement,',
    'hero.title2': 'une attitude.',
    'hero.subtitle': 'Découvrez notre collection exclusive de vêtements qui définissent votre style unique.',
    'hero.cta': 'Voir la Collection',
    
    // Products
    'products.title': 'Notre Collection',
    'products.empty': 'Collection vide - Prêt pour vos produits',
    'products.empty.desc': 'Ajoutez vos produits pour commencer à vendre',
    'products.addToCart': 'Ajouter au Panier',
    'products.selectSize': 'Sélectionner la Taille',
    'products.selectColor': 'Sélectionner la Couleur',
    'products.quantity': 'Quantité',
    'products.inStock': 'En Stock',
    'products.outOfStock': 'Rupture de Stock',
    'products.selectOptions': 'Sélectionner les Options',
    'products.available': 'disponible',
    'products.viewProduct': 'Voir le Produit',
    'common.cancel': 'Annuler',
    
    // Checkout
    'checkout.title': 'Commande',
    'checkout.shipping': 'Options de Livraison',
    'checkout.payment': 'Mode de Paiement',
    'checkout.cod': 'Paiement à la Livraison (COD)',
    'checkout.cod.desc': 'Payez quand votre commande arrive',
    'checkout.stopDesk': 'Stop Desk',
    'checkout.stopDesk.desc': 'Récupérez votre commande au point relais',
    'checkout.homeDelivery': 'À Domicile',
    'checkout.homeDelivery.desc': 'Livraison directement chez vous',
    'checkout.freeShipping': 'Livraison gratuite ! Votre commande dépasse',
    'checkout.subtotal': 'Sous-total',
    'checkout.shippingCost': 'Livraison',
    'checkout.total': 'Total',
    'checkout.placeOrder': 'Passer la Commande',
    'checkout.form.name': 'Nom Complet',
    'checkout.form.phone': 'Numéro de Téléphone',
    'checkout.form.address': 'Adresse',
    'checkout.form.city': 'Ville',
    'checkout.form.zipCode': 'Code Postal',
    'checkout.form.notes': 'Notes de Commande (Optionnel)',
    'checkout.backToProduct': 'Retour au Produit',
    'checkout.orderSummary': 'Résumé de la Commande',
    'checkout.deliveryInformation': 'Informations de Livraison',
    'checkout.deliveryOptions': 'Options de Livraison',
    'checkout.selectDeliveryOption': 'Veuillez sélectionner une option de livraison',
    'checkout.selected': 'SÉLECTIONNÉ',
    'checkout.stopDeskDescription': 'Récupérez votre commande au point relais',
    'checkout.homeDeliveryDescription': 'Livraison directement chez vous',
    'checkout.personalInformation': 'Informations Personnelles',
    'checkout.deliveryAddress': 'Adresse de Livraison',
    'checkout.pickupLocation': 'Point de Récupération',
    'checkout.fullName': 'Nom Complet',
    'checkout.enterFullName': 'Entrez votre nom complet',
    'checkout.phoneNumber': 'Numéro de Téléphone',
    'checkout.enterPhoneNumber': 'Entrez votre numéro de téléphone',
    'checkout.emailAddress': 'Adresse Email',
    'checkout.optional': 'Optionnel',
    'checkout.enterEmailAddress': 'Entrez votre adresse email',
    'checkout.streetAddress': 'Adresse de Rue',
    'checkout.enterStreetAddress': 'Entrez votre adresse de rue',
    'checkout.city': 'Ville',
    'checkout.enterCity': 'Entrez votre ville',
    'checkout.wilaya': 'Wilaya',
    'checkout.selectWilaya': 'Sélectionner une wilaya',
    'checkout.deliveryNotes': 'Notes de Livraison',
    'checkout.deliveryInstructionsPlaceholder': 'Instructions spéciales de livraison ?',
    'checkout.placingOrder': 'Passage de la Commande...',
    'checkout.size': 'Taille',
    'checkout.color': 'Couleur',
    'checkout.quantity': 'Quantité',
    
    // Order Success
    'orderSuccess.title': 'Commande Passée avec Succès !',
    'orderSuccess.message': 'Merci pour votre commande. Nous vous contacterons bientôt pour confirmer les détails.',
    'orderSuccess.continue': 'Continuer les Achats',
    
    // Made to Order
    'madeToOrder.title': 'Commande Spéciale',
    'madeToOrder.subtitle': 'Articles premium disponibles en commande spéciale',
    'madeToOrder.productionTime': '20-18 jours de livraison',
    'madeToOrder.depositRequired': '50% d\'acompte requis',
    'madeToOrder.whatsappOrder': 'Commande via WhatsApp',
    'madeToOrder.whyChoose': 'Pourquoi choisir notre service de commande spéciale ?',
    'madeToOrder.totalCustomization': 'Large sélection',
    'madeToOrder.totalCustomizationDesc': 'Choisissez parmi une variété de couleurs, tailles et styles',
    'madeToOrder.premiumQuality': 'Qualité premium',
    'madeToOrder.premiumQualityDesc': 'Articles de haute qualité avec un excellent savoir-faire',
    'madeToOrder.uniquePiece': 'Commande spéciale',
    'madeToOrder.uniquePieceDesc': 'Les articles sont commandés frais pour chaque client, garantissant qualité et disponibilité',
    'madeToOrder.ourProducts': 'Disponibles en commande spéciale',
    'madeToOrder.noProducts': 'Aucun produit disponible',
    'madeToOrder.noProductsDesc': 'Revenez bientôt pour voir notre dernier catalogue !',
    'madeToOrder.orderNow': 'Commander maintenant',
    'madeToOrder.howItWorks': 'Comment ça marche ?',
    'madeToOrder.step1': 'Choisissez votre produit',
    'madeToOrder.step1Desc': 'Sélectionnez dans notre catalogue d\'articles disponibles',
    'madeToOrder.step2': 'Passez votre commande',
    'madeToOrder.step2Desc': 'Fournissez vos détails et payez l\'acompte de 50%',
    'madeToOrder.step3': 'Nous traitons votre commande',
    'madeToOrder.step3Desc': 'Nous préparons votre commande spéciale pour l\'expédition',
    'madeToOrder.step4': 'Recevez votre commande',
    'madeToOrder.step4Desc': 'Votre article vous est livré en 20-18 jours',
    'madeToOrder.readyToCreate': 'Prêt à passer votre commande spéciale ?',
    'madeToOrder.readyToCreateDesc': 'Contactez-nous dès maintenant pour discuter de votre commande',
    'madeToOrder.orderViaWhatsApp': 'Commander via WhatsApp',
    'madeToOrder.viewCollection': 'Voir la collection',
    'madeToOrder.backToHome': 'Retour à l\'accueil',
    
    // Home page translations
    'home.viewCollection': 'Voir la Collection',
    'home.madeToOrder': 'Article sur commande',
    'home.fastDelivery': 'Fast Delivery',
    'home.fastDeliveryDesc': 'Quick & reliable shipping',
    'home.quality': 'Quality',
    'home.qualityDesc': 'Premium materials',
    'home.easy': 'Easy',
    'home.easyDesc': 'Simple returns',
    'madeToOrder.customOrder': 'Commande Spéciale',
    'madeToOrder.premium': 'Premium',
    'madeToOrder.colors': 'Couleurs',
    'madeToOrder.sizes': 'Tailles',
    'madeToOrder.orderForm': 'Formulaire de commande',
    'madeToOrder.personalInfo': 'Informations personnelles',
    'madeToOrder.fullName': 'Nom complet',
    'madeToOrder.phoneNumber': 'Numéro de téléphone',
    'madeToOrder.email': 'Adresse e-mail',
    'madeToOrder.address': 'Adresse',
    'madeToOrder.wilaya': 'Wilaya',
    'madeToOrder.selectWilaya': 'Sélectionnez votre wilaya',
    'madeToOrder.shippingType': 'Type de livraison',
    'madeToOrder.homeDelivery': 'Domicile',
    'madeToOrder.stopDesk': 'Stop Desk',
    'madeToOrder.productCustomization': 'Personnalisation du produit',
    'madeToOrder.size': 'Taille',
    'madeToOrder.color': 'Couleur',
    'madeToOrder.quantity': 'Quantité',
    'madeToOrder.notes': 'Notes',
    'madeToOrder.orderSummary': 'Résumé de la commande',
    'madeToOrder.product': 'Produit',
    'madeToOrder.unitPrice': 'Prix unitaire',
    'madeToOrder.subtotal': 'Sous-total',
    'madeToOrder.shipping': 'Livraison',
    'madeToOrder.total': 'Total',
    'madeToOrder.deposit': 'Acompte (50%)',
    'madeToOrder.importantNotes': 'Notes importantes',
    'madeToOrder.depositNote': '• Un acompte de 50% est requis pour confirmer votre commande',
    'madeToOrder.productionNote': '• Temps de production : 20-18 jours',
    'madeToOrder.whatsappNote': '• Nous vous contacterons via WhatsApp pour finaliser la commande',
    'madeToOrder.balanceNote': '• Le solde restant sera payé à la livraison',
    'madeToOrder.cancel': 'Annuler',
    'madeToOrder.submitOrder': 'Soumettre la commande',
    'madeToOrder.whatsappMessage': 'Bonjour! Je suis intéressé par une commande spéciale. Veuillez me contacter pour finaliser ma commande.',
    
    // Admin
    'admin.title': 'Panneau d\'Administration',
    'admin.subtitle': 'Gérez vos produits et paramètres OBSIDIAN WEAR',
    'admin.products': 'Produits',
    'admin.shipping': 'Livraison',
    'admin.addProduct': 'Ajouter un Produit',
    'admin.editProduct': 'Modifier le Produit',
    'admin.deleteProduct': 'Supprimer le Produit',
    'admin.productName': 'Nom du Produit',
    'admin.price': 'Prix (DZD)',
    'admin.originalPrice': 'Prix Original (DZD)',
    'admin.imageUrl': 'URL de l\'Image',
    'admin.description': 'Description',
    'admin.category': 'Catégorie',
    'admin.inStock': 'En Stock',
    'admin.shippingSettings': 'Paramètres de Livraison',
    'admin.stopDeskFee': 'Frais Stop Desk (DZD)',
    'admin.homeDeliveryFee': 'Frais Livraison à Domicile (DZD)',
    'admin.freeShippingThreshold': 'Seuil Livraison Gratuite (DZD)',
    'admin.saveSettings': 'Sauvegarder les Paramètres',
    'admin.settingsUpdated': 'Paramètres de livraison mis à jour !',
    'admin.confirmDelete': 'Êtes-vous sûr de vouloir supprimer ce produit ?',
    
    // Footer
    'footer.tagline': 'Plus qu\'un vêtement, une attitude. Découvrez notre collection exclusive qui définit votre style unique avec des pièces premium.',
    'footer.followUs': 'SUIVEZ-NOUS',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.terms': 'Conditions d\'Utilisation',
    'footer.rights': 'Tous droits réservés.',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.save': 'Sauvegarder',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.add': 'Ajouter',
    'common.close': 'Fermer',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    // Load saved language from localStorage, default to French
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('obsidian-language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
        setLanguage(savedLanguage);
      } else {
        // Default to French if no saved language
        setLanguage('fr');
        localStorage.setItem('obsidian-language', 'fr');
      }
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
