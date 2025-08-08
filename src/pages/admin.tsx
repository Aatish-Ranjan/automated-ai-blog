import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface SystemStatus {
  ollama: boolean;
  pixabay: boolean;
  git: boolean;
  lastGeneration: string | null;
  totalPosts: number;
  lastCommit: string | null;
}

export default function AdminDashboard() {
  const [status, setStatus] = useState<SystemStatus>({
    ollama: false,
    pixabay: false,
    git: false,
    lastGeneration: null,
    totalPosts: 0,
    lastCommit: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/admin/system-status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDesktopAutomation = async () => {
    try {
      const response = await fetch('/api/admin/trigger-automation', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Desktop automation triggered successfully!');
        fetchSystemStatus(); // Refresh status
      } else {
        alert('❌ Failed to trigger automation: ' + data.message);
      }
    } catch (error) {
      alert('❌ Error triggering automation');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatusCard
            title="Ollama AI"
            status={status.ollama}
            icon="🤖"
            description="AI content generation"
          />
          <StatusCard
            title="Pixabay API"
            status={status.pixabay}
            icon="📸"
            description="Image integration"
          />
          <StatusCard
            title="Git Repository"
            status={status.git}
            icon="📝"
            description="Version control"
          />
          <StatusCard
            title="Total Posts"
            status={true}
            icon="📄"
            description={`${status.totalPosts} published`}
            customValue={status.totalPosts.toString()}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={triggerDesktopAutomation}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>🖱️</span>
              <span>Trigger Desktop Automation</span>
            </button>
            
            <button
              onClick={() => window.open('/admin/generator', '_self')}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>🤖</span>
              <span>Manual AI Generation</span>
            </button>
            
            <button
              onClick={() => window.open('/admin/content', '_self')}
              className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span>✍️</span>
              <span>Create Manual Post</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Recent Activity</h2>
            <div className="space-y-3">
              <ActivityItem
                icon="🤖"
                title="Last AI Generation"
                time={status.lastGeneration || 'Never'}
                description="Desktop shortcut automation"
              />
              <ActivityItem
                icon="📝"
                title="Last Git Commit"
                time={status.lastCommit || 'Never'}
                description="Repository update"
              />
              <ActivityItem
                icon="🌐"
                title="Live Website"
                time="Active"
                description="smartiyo.com"
                action={
                  <a
                    href="https://smartiyo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View →
                  </a>
                }
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 System Integration</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🖱️</span>
                  <div>
                    <h3 className="font-medium text-gray-900">Desktop Shortcut</h3>
                    <p className="text-sm text-gray-600">Original automation workflow</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">✅ Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🌐</span>
                  <div>
                    <h3 className="font-medium text-gray-900">Admin Portal</h3>
                    <p className="text-sm text-gray-600">Web-based management</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">✅ Active</span>
              </div>
              
              <div className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg">
                💡 <strong>Tip:</strong> Both methods use the same backend scripts. 
                Your desktop shortcut workflow remains unchanged!
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

const StatusCard: React.FC<{
  title: string;
  status: boolean;
  icon: string;
  description: string;
  customValue?: string;
}> = ({ title, status, icon, description, customValue }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
        status 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {customValue || (status ? '✅ Online' : '❌ Offline')}
      </div>
    </div>
  </div>
);

const ActivityItem: React.FC<{
  icon: string;
  title: string;
  time: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, time, description, action }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <span className="text-lg">{icon}</span>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <div className="text-right">
      <div className="text-sm text-gray-500">{time}</div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  </div>
);
