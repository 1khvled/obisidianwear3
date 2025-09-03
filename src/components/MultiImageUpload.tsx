'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  placeholder?: string;
  maxImages?: number;
}

export default function MultiImageUpload({ 
  value = [], 
  onChange, 
  placeholder = "Upload multiple images", 
  maxImages = 5 
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not a valid image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size: 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (value.length + validFiles.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);

    try {
      const newUrls: string[] = [];
      
      for (const file of validFiles) {
        const reader = new FileReader();
        const promise = new Promise<string>((resolve) => {
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
        });
        reader.readAsDataURL(file);
        const url = await promise;
        newUrls.push(url);
      }

      onChange([...value, ...newUrls]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading some files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newUrls = [...value];
    const [movedImage] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, movedImage);
    onChange(newUrls);
  };

  const addUrlImage = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      if (value.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }
      onChange([...value, url.trim()]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-700"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/200x200?text=Invalid+Image';
                }}
              />
              
              {/* Image Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex space-x-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {index < value.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              {/* Image Number */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-white bg-white bg-opacity-10' 
              : 'border-gray-700 hover:border-gray-600'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              {isUploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="text-white font-medium mb-2">
                {isUploading ? 'Uploading...' : 'Upload Images'}
              </p>
              <p className="text-gray-400 text-sm">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {value.length}/{maxImages} images • Max 5MB each
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Upload size={16} />
                <span>Choose Files</span>
              </button>
              
              <button
                type="button"
                onClick={addUrlImage}
                disabled={isUploading}
                className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Plus size={16} />
                <span>Add URL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Image URLs Input (for manual entry) */}
      {value.length > 0 && (
        <div>
          <label className="block text-white font-medium mb-2">Image URLs</label>
          <div className="space-y-2">
            {value.map((url, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm w-8">{index + 1}.</span>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...value];
                    newUrls[index] = e.target.value;
                    onChange(newUrls);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-white"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
