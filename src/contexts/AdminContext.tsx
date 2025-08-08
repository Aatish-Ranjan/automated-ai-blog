import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PendingChange {
  id: string;
  type: 'homepage' | 'content' | 'settings';
  description: string;
  data: any;
  originalData?: any; // Store original values for undo
  timestamp: number;
}

interface AdminContextType {
  pendingChanges: PendingChange[];
  addPendingChange: (change: Omit<PendingChange, 'id' | 'timestamp'>) => void;
  removePendingChange: (id: string) => void;
  clearPendingChanges: () => void;
  undoAllChanges: () => Promise<boolean>;
  deployAllChanges: () => Promise<boolean>;
  isDeploying: boolean;
  isUndoing: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);

  const addPendingChange = (change: Omit<PendingChange, 'id' | 'timestamp'>) => {
    const newChange: PendingChange = {
      ...change,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    setPendingChanges(prev => {
      // Remove existing change of same type to avoid duplicates
      const filtered = prev.filter(c => c.type !== change.type);
      return [...filtered, newChange];
    });
  };

  const removePendingChange = (id: string) => {
    setPendingChanges(prev => prev.filter(c => c.id !== id));
  };

  const clearPendingChanges = () => {
    setPendingChanges([]);
  };

  const undoAllChanges = async (): Promise<boolean> => {
    if (pendingChanges.length === 0) {
      alert('No pending changes to undo');
      return false;
    }

    setIsUndoing(true);
    try {
      // Restore original values for each change
      for (const change of pendingChanges) {
        if (change.originalData) {
          await restoreOriginalData(change);
        }
      }

      clearPendingChanges();
      alert('✅ All changes have been undone successfully!');
      return true;
    } catch (error) {
      console.error('Undo error:', error);
      alert('❌ Failed to undo changes. Please try again.');
      return false;
    } finally {
      setIsUndoing(false);
    }
  };

  const restoreOriginalData = async (change: PendingChange) => {
    switch (change.type) {
      case 'homepage':
        await fetch('/api/admin/homepage/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change.originalData),
        });
        break;
      
      case 'settings':
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change.originalData),
        });
        break;
      
      case 'content':
        // Handle content restoration if needed
        break;
    }
  };

  const deployAllChanges = async (): Promise<boolean> => {
    if (pendingChanges.length === 0) {
      alert('No pending changes to deploy');
      return false;
    }

    setIsDeploying(true);
    try {
      // Deploy each change
      for (const change of pendingChanges) {
        await deployChange(change);
      }

      // Trigger git commit and push
      const deployResponse = await fetch('/api/admin/deploy/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: pendingChanges }),
      });

      if (!deployResponse.ok) {
        throw new Error('Deployment failed');
      }

      clearPendingChanges();
      alert('🚀 All changes deployed successfully!');
      return true;
    } catch (error) {
      console.error('Deployment error:', error);
      alert('❌ Deployment failed. Please try again.');
      return false;
    } finally {
      setIsDeploying(false);
    }
  };

  const deployChange = async (change: PendingChange) => {
    switch (change.type) {
      case 'homepage':
        await fetch('/api/admin/homepage/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change.data),
        });
        break;
      
      case 'settings':
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change.data),
        });
        break;
      
      case 'content':
        // Handle content changes if needed
        break;
    }
  };

  return (
    <AdminContext.Provider value={{
      pendingChanges,
      addPendingChange,
      removePendingChange,
      clearPendingChanges,
      undoAllChanges,
      deployAllChanges,
      isDeploying,
      isUndoing,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
