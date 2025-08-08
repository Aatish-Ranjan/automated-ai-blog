import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  featured: boolean;
  slug: string;
  date: string;
}

interface HomepageConfig {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    showNewsletter: boolean;
    ctaText: string;
    ctaLink: string;
  };
  featured: {
    enabled: boolean;
    title: string;
    subtitle: string;
    maxPosts: number;
    layout: 'grid' | 'carousel' | 'list';
    posts: string[]; // Array of post IDs in order
  };
  recent: {
    enabled: boolean;
    title: string;
    maxPosts: number;
    showExcerpts: boolean;
  };
  layout: {
    template: 'blog' | 'magazine' | 'minimal' | 'portfolio';
    sidebar: boolean;
    containerWidth: 'normal' | 'wide' | 'full';
  };
}

export default function HomepageDesigner() {
  const [config, setConfig] = useState<HomepageConfig>({
    hero: {
      title: 'AI Powered Blog',
      subtitle: 'Discover the latest insights in technology, AI, and innovation',
      backgroundImage: '',
      showNewsletter: true,
      ctaText: 'Explore Articles',
      ctaLink: '#featured',
    },
    featured: {
      enabled: true,
      title: 'Featured Articles',
      subtitle: 'Hand-picked stories worth your time',
      maxPosts: 3,
      layout: 'grid',
      posts: [],
    },
    recent: {
      enabled: true,
      title: 'Latest Posts',
      maxPosts: 6,
      showExcerpts: true,
    },
    layout: {
      template: 'blog',
      sidebar: true,
      containerWidth: 'normal',
    },
  });

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'hero' | 'featured' | 'layout' | 'preview'>('hero');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPosts();
    loadHomepageConfig();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      if (response.ok) {
        const data = await response.json();
        setAllPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const loadHomepageConfig = async () => {
    try {
      const response = await fetch('/api/admin/homepage/config');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
          updateFeaturedPosts(data.config.featured.posts);
        }
      }
    } catch (error) {
      console.error('Failed to load homepage config:', error);
    }
  };

  const updateFeaturedPosts = (postIds: string[]) => {
    const posts = postIds.map(id => allPosts.find(post => post.id === id)).filter(Boolean) as Post[];
    setFeaturedPosts(posts);
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/homepage/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (response.ok) {
        alert('✅ Homepage configuration saved successfully!');
      } else {
        alert('❌ Failed to save configuration');
      }
    } catch (error) {
      alert('❌ Error saving configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(featuredPosts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFeaturedPosts(items);
    setConfig(prev => ({
      ...prev,
      featured: {
        ...prev.featured,
        posts: items.map(post => post.id),
      },
    }));
  };

  const addToFeatured = (post: Post) => {
    if (featuredPosts.length >= config.featured.maxPosts) {
      alert(`Maximum ${config.featured.maxPosts} featured posts allowed`);
      return;
    }

    if (featuredPosts.find(p => p.id === post.id)) {
      alert('Post is already featured');
      return;
    }

    const newFeatured = [...featuredPosts, post];
    setFeaturedPosts(newFeatured);
    setConfig(prev => ({
      ...prev,
      featured: {
        ...prev.featured,
        posts: newFeatured.map(p => p.id),
      },
    }));
  };

  const removeFromFeatured = (postId: string) => {
    const newFeatured = featuredPosts.filter(post => post.id !== postId);
    setFeaturedPosts(newFeatured);
    setConfig(prev => ({
      ...prev,
      featured: {
        ...prev.featured,
        posts: newFeatured.map(p => p.id),
      },
    }));
  };

  return (
    <AdminLayout title="Homepage Designer">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🏠 Homepage Designer</h2>
              <p className="text-gray-600">Customize your homepage layout and content</p>
            </div>
            <div className="flex space-x-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                👁️ Preview Site
              </a>
              <button
                onClick={saveConfig}
                disabled={isSaving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? '💾 Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: 'hero', name: 'Hero Section', icon: '🌟' },
                { id: 'featured', name: 'Featured Posts', icon: '📌' },
                { id: 'layout', name: 'Layout Options', icon: '📐' },
                { id: 'preview', name: 'Live Preview', icon: '👁️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🌟 Hero Section Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Title
                      </label>
                      <input
                        type="text"
                        value={config.hero.title}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          hero: { ...prev.hero, title: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subtitle
                      </label>
                      <textarea
                        value={config.hero.subtitle}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          hero: { ...prev.hero, subtitle: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Call-to-Action Button Text
                      </label>
                      <input
                        type="text"
                        value={config.hero.ctaText}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          hero: { ...prev.hero, ctaText: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Image URL (optional)
                      </label>
                      <input
                        type="url"
                        value={config.hero.backgroundImage}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          hero: { ...prev.hero, backgroundImage: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showNewsletter"
                        checked={config.hero.showNewsletter}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          hero: { ...prev.hero, showNewsletter: e.target.checked }
                        }))}
                        className="mr-3"
                      />
                      <label htmlFor="showNewsletter" className="text-sm font-medium text-gray-700">
                        Show Newsletter Signup
                      </label>
                    </div>

                    {/* Hero Preview */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
                        <h1 className="text-2xl font-bold mb-2">{config.hero.title}</h1>
                        <p className="text-blue-100 mb-4">{config.hero.subtitle}</p>
                        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium">
                          {config.hero.ctaText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'featured' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">📌 Featured Posts Manager</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featuredEnabled"
                        checked={config.featured.enabled}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          featured: { ...prev.featured, enabled: e.target.checked }
                        }))}
                        className="mr-2"
                      />
                      <label htmlFor="featuredEnabled" className="text-sm font-medium text-gray-700">
                        Enable Featured Section
                      </label>
                    </div>
                  </div>
                </div>

                {config.featured.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={config.featured.title}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            featured: { ...prev.featured, title: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Featured Posts
                        </label>
                        <select
                          value={config.featured.maxPosts}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            featured: { ...prev.featured, maxPosts: parseInt(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={1}>1 Post</option>
                          <option value={2}>2 Posts</option>
                          <option value={3}>3 Posts</option>
                          <option value={4}>4 Posts</option>
                          <option value={6}>6 Posts</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Layout Style
                        </label>
                        <select
                          value={config.featured.layout}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            featured: { ...prev.featured, layout: e.target.value as any }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="grid">Grid Layout</option>
                          <option value="carousel">Carousel</option>
                          <option value="list">List View</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Current Featured Posts */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Current Featured Posts ({featuredPosts.length}/{config.featured.maxPosts})
                        </h4>
                        
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="featured-posts">
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-3 min-h-[200px] p-3 border-2 border-dashed border-gray-300 rounded-lg"
                              >
                                {featuredPosts.map((post, index) => (
                                  <Draggable key={post.id} draggableId={post.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`p-3 bg-white border rounded-lg shadow-sm ${
                                          snapshot.isDragging ? 'shadow-lg' : ''
                                        }`}
                                      >
                                        <div className="flex items-center space-x-3">
                                          <div className="text-gray-400 cursor-move">⋮⋮</div>
                                          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                                            {post.image && (
                                              <img src={post.image} alt="" className="w-full h-full object-cover" />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-medium text-gray-900 truncate">{post.title}</h5>
                                            <p className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
                                          </div>
                                          <button
                                            onClick={() => removeFromFeatured(post.id)}
                                            className="text-red-600 hover:text-red-700 p-1"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                
                                {featuredPosts.length === 0 && (
                                  <div className="text-center text-gray-500 py-8">
                                    <p>No featured posts selected</p>
                                    <p className="text-sm">Drag posts from the right to feature them</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </div>

                      {/* Available Posts */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Available Posts</h4>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {allPosts
                            .filter(post => !featuredPosts.find(fp => fp.id === post.id))
                            .map((post) => (
                              <div key={post.id} className="p-3 bg-gray-50 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                                    {post.image && (
                                      <img src={post.image} alt="" className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 truncate">{post.title}</h5>
                                    <p className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
                                  </div>
                                  <button
                                    onClick={() => addToFeatured(post)}
                                    disabled={featuredPosts.length >= config.featured.maxPosts}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    + Feature
                                  </button>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📐 Layout Options</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Style
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'blog', label: 'Blog Style', desc: 'Traditional blog layout' },
                        { value: 'magazine', label: 'Magazine Style', desc: 'Grid-based magazine layout' },
                        { value: 'minimal', label: 'Minimal Style', desc: 'Clean, simple design' },
                        { value: 'portfolio', label: 'Portfolio Style', desc: 'Image-focused layout' },
                      ].map((template) => (
                        <label key={template.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="template"
                            value={template.value}
                            checked={config.layout.template === template.value}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              layout: { ...prev.layout, template: e.target.value as any }
                            }))}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{template.label}</div>
                            <div className="text-sm text-gray-500">{template.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Container Width
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'normal', label: 'Normal', desc: 'Standard width (1200px)' },
                        { value: 'wide', label: 'Wide', desc: 'Wide layout (1400px)' },
                        { value: 'full', label: 'Full Width', desc: 'Full browser width' },
                      ].map((width) => (
                        <label key={width.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="width"
                            value={width.value}
                            checked={config.layout.containerWidth === width.value}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              layout: { ...prev.layout, containerWidth: e.target.value as any }
                            }))}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{width.label}</div>
                            <div className="text-sm text-gray-500">{width.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Additional Options
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sidebar"
                          checked={config.layout.sidebar}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            layout: { ...prev.layout, sidebar: e.target.checked }
                          }))}
                          className="mr-3"
                        />
                        <label htmlFor="sidebar" className="text-sm font-medium text-gray-700">
                          Show Sidebar
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="recentEnabled"
                          checked={config.recent.enabled}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            recent: { ...prev.recent, enabled: e.target.checked }
                          }))}
                          className="mr-3"
                        />
                        <label htmlFor="recentEnabled" className="text-sm font-medium text-gray-700">
                          Show Recent Posts Section
                        </label>
                      </div>

                      {config.recent.enabled && (
                        <div className="pl-6 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Recent Posts Title
                            </label>
                            <input
                              type="text"
                              value={config.recent.title}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                recent: { ...prev.recent, title: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Max Recent Posts
                            </label>
                            <select
                              value={config.recent.maxPosts}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                recent: { ...prev.recent, maxPosts: parseInt(e.target.value) }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value={3}>3 Posts</option>
                              <option value={6}>6 Posts</option>
                              <option value={9}>9 Posts</option>
                              <option value={12}>12 Posts</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👁️ Live Preview</h3>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Hero Preview */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
                      <h1 className="text-3xl font-bold mb-4">{config.hero.title}</h1>
                      <p className="text-xl text-blue-100 mb-6">{config.hero.subtitle}</p>
                      <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium">
                        {config.hero.ctaText}
                      </button>
                      {config.hero.showNewsletter && (
                        <div className="mt-6 pt-6 border-t border-blue-400">
                          <p className="text-blue-100 mb-3">Subscribe to our newsletter</p>
                          <div className="flex justify-center">
                            <input 
                              type="email" 
                              placeholder="Enter your email" 
                              className="px-4 py-2 rounded-l-lg text-gray-900"
                            />
                            <button className="bg-blue-800 text-white px-4 py-2 rounded-r-lg">
                              Subscribe
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Featured Section Preview */}
                    {config.featured.enabled && (
                      <div className="p-8">
                        <div className="text-center mb-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.featured.title}</h2>
                          <p className="text-gray-600">{config.featured.subtitle}</p>
                        </div>
                        
                        <div className={`grid gap-6 ${
                          config.featured.layout === 'grid' && config.featured.maxPosts === 3 ? 'grid-cols-1 md:grid-cols-3' :
                          config.featured.layout === 'grid' && config.featured.maxPosts === 2 ? 'grid-cols-1 md:grid-cols-2' :
                          config.featured.layout === 'list' ? 'grid-cols-1' :
                          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        }`}>
                          {featuredPosts.slice(0, config.featured.maxPosts).map((post, index) => (
                            <div key={post.id} className="bg-gray-50 rounded-lg overflow-hidden">
                              <div className="aspect-video bg-gray-200">
                                {post.image && (
                                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                                <p className="text-sm text-gray-600">{post.excerpt}</p>
                              </div>
                            </div>
                          ))}
                          
                          {featuredPosts.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                              <p>No featured posts selected</p>
                              <p className="text-sm">Configure featured posts in the Featured Posts tab</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recent Posts Preview */}
                    {config.recent.enabled && (
                      <div className="p-8 bg-gray-50">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{config.recent.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {allPosts.slice(0, config.recent.maxPosts).map((post, index) => (
                            <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow">
                              <div className="aspect-video bg-gray-200">
                                {post.image && (
                                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                                {config.recent.showExcerpts && (
                                  <p className="text-sm text-gray-600">{post.excerpt}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">This is a preview of your homepage layout</p>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    <span>🌐</span>
                    <span>View Live Homepage</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">💡</span>
            <p className="text-blue-800">
              <strong>Remember to save your changes!</strong> Your homepage will be updated automatically when you save.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
