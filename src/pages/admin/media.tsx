import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface PixabayImage {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
  user: string;
  downloads: number;
  likes: number;
}

interface MediaFile {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  url: string;
}

export default function MediaManagement() {
  const [activeTab, setActiveTab] = useState<'local' | 'pixabay'>('local');
  const [localFiles, setLocalFiles] = useState<MediaFile[]>([]);
  const [pixabayImages, setPixabayImages] = useState<PixabayImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    loadLocalFiles();
  }, []);

  const loadLocalFiles = async () => {
    try {
      const response = await fetch('/api/admin/media/local');
      if (response.ok) {
        const data = await response.json();
        setLocalFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to load local files:', error);
    }
  };

  const searchPixabay = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/admin/media/pixabay-search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setPixabayImages(data.hits || []);
      }
    } catch (error) {
      console.error('Failed to search Pixabay:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const downloadPixabayImage = async (image: PixabayImage) => {
    try {
      const response = await fetch('/api/admin/media/download-pixabay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: image.largeImageURL,
          filename: `pixabay-${image.id}.jpg`,
          tags: image.tags,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Image downloaded successfully!');
        loadLocalFiles(); // Refresh local files
      } else {
        alert('❌ Failed to download image');
      }
    } catch (error) {
      alert('❌ Error downloading image');
    }
  };

  const deleteLocalFile = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      const response = await fetch('/api/admin/media/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });

      if (response.ok) {
        loadLocalFiles(); // Refresh local files
        alert('✅ File deleted successfully');
      } else {
        alert('❌ Failed to delete file');
      }
    } catch (error) {
      alert('❌ Error deleting file');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploadProgress(0);

    try {
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ File uploaded successfully!');
        loadLocalFiles(); // Refresh local files
      } else {
        alert('❌ Failed to upload file');
      }
    } catch (error) {
      alert('❌ Error uploading file');
    } finally {
      setUploadProgress(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AdminLayout title="Media Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📸 Media Management</h2>
          <p className="text-gray-600">Manage your blog images and media files</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('local')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'local'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📁 Local Files ({localFiles.length})
              </button>
              <button
                onClick={() => setActiveTab('pixabay')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'pixabay'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔍 Pixabay Search
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'local' && (
              <div className="space-y-6">
                {/* Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="space-y-4">
                    <div className="text-gray-600">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload new image
                        </span>
                        <span className="mt-1 block text-sm text-gray-600">
                          or drag and drop files here
                        </span>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    {uploadProgress !== null && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Local Files Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {localFiles.map((file, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="12" x="12" text-anchor="middle" font-size="10">📄</text></svg>';
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{file.name}</h4>
                        <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                        <p className="text-xs text-gray-500">{file.lastModified}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(file.url)}
                            className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700"
                          >
                            📋 Copy URL
                          </button>
                          <button
                            onClick={() => deleteLocalFile(file.name)}
                            className="bg-red-600 text-white text-xs py-2 px-3 rounded hover:bg-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {localFiles.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p>No local files found. Upload some images to get started!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pixabay' && (
              <div className="space-y-6">
                {/* Search Section */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchPixabay(searchQuery)}
                      placeholder="Search for images... (e.g. 'technology', 'business', 'nature')"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => searchPixabay(searchQuery)}
                    disabled={isSearching}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSearching ? '🔍 Searching...' : '🔍 Search'}
                  </button>
                </div>

                {/* Search Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pixabayImages.map((image) => (
                    <div key={image.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={image.webformatURL}
                          alt={image.tags}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{image.tags}</h4>
                        <p className="text-xs text-gray-600">By {image.user}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>❤️ {image.likes}</span>
                          <span>⬇️ {image.downloads}</span>
                        </div>
                        <button
                          onClick={() => downloadPixabayImage(image)}
                          className="w-full bg-green-600 text-white text-xs py-2 px-3 rounded hover:bg-green-700"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {pixabayImages.length === 0 && searchQuery && !isSearching && (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-4xl mb-4 block">🔍</span>
                    <p>No images found for "{searchQuery}". Try different keywords!</p>
                  </div>
                )}

                {pixabayImages.length === 0 && !searchQuery && (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-4xl mb-4 block">📸</span>
                    <p>Search Pixabay for high-quality stock images for your blog posts</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 How to Use</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• <strong>Local Files:</strong> Upload images directly or manage existing files</li>
            <li>• <strong>Pixabay Search:</strong> Find and download stock images with your existing API key</li>
            <li>• <strong>Copy URL:</strong> Use the copy button to get image URLs for your posts</li>
            <li>• <strong>Auto-Integration:</strong> Downloaded images work with your AI generation script</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
