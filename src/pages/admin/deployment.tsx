import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface DeploymentStatus {
  lastDeploy: string | null;
  deploymentUrl: string;
  gitStatus: {
    branch: string;
    lastCommit: string;
    uncommittedChanges: boolean;
  };
  vercelStatus: {
    status: string;
    lastBuild: string | null;
  };
}

interface GitLog {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export default function Deployment() {
  const [status, setStatus] = useState<DeploymentStatus>({
    lastDeploy: null,
    deploymentUrl: 'https://smartiyo.com',
    gitStatus: {
      branch: 'main',
      lastCommit: '',
      uncommittedChanges: false,
    },
    vercelStatus: {
      status: 'unknown',
      lastBuild: null,
    },
  });

  const [gitLogs, setGitLogs] = useState<GitLog[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);

  useEffect(() => {
    loadDeploymentStatus();
    loadGitLogs();
    const interval = setInterval(loadDeploymentStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDeploymentStatus = async () => {
    try {
      const response = await fetch('/api/admin/deployment/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to load deployment status:', error);
    }
  };

  const loadGitLogs = async () => {
    try {
      const response = await fetch('/api/admin/deployment/git-logs');
      if (response.ok) {
        const data = await response.json();
        setGitLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load git logs:', error);
    }
  };

  const triggerDeployment = async () => {
    setIsDeploying(true);
    setDeployLogs(['🚀 Starting manual deployment...']);

    try {
      const response = await fetch('/api/admin/deployment/trigger', {
        method: 'POST',
      });

      const reader = response.body?.getReader();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split('\n').filter(line => line.trim());
          
          lines.forEach(line => {
            if (line.trim()) {
              setDeployLogs(prev => [...prev, line.trim()]);
            }
          });
        }
      }

      setDeployLogs(prev => [...prev, '✅ Deployment completed!']);
      loadDeploymentStatus(); // Refresh status
      loadGitLogs(); // Refresh logs

    } catch (error) {
      setDeployLogs(prev => [...prev, '❌ Deployment failed']);
    } finally {
      setIsDeploying(false);
    }
  };

  const commitAndPush = async () => {
    try {
      const message = prompt('Enter commit message:') || 'Admin portal update';
      
      const response = await fetch('/api/admin/deployment/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        alert('✅ Changes committed and pushed successfully!');
        loadDeploymentStatus();
        loadGitLogs();
      } else {
        alert('❌ Failed to commit changes');
      }
    } catch (error) {
      alert('❌ Error committing changes');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'building':
      case 'queued':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <AdminLayout title="Deployment">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🚀 Deployment & Git</h2>
              <p className="text-gray-600">Monitor and manage your blog deployment</p>
            </div>
            <div className="flex space-x-3">
              <a
                href={status.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                🌐 View Live Site
              </a>
              <button
                onClick={triggerDeployment}
                disabled={isDeploying}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isDeploying ? '🔄 Deploying...' : '🚀 Deploy Now'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deployment Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Deployment Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🌐</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Live Site</h4>
                    <p className="text-sm text-gray-600">{status.deploymentUrl}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.vercelStatus.status)}`}>
                  {status.vercelStatus.status || 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🔄</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Last Build</h4>
                    <p className="text-sm text-gray-600">
                      {status.vercelStatus.lastBuild || 'No recent builds'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📅</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Last Deploy</h4>
                    <p className="text-sm text-gray-600">
                      {status.lastDeploy || 'No recent deployments'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Git Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Git Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🌿</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Current Branch</h4>
                    <p className="text-sm text-gray-600">{status.gitStatus.branch}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📝</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Last Commit</h4>
                    <p className="text-sm text-gray-600 font-mono">
                      {status.gitStatus.lastCommit || 'No commits found'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🔄</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Working Directory</h4>
                    <p className="text-sm text-gray-600">
                      {status.gitStatus.uncommittedChanges ? 'Has uncommitted changes' : 'Clean'}
                    </p>
                  </div>
                </div>
                {status.gitStatus.uncommittedChanges && (
                  <button
                    onClick={commitAndPush}
                    className="bg-orange-600 text-white text-xs px-3 py-1 rounded hover:bg-orange-700"
                  >
                    📤 Commit & Push
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Git Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📜 Recent Commits</h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {gitLogs.map((log, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4 py-2 bg-gray-50 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{log.message}</h4>
                  <span className="text-xs text-gray-500">{log.date}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>👤 {log.author}</span>
                  <span className="font-mono text-xs">{log.hash}</span>
                </div>
              </div>
            ))}
          </div>

          {gitLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">📋</span>
              <p>No git history found</p>
            </div>
          )}
        </div>

        {/* Deployment Logs */}
        {deployLogs.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Deployment Logs</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {deployLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.open('https://github.com/Aatish-Ranjan/automated-ai-blog', '_blank')}
              className="flex items-center space-x-2 p-3 bg-white rounded-lg border hover:bg-gray-50"
            >
              <span>📦</span>
              <span className="text-sm font-medium">View Repository</span>
            </button>
            
            <button
              onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
              className="flex items-center space-x-2 p-3 bg-white rounded-lg border hover:bg-gray-50"
            >
              <span>⚡</span>
              <span className="text-sm font-medium">Vercel Dashboard</span>
            </button>
            
            <button
              onClick={loadDeploymentStatus}
              className="flex items-center space-x-2 p-3 bg-white rounded-lg border hover:bg-gray-50"
            >
              <span>🔄</span>
              <span className="text-sm font-medium">Refresh Status</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
