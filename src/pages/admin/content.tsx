import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  featured?: boolean;
}

export default function ContentManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/posts/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ Post deleted successfully!');
        fetchPosts(); // Refresh the list
      } else {
        alert('❌ Failed to delete post');
      }
    } catch (error) {
      alert('❌ Error deleting post');
    }
  };

  const toggleFeatured = async (slug: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/posts/${slug}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      });

      if (response.ok) {
        fetchPosts(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Content Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading content...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Content Management">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
            <p className="text-gray-600">Manage your blog content</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.open('/admin/generator', '_self')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>🤖</span>
              <span>AI Generate</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <span>✍️</span>
              <span>New Post</span>
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              post={post}
              onEdit={() => {
                setSelectedPost(post);
                setIsEditing(true);
              }}
              onDelete={() => deletePost(post.slug)}
              onToggleFeatured={() => toggleFeatured(post.slug, post.featured || false)}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Start creating content with AI generation or manual posting</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => window.open('/admin/generator', '_self')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                🤖 Generate with AI
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                ✍️ Write Manually
              </button>
            </div>
          </div>
        )}

        {/* Post Editor Modal */}
        {isEditing && (
          <PostEditor
            post={selectedPost}
            onSave={() => {
              setIsEditing(false);
              setSelectedPost(null);
              fetchPosts();
            }}
            onCancel={() => {
              setIsEditing(false);
              setSelectedPost(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

const PostCard: React.FC<{
  post: BlogPost;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
}> = ({ post, onEdit, onDelete, onToggleFeatured }) => (
  <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
    {post.image && (
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
    )}
    <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
        {post.featured && (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            ⭐ Featured
          </span>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{new Date(post.date).toLocaleDateString()}</span>
        <span>{post.author}</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
        {post.tags.length > 3 && (
          <span className="text-xs text-gray-500">+{post.tags.length - 3} more</span>
        )}
      </div>
      
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            📝 Edit
          </button>
          <button
            onClick={onToggleFeatured}
            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
          >
            {post.featured ? '⭐ Unfeature' : '⭐ Feature'}
          </button>
        </div>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  </div>
);

const PostEditor: React.FC<{
  post: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}> = ({ post, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: '',
    tags: post?.tags.join(', ') || '',
    image: post?.image || '',
    featured: post?.featured || false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load full content if editing existing post
  useEffect(() => {
    if (post) {
      loadPostContent(post.slug);
    }
  }, [post]);

  const loadPostContent = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${slug}/content`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, content: data.content }));
      }
    } catch (error) {
      console.error('Failed to load post content:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/posts', {
        method: post ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: post?.slug,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Post saved and deployed successfully!');
        onSave();
      } else {
        alert('❌ Failed to save post: ' + data.message);
      }
    } catch (error) {
      alert('❌ Error saving post');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {post ? 'Edit Post' : 'New Post'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Brief description of the post"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (Markdown)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={15}
                placeholder="Write your post content in Markdown..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ai, technology, innovation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                ⭐ Featured Post
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save & Deploy'}
          </button>
        </div>
      </div>
    </div>
  );
};
