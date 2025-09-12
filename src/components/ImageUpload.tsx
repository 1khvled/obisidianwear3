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

    // Validate file size (max 2MB to account for base64 encoding)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image is too large. Maximum size: 2MB');
      return;
    }

    setIsUploading(true);

    // Compress image before converting to base64
    const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.5): Promise<string> => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
        
        img.onload = () => {
          // Calculate new dimensions
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        
        img.src = URL.createObjectURL(file);
      });
    };

    compressImage(file).then((compressedBase64) => {
      console.log('📸 Image compressed, size:', compressedBase64.length);
      
      // Check if compressed image is still too large (max 1MB base64)
      if (compressedBase64.length > 1024 * 1024) {
        alert('Image is still too large after compression. Please choose a smaller image.');
        setIsUploading(false);
        return;
      }
      
      onChange(compressedBase64);
      setIsUploading(false);
    }).catch((error) => {
      console.error('❌ Error compressing image:', error);
      alert('Error processing image. Please try again.');
      setIsUploading(false);
    });
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
