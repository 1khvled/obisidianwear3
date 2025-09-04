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
    
    // Hero Section
    'hero.title': 'More than clothing,',
    'hero.title2': 'an attitude.',
    'hero.subtitle': 'Discover our exclusive collection of clothing that defines your unique style.',
    'hero.cta': 'View Collection',
    
    // Products
    'products.title': 'Our Collection',
    'products.empty': 'Empty Collection - Ready for Your Products',
    'products.empty.desc': 'Add your products to start selling',
    'products.buyNow': 'Buy Now',
    'products.addToCart': 'Add to Cart',
    'products.selectSize': 'Select Size',
    'products.selectColor': 'Select Color',
    'products.quantity': 'Quantity',
    'products.inStock': 'In Stock',
    'products.outOfStock': 'Out of Stock',
    
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
    
    // Order Success
    'orderSuccess.title': 'Order Placed Successfully!',
    'orderSuccess.message': 'Thank you for your order. We will contact you soon to confirm the details.',
    'orderSuccess.continue': 'Continue Shopping',
    
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
    'common.cancel': 'Cancel',
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
    
    // Hero Section
    'hero.title': 'Plus qu\'un vêtement,',
    'hero.title2': 'une attitude.',
    'hero.subtitle': 'Découvrez notre collection exclusive de vêtements qui définissent votre style unique.',
    'hero.cta': 'Voir la Collection',
    
    // Products
    'products.title': 'Notre Collection',
    'products.empty': 'Collection vide - Prêt pour vos produits',
    'products.empty.desc': 'Ajoutez vos produits pour commencer à vendre',
    'products.buyNow': 'Acheter Maintenant',
    'products.addToCart': 'Ajouter au Panier',
    'products.selectSize': 'Sélectionner la Taille',
    'products.selectColor': 'Sélectionner la Couleur',
    'products.quantity': 'Quantité',
    'products.inStock': 'En Stock',
    'products.outOfStock': 'Rupture de Stock',
    
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
    
    // Order Success
    'orderSuccess.title': 'Commande Passée avec Succès !',
    'orderSuccess.message': 'Merci pour votre commande. Nous vous contacterons bientôt pour confirmer les détails.',
    'orderSuccess.continue': 'Continuer les Achats',
    
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
    'common.cancel': 'Annuler',
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
    // Load saved language from database with localStorage fallback
    const loadLanguage = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Try to get from database first
          const prefsService = (await import('@/lib/preferencesService')).default;
          const dbLanguage = await prefsService.getLanguage();
          
          if (dbLanguage && (dbLanguage === 'en' || dbLanguage === 'fr')) {
            setLanguage(dbLanguage);
          } else {
            // Fallback to localStorage
            const savedLanguage = localStorage.getItem('obsidian-language') as Language;
            if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
              setLanguage(savedLanguage);
              // Sync to database
              await prefsService.setLanguage(savedLanguage);
            }
          }
        } catch (error) {
          console.error('Error loading language:', error);
          // Fallback to localStorage
          const savedLanguage = localStorage.getItem('obsidian-language') as Language;
          if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
            setLanguage(savedLanguage);
          }
        }
      }
    };

    loadLanguage();
  }, []);

  const handleSetLanguage = async (lang: Language) => {
    setLanguage(lang);
    
    if (typeof window !== 'undefined') {
      // Update localStorage immediately for responsive UI
      localStorage.setItem('obsidian-language', lang);
      
      // Update database in background
      try {
        const prefsService = (await import('@/lib/preferencesService')).default;
        await prefsService.setLanguage(lang);
      } catch (error) {
        console.error('Error saving language to database:', error);
      }
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
