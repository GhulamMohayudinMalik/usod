'use client';

import { useState, useEffect } from 'react';

export default function BackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupType, setBackupType] = useState('full');
  const [restoreScope, setRestoreScope] = useState('full');
  const [stats, setStats] = useState(null);

  // Fetch backups
  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        setError('Please log in to access backup management.');
        setLoading(false);
        return;
      }

      console.log('Fetching backups with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:5000/api/backup/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Backup API response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('token');
          return;
        }
        if (response.status === 403) {
          // User doesn't have permission to view backups
          setError('You do not have permission to view backup management. This feature is restricted to administrators.');
          setBackups([]);
          return;
        }
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch backups: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Backup data received:', data);
      setBackups(data.backups || []);
    } catch (err) {
      console.error('Error fetching backups:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to the server. Please check if the backend is running.');
      } else {
        setError(`Failed to load backups: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch backup statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return; // Skip stats if no token
      }

      const response = await fetch('http://localhost:5000/api/backup/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else if (response.status === 403) {
        // User doesn't have permission to view backup stats
        setStats(null);
      } else if (response.status === 401) {
        // Token expired, will be handled by fetchBackups
        setStats(null);
      }
    } catch (err) {
      console.error('Error fetching backup stats:', err);
      setStats(null);
    }
  };

  // Create backup
  const handleCreateBackup = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (backupType) {
        case 'security_logs':
          endpoint = 'http://localhost:5000/api/backup/security-logs';
          break;
        case 'users':
          endpoint = 'http://localhost:5000/api/backup/users';
          break;
        case 'full':
          endpoint = 'http://localhost:5000/api/backup/full';
          break;
        default:
          throw new Error('Invalid backup type');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'manual' })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`${backupType.charAt(0).toUpperCase() + backupType.slice(1)} backup created successfully!`);
        setShowCreateModal(false);
        fetchBackups();
        fetchStats();
      } else {
        setError(data.message || 'Failed to create backup');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error creating backup:', err);
    } finally {
      setLoading(false);
    }
  };

  // Restore backup
  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/backup/restore/${selectedBackup.name}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          reason: 'manual_restore',
          restoreScope 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`Backup restored successfully! ${data.restore.restoredCount} records restored.`);
        setShowRestoreModal(false);
        setSelectedBackup(null);
        fetchBackups();
        fetchStats();
      } else {
        setError(data.message || 'Failed to restore backup');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error restoring backup:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup old backups
  const handleCleanup = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/backup/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`Cleanup completed! ${data.deletedCount} old backup files deleted.`);
        fetchBackups();
        fetchStats();
      } else {
        setError(data.message || 'Failed to cleanup backups');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error cleaning up backups:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open restore modal
  const openRestoreModal = (backup) => {
    setSelectedBackup(backup);
    setShowRestoreModal(true);
  };

  useEffect(() => {
    // Only fetch data if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchBackups();
      fetchStats();
    } else {
      setError('Please log in to access backup management.');
      setLoading(false);
    }
  }, []);

  if (loading && backups.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading backup management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Backup Management</h1>
          <p className="text-gray-400 mt-2">
            {error && error.includes('permission') 
              ? 'Access restricted to administrators only' 
              : 'Create, restore, and manage system backups'
            }
          </p>
        </div>
        {!error && (
          <div className="flex space-x-3">
            <button
              onClick={handleCleanup}
              disabled={loading}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] shadow-lg shadow-orange-500/25"
            >
              {loading ? 'Cleaning...' : 'Cleanup Old'}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-cyan-700 transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-500/25"
            >
              Create Backup
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 text-green-300">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Statistics Cards - Only show if user has permission */}
      {stats && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Backups</p>
                <p className="text-2xl font-bold text-white">{stats.totalBackups}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Size</p>
                <p className="text-2xl font-bold text-white">{stats.totalSizeFormatted}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Oldest Backup</p>
                <p className="text-sm font-bold text-white">
                  {stats.oldestBackup ? new Date(stats.oldestBackup.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Newest Backup</p>
                <p className="text-sm font-bold text-white">
                  {stats.newestBackup ? new Date(stats.newestBackup.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backups Table - Only show if user has permission */}
      {!error && (
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-xl font-semibold text-white">Available Backups</h2>
          <p className="text-gray-400 text-sm">Total backups: {backups.length}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {backups.map((backup, index) => (
                <tr key={index} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    {backup.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      backup.type === 'full_system' 
                        ? 'bg-purple-900/30 text-purple-300 border border-purple-700/50' 
                        : backup.type === 'security_logs'
                        ? 'bg-red-900/30 text-red-300 border border-red-700/50'
                        : 'bg-blue-900/30 text-blue-300 border border-blue-700/50'
                    }`}>
                      {backup.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {backup.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {backup.recordCount || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(backup.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button
                      onClick={() => openRestoreModal(backup)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      title="Restore Backup"
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Create Backup Modal - Only show if user has permission */}
      {showCreateModal && !error && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Backup</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backup Type
              </label>
              <select
                value={backupType}
                onChange={(e) => setBackupType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="full">Full System Backup</option>
                <option value="security_logs">Security Logs Only</option>
                <option value="users">Users Data Only</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBackup}
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {loading ? 'Creating...' : 'Create Backup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Backup Modal - Only show if user has permission */}
      {showRestoreModal && selectedBackup && !error && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Restore Backup</h3>
            <p className="text-gray-300 mb-4">
              Restore backup: <strong>{selectedBackup.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Restore Scope
              </label>
              <select
                value={restoreScope}
                onChange={(e) => setRestoreScope(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="full">Full Restore</option>
                <option value="security_logs">Security Logs Only</option>
                <option value="users">Users Data Only</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackup(null);
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                {loading ? 'Restoring...' : 'Restore Backup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
