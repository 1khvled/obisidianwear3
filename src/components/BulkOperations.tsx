'use client';

import { useState } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Copy, 
  Archive,
  Package,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface BulkOperationsProps {
  selectedItems: string[];
  itemType: 'products' | 'inventory' | 'orders';
  onBulkDelete: () => void;
  onBulkUpdate: (updates: any) => void;
  onBulkExport: () => void;
  onBulkImport: (file: File) => void;
  onClearSelection: () => void;
}

export default function BulkOperations({
  selectedItems,
  itemType,
  onBulkDelete,
  onBulkUpdate,
  onBulkExport,
  onBulkImport,
  onClearSelection
}: BulkOperationsProps) {
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkUpdates, setBulkUpdates] = useState<any>({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setBulkUpdates({});
    setShowBulkModal(true);
  };

  const handleConfirmBulkAction = () => {
    if (bulkAction === 'delete') {
      onBulkDelete();
    } else if (bulkAction === 'update') {
      onBulkUpdate(bulkUpdates);
    }
    setShowBulkModal(false);
    setBulkAction('');
    setBulkUpdates({});
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImport = () => {
    if (importFile) {
      onBulkImport(importFile);
      setShowImportModal(false);
      setImportFile(null);
    }
  };

  const getItemTypeLabel = () => {
    switch (itemType) {
      case 'products': return 'products';
      case 'inventory': return 'inventory items';
      case 'orders': return 'orders';
      default: return 'items';
    }
  };

  const getBulkActions = () => {
    const baseActions = [
      { id: 'export', label: 'Export Selected', icon: Download, variant: 'outline' as const },
      { id: 'import', label: 'Import Data', icon: Upload, variant: 'outline' as const },
    ];

    if (itemType === 'products') {
      return [
        ...baseActions,
        { id: 'update', label: 'Update Properties', icon: Edit, variant: 'secondary' as const },
        { id: 'duplicate', label: 'Duplicate', icon: Copy, variant: 'secondary' as const },
        { id: 'archive', label: 'Archive', icon: Archive, variant: 'secondary' as const },
        { id: 'delete', label: 'Delete', icon: Trash2, variant: 'danger' as const },
      ];
    }

    if (itemType === 'inventory') {
      return [
        ...baseActions,
        { id: 'update', label: 'Update Stock', icon: Package, variant: 'secondary' as const },
        { id: 'delete', label: 'Delete', icon: Trash2, variant: 'danger' as const },
      ];
    }

    if (itemType === 'orders') {
      return [
        ...baseActions,
        { id: 'update', label: 'Update Status', icon: Edit, variant: 'secondary' as const },
        { id: 'delete', label: 'Delete', icon: Trash2, variant: 'danger' as const },
      ];
    }

    return baseActions;
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">
                {selectedItems.length} {getItemTypeLabel()} selected
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onClearSelection}>
              Clear Selection
            </Button>
          </div>
          
          <div className="flex gap-2">
            {getBulkActions().map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                onClick={() => {
                  if (action.id === 'import') {
                    setShowImportModal(true);
                  } else if (action.id === 'export') {
                    onBulkExport();
                  } else {
                    handleBulkAction(action.id);
                  }
                }}
                className="flex items-center gap-2"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Action Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title={`Bulk ${bulkAction === 'update' ? 'Update' : 'Action'}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            This action will be applied to {selectedItems.length} selected {getItemTypeLabel()}.
          </p>

          {bulkAction === 'update' && (
            <div className="space-y-4">
              {itemType === 'products' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={bulkUpdates.category || ''}
                      onChange={(e) => setBulkUpdates({...bulkUpdates, category: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Keep current</option>
                      <option value="T-Shirts">T-Shirts</option>
                      <option value="Hoodies">Hoodies</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Featured
                    </label>
                    <select
                      value={bulkUpdates.featured || ''}
                      onChange={(e) => setBulkUpdates({...bulkUpdates, featured: e.target.value === 'true'})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Keep current</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </>
              )}

              {itemType === 'inventory' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock Adjustment
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={bulkUpdates.stockAction || ''}
                      onChange={(e) => setBulkUpdates({...bulkUpdates, stockAction: e.target.value})}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select action</option>
                      <option value="add">Add to stock</option>
                      <option value="subtract">Subtract from stock</option>
                      <option value="set">Set stock to</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={bulkUpdates.stockAmount || ''}
                      onChange={(e) => setBulkUpdates({...bulkUpdates, stockAmount: parseInt(e.target.value) || 0})}
                      className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {itemType === 'orders' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={bulkUpdates.status || ''}
                    onChange={(e) => setBulkUpdates({...bulkUpdates, status: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Keep current</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {bulkAction === 'delete' && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">
                This action cannot be undone. Are you sure you want to delete {selectedItems.length} {getItemTypeLabel()}?
              </span>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowBulkModal(false)}>
              Cancel
            </Button>
            <Button 
              variant={bulkAction === 'delete' ? 'danger' : 'primary'}
              onClick={handleConfirmBulkAction}
            >
              {bulkAction === 'delete' ? 'Delete All' : 'Apply Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Data"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Upload a CSV file to import {getItemTypeLabel()}. Make sure your file matches the expected format.
          </p>
          
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="cursor-pointer text-blue-400 hover:text-blue-300"
            >
              Choose CSV file
            </label>
            {importFile && (
              <p className="text-gray-300 mt-2">{importFile.name}</p>
            )}
          </div>

          <div className="text-sm text-gray-400">
            <p>Expected format for {itemType}:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {itemType === 'products' && (
                <>
                  <li>name, price, category, description, image</li>
                  <li>colors (comma-separated), sizes (comma-separated)</li>
                </>
              )}
              {itemType === 'inventory' && (
                <li>product_id, size, color, quantity</li>
              )}
              {itemType === 'orders' && (
                <li>customer_name, product_id, quantity, total, status</li>
              )}
            </ul>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!importFile}
            >
              Import Data
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
