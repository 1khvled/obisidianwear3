'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export default function ImageUpload({ value, onChange, placeholder = "Enter image URL or upload" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop grande. Taille maximum: 5MB');
      return;
    }

    setIsUploading(true);

    // For now, we'll create a local URL for the image
    // In production, you'd upload to a service like Cloudinary, AWS S3, etc.
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
  };

  const clearImage = () => {
    onChange('');
  };

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      {value && (
        <div className="relative">
          <img
            src={value}
            alt="Product preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-700"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
            }}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload Options */}
      <div className="space-y-3">
        {/* URL Input */}
        <div>
          <label className="block text-white font-medium mb-2">Image URL</label>
          <input
            type="url"
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-white font-medium mb-2">Or Upload File</label>
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white hover:bg-gray-700 transition-colors"
            >
              <Upload size={20} />
              <span>Choose File</span>
            </button>
            {isUploading && <span className="text-gray-400">Uploading...</span>}
          </div>
        </div>


      </div>
    </div>
  );
}
