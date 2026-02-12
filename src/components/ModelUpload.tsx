import React, { useRef, useState } from 'react';
import { Upload, X, FileBox, Check, Loader2 } from 'lucide-react';

interface ModelUploadProps {
  onModelLoad: (file: File) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_FORMATS = {
  '.glb': 'GLB (Recommended)',
  '.gltf': 'GLTF',
  '.obj': 'OBJ',
  '.fbx': 'FBX',
  '.stl': 'STL',
};

const ACCEPTED_MIME_TYPES = 'model/gltf-binary,model/gltf+json,application/octet-stream,.glb,.gltf,.obj,.fbx,.stl';

const ModelUpload: React.FC<ModelUploadProps> = ({ onModelLoad, isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setUploadedFile(null);
      setError(null);
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!Object.keys(SUPPORTED_FORMATS).includes(extension)) {
      setError(`Unsupported format. Please use: ${Object.keys(SUPPORTED_FORMATS).join(', ')}`);
      return false;
    }
    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50MB.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (validateFile(file)) {
      setIsLoading(true);
      setError(null);
      try {
        await onModelLoad(file);
        setUploadedFile(file.name);
      } catch (err) {
        setError('Failed to load model. Please try another file.');
        console.error('Model load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileBox size={24} />
            Upload 3D Model
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragging 
              ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700 hover:bg-opacity-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME_TYPES}
            onChange={handleInputChange}
            className="hidden"
          />
          
          {isLoading ? (
            <div className="text-blue-400">
              <Loader2 size={48} className="mx-auto mb-2 animate-spin" />
              <p className="font-medium">Loading model...</p>
              <p className="text-sm text-gray-400 mt-1">Please wait</p>
            </div>
          ) : uploadedFile ? (
            <div className="text-green-400">
              <Check size={48} className="mx-auto mb-2" />
              <p className="font-medium">{uploadedFile}</p>
              <p className="text-sm text-gray-400 mt-1">Model loaded! Click to upload another</p>
            </div>
          ) : (
            <>
              <Upload size={48} className="mx-auto mb-2 text-gray-400" />
              <p className="text-white font-medium">
                Drop your 3D model here
              </p>
              <p className="text-gray-400 text-sm mt-1">
                or click to browse
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Supported Formats:</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SUPPORTED_FORMATS).map(([ext, name]) => (
              <div key={ext} className="flex items-center gap-2 text-sm">
                <span className="text-blue-400 font-mono">{ext}</span>
                <span className="text-gray-500">-</span>
                <span className="text-gray-400">{name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 <strong>GLB</strong> is recommended - it's a single file that includes textures and materials.
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelUpload;
