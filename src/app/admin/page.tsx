'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Settings, Eye, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageUpload from '@/components/ImageUpload';
import { useLanguage } from '@/context/LanguageContext';
import { useProducts } from '@/context/ProductContext';
import { sortedWilayas, Wilaya } from '@/data/wilayas';

interface Product {
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
}

interface ShippingSettings {
  stopDesk: number;
  homeDelivery: number;
  freeShippingThreshold: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('products');
  const { t } = useLanguage();
  const { products, addProduct: addProductContext, updateProduct: updateProductContext, deleteProduct: deleteProductContext } = useProducts();
  const [wilayaTariffs, setWilayaTariffs] = useState<Wilaya[]>(sortedWilayas);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    stopDesk: 800,
    homeDelivery: 1000,
    freeShippingThreshold: 5000
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    originalPrice: 0,
    image: '',
    description: '',
    category: 'T-Shirts',
    sizes: [],
    colors: [],
    inStock: true,
    rating: 0,
    reviews: 0
  });

  useEffect(() => {
    // Load shipping settings
    const savedShipping = localStorage.getItem('obsidian-shipping');
    if (savedShipping) {
      setShippingSettings(JSON.parse(savedShipping));
    }

    // Load wilaya tariffs
    const savedWilayaTariffs = localStorage.getItem('obsidian-wilaya-tariffs');
    if (savedWilayaTariffs) {
      setWilayaTariffs(JSON.parse(savedWilayaTariffs));
    }
  }, []);

  const saveShippingSettings = (settings: ShippingSettings) => {
    setShippingSettings(settings);
    localStorage.setItem('obsidian-shipping', JSON.stringify(settings));
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) return;

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name!,
      price: newProduct.price!,
      originalPrice: newProduct.originalPrice,
      image: newProduct.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop',
      description: newProduct.description || '',
      category: newProduct.category || 'T-Shirts',
      sizes: newProduct.sizes || ['S', 'M', 'L', 'XL'],
      colors: newProduct.colors || ['Black'],
      inStock: newProduct.inStock ?? true,
      rating: newProduct.rating || 0,
      reviews: newProduct.reviews || 0
    };

    addProductContext(product);
    setNewProduct({
      name: '',
      price: 0,
      originalPrice: 0,
      image: '',
      description: '',
      category: 'T-Shirts',
      sizes: [],
      colors: [],
      inStock: true,
      rating: 0,
      reviews: 0
    });
    setShowAddProduct(false);
  };

  const updateProduct = () => {
    if (!editingProduct) return;

    updateProductContext(editingProduct.id, editingProduct);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProductContext(id);
    }
  };

  const updateShippingSettings = () => {
    saveShippingSettings(shippingSettings);
    alert('Paramètres de livraison mis à jour !');
  };

  const updateWilayaTariff = (wilayaId: number, field: keyof Wilaya, value: number) => {
    const updatedTariffs = wilayaTariffs.map(wilaya => 
      wilaya.id === wilayaId ? { ...wilaya, [field]: value } : wilaya
    );
    setWilayaTariffs(updatedTariffs);
    localStorage.setItem('obsidian-wilaya-tariffs', JSON.stringify(updatedTariffs));
  };

  const resetWilayaTariffs = () => {
    setWilayaTariffs(sortedWilayas);
    localStorage.setItem('obsidian-wilaya-tariffs', JSON.stringify(sortedWilayas));
    alert('Tarifs des wilayas réinitialisés !');
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
                 <div className="mb-8">
           <h1 className="text-4xl font-bold text-white mb-2">{t('admin.title')}</h1>
           <p className="text-gray-400">{t('admin.subtitle')}</p>
         </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-white text-black'
                : 'text-white hover:bg-gray-800'
            }`}
          >
                         <Package size={20} className="inline mr-2" />
             {t('admin.products')}
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'shipping'
                ? 'bg-white text-black'
                : 'text-white hover:bg-gray-800'
            }`}
          >
                         <Settings size={20} className="inline mr-2" />
             {t('admin.shipping')}
          </button>
          <button
            onClick={() => setActiveTab('wilayas')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'wilayas'
                ? 'bg-white text-black'
                : 'text-white hover:bg-gray-800'
            }`}
          >
                         <MapPin size={20} className="inline mr-2" />
             Tarifs Wilayas
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Add Product Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Gestion des Produits</h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Ajouter un Produit
              </button>
            </div>

            {/* Products List */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-800 rounded-lg p-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{product.description}</p>
                    <p className="text-white font-bold mb-4">{product.price} DZD</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Edit size={16} className="mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Paramètres de Livraison</h2>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Frais Stop Desk (DZD)
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.stopDesk}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      stopDesk: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Frais Livraison à Domicile (DZD)
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.homeDelivery}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      homeDelivery: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Seuil Livraison Gratuite (DZD)
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      freeShippingThreshold: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>

                <button
                  onClick={updateShippingSettings}
                  className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Sauvegarder les Paramètres
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wilayas Tab */}
        {activeTab === 'wilayas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Tarifs par Wilaya</h2>
              <button
                onClick={resetWilayaTariffs}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-white font-medium py-3 px-2">Wilaya</th>
                      <th className="text-center text-white font-medium py-3 px-2">Stop Desk E-Commerce</th>
                      <th className="text-center text-white font-medium py-3 px-2">Domicile E-Commerce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wilayaTariffs.map((wilaya) => (
                      <tr key={wilaya.id} className="border-b border-gray-800">
                        <td className="py-3 px-2">
                          <div>
                            <div className="text-white font-medium">{wilaya.name}</div>
                            <div className="text-gray-400 text-xs">#{wilaya.id}</div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={wilaya.stopDeskEcommerce}
                            onChange={(e) => updateWilayaTariff(wilaya.id, 'stopDeskEcommerce', parseInt(e.target.value) || 0)}
                            className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-white"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={wilaya.domicileEcommerce}
                            onChange={(e) => updateWilayaTariff(wilaya.id, 'domicileEcommerce', parseInt(e.target.value) || 0)}
                            className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-white font-medium mb-2">Tarifs E-Commerce:</h3>
                <div className="text-gray-400 text-sm space-y-1">
                  <div><strong>Stop Desk E-Commerce:</strong> Tarif pour retrait en point relais</div>
                  <div><strong>Domicile E-Commerce:</strong> Tarif pour livraison à domicile</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-white mb-6">Ajouter un Produit</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Nom du Produit</label>
                  <input
                    type="text"
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="Ex: OBSIDIAN HOODIE BLACK"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Prix (DZD)</label>
                    <input
                      type="number"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Prix Original (DZD)</label>
                    <input
                      type="number"
                      value={newProduct.originalPrice || ''}
                      onChange={(e) => setNewProduct({...newProduct, originalPrice: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">URL de l'Image</label>
                  <input
                    type="url"
                    value={newProduct.image || ''}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Description</label>
                  <textarea
                    value={newProduct.description || ''}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white resize-none"
                    placeholder="Description du produit en français"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Catégorie</label>
                  <select
                    value={newProduct.category || 'T-Shirts'}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  >
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Pants">Pants</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={addProduct}
                  className="flex-1 bg-white text-black py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Ajouter le Produit
                </button>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-white mb-6">Modifier le Produit</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Nom du Produit</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Prix (DZD)</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Prix Original (DZD)</label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, originalPrice: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">URL de l'Image</label>
                  <input
                    type="url"
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Description</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Catégorie</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  >
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Pants">Pants</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={editingProduct.inStock}
                    onChange={(e) => setEditingProduct({...editingProduct, inStock: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="inStock" className="text-white">En Stock</label>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={updateProduct}
                  className="flex-1 bg-white text-black py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
