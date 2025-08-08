import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';

export default function DeploymentPanel() {
  const { 
    pendingChanges, 
    deployAllChanges, 
    undoAllChanges,
    isDeploying, 
    isUndoing,
    clearPendingChanges 
  } = useAdmin();

  if (pendingChanges.length === 0) {
    return null;
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'homepage': return '🏠';
      case 'content': return '📝';
      case 'settings': return '⚙️';
      default: return '📄';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <span className="w-3 h-3 bg-amber-400 rounded-full mr-2 animate-pulse"></span>
          Pending Changes
        </h3>
        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
          {pendingChanges.length}
        </span>
      </div>

      <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
        {pendingChanges.map((change) => (
          <div key={change.id} className="flex items-start space-x-2 text-sm">
            <span className="text-lg">{getTypeIcon(change.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 truncate">{change.description}</p>
              <p className="text-gray-500 text-xs">{formatTimestamp(change.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={deployAllChanges}
          disabled={isDeploying || isUndoing}
          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center justify-center space-x-1"
        >
          {isDeploying ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              <span>Deploying...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>Deploy All</span>
            </>
          )}
        </button>
        
        <button
          onClick={undoAllChanges}
          disabled={isDeploying || isUndoing}
          className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm flex items-center justify-center space-x-1"
          title="Undo all pending changes"
        >
          {isUndoing ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              <span>Undoing...</span>
            </>
          ) : (
            <>
              <span>↩️</span>
              <span>Undo All</span>
            </>
          )}
        </button>
        
        <button
          onClick={clearPendingChanges}
          disabled={isDeploying || isUndoing}
          className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 text-sm"
          title="Clear pending changes (without undoing)"
        >
          🗑️
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        💡 <strong>Deploy:</strong> Apply changes to live site | <strong>Undo:</strong> Restore original values | <strong>Clear:</strong> Remove from list
      </div>
    </div>
  );
}
