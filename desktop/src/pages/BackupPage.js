import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const BackupPage = () => {
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
      const result = await apiService.getBackups();
      if (result.success) {
        setBackups(result.data);
        setError('');
      } else {
        setError(result.message || 'Failed to fetch backups');
        setBackups([]);
      }
    } catch (err) {
      setError('Failed to load backups');
      console.error('Error fetching backups:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch backup statistics
  const fetchStats = async () => {
    try {
      const result = await apiService.getBackupStats();
      if (result.success) {
        setStats(result.data);
      } else {
        setStats(null);
      }
    } catch (err) {
      console.error('Error fetching backup stats:', err);
      setStats(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchBackups(),
        fetchStats()
      ]);
    };

    loadData();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  // Create backup
  const handleCreateBackup = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await apiService.createBackup(backupType, 'manual');
      if (result.success) {
        setSuccessMessage(`${backupType.charAt(0).toUpperCase() + backupType.slice(1)} backup created successfully!`);
        setShowCreateModal(false);
        fetchBackups();
        fetchStats();
      } else {
        setError(result.message || 'Failed to create backup');
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
      const result = await apiService.restoreBackup(selectedBackup.name, restoreScope, 'manual_restore');
      if (result.success) {
        setSuccessMessage(`Backup restored successfully! ${result.data.restoredCount} records restored.`);
        setShowRestoreModal(false);
        setSelectedBackup(null);
        fetchBackups();
        fetchStats();
      } else {
        setError(result.message || 'Failed to restore backup');
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
      const result = await apiService.cleanupBackups();
      if (result.success) {
        setSuccessMessage(`Cleanup completed! ${result.data.deletedCount} old backup files deleted.`);
        fetchBackups();
        fetchStats();
      } else {
        setError(result.message || 'Failed to cleanup backups');
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

  if (loading && backups.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #000000 100%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading backup management...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '0.5rem' 
          }}>
            Backup Management
          </h1>
          <p style={{ 
            color: '#9ca3af', 
            marginTop: '0.5rem',
            fontSize: '1rem'
          }}>
            {error && error.includes('permission') 
              ? 'Access restricted to administrators only' 
              : 'Create, restore, and manage system backups'
            }
          </p>
        </div>
        {!error && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                fetchBackups();
                fetchStats();
              }}
              style={{
                padding: '0.5rem 1rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Refresh
            </button>
            <button
              onClick={handleCleanup}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.5 : 1,
                transform: 'scale(1)',
                boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.25)'
              }}
            >
              {loading ? 'Cleaning...' : 'Cleanup Old'}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: 'scale(1)',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25)'
              }}
            >
              Create Backup
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#10b981',
          marginBottom: '1rem'
        }}>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#ef4444',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Statistics Cards - Only show if user has permission */}
      {stats && !error && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(31, 41, 55, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '0.75rem', 
                background: 'rgba(59, 130, 246, 0.2)', 
                borderRadius: '0.5rem' 
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Total Backups</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', margin: 0 }}>{stats.totalBackups}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(31, 41, 55, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '0.75rem', 
                background: 'rgba(16, 185, 129, 0.2)', 
                borderRadius: '0.5rem' 
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Total Size</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', margin: 0 }}>{stats.totalSizeFormatted}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(31, 41, 55, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '0.75rem', 
                background: 'rgba(139, 92, 246, 0.2)', 
                borderRadius: '0.5rem' 
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: '#8b5cf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Oldest Backup</p>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white', margin: 0 }}>
                  {stats.oldestBackup ? new Date(stats.oldestBackup.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(31, 41, 55, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '0.75rem', 
                background: 'rgba(6, 182, 212, 0.2)', 
                borderRadius: '0.5rem' 
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: '#06b6d4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Newest Backup</p>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white', margin: 0 }}>
                  {stats.newestBackup ? new Date(stats.newestBackup.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backups Table - Only show if user has permission */}
      {!error && (
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1rem',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '1.5rem', 
            borderBottom: '1px solid rgba(75, 85, 99, 0.3)' 
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'white',
              marginBottom: '0.25rem'
            }}>
              Available Backups
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Total backups: {backups.length}
            </p>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(55, 65, 81, 0.3)' }}>
                <tr>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Name
                  </th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Type
                  </th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Size
                  </th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Records
                  </th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Created
                  </th>
                  <th style={{ 
                    padding: '0.75rem 0.5rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#d1d5db', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid rgba(55, 65, 81, 0.3)' }}>
                {backups.map((backup, index) => (
                  <tr key={index} style={{ 
                    borderBottom: '1px solid rgba(55, 65, 81, 0.3)',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      fontSize: '0.875rem', 
                      color: 'white', 
                      fontWeight: '500' 
                    }}>
                      {backup.name}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '9999px',
                        ...(backup.type === 'full_system' 
                          ? { 
                              background: 'rgba(139, 92, 246, 0.2)', 
                              color: '#a78bfa', 
                              border: '1px solid rgba(139, 92, 246, 0.3)' 
                            }
                          : backup.type === 'security_logs'
                          ? { 
                              background: 'rgba(239, 68, 68, 0.2)', 
                              color: '#fca5a5', 
                              border: '1px solid rgba(239, 68, 68, 0.3)' 
                            }
                          : { 
                              background: 'rgba(59, 130, 246, 0.2)', 
                              color: '#60a5fa', 
                              border: '1px solid rgba(59, 130, 246, 0.3)' 
                            }
                        )
                      }}>
                        {backup.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      fontSize: '0.875rem', 
                      color: '#d1d5db' 
                    }}>
                      {backup.size}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      fontSize: '0.875rem', 
                      color: '#d1d5db' 
                    }}>
                      {backup.recordCount || 'N/A'}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      fontSize: '0.875rem', 
                      color: '#d1d5db' 
                    }}>
                      {new Date(backup.createdAt).toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 0.5rem', 
                      fontSize: '0.875rem', 
                      color: '#d1d5db' 
                    }}>
                      <button
                        onClick={() => openRestoreModal(backup)}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'rgba(31, 41, 55, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            maxWidth: '28rem',
            width: '100%',
            margin: '1rem'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '1rem' 
            }}>
              Create New Backup
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#d1d5db',
                marginBottom: '0.5rem'
              }}>
                Backup Type
              </label>
              <select
                value={backupType}
                onChange={(e) => setBackupType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="full">Full System Backup</option>
                <option value="security_logs">Security Logs Only</option>
                <option value="users">Users Data Only</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#4b5563',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBackup}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Creating...' : 'Create Backup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Backup Modal - Only show if user has permission */}
      {showRestoreModal && selectedBackup && !error && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'rgba(31, 41, 55, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            maxWidth: '28rem',
            width: '100%',
            margin: '1rem'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '1rem' 
            }}>
              Restore Backup
            </h3>
            <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>
              Restore backup: <strong>{selectedBackup.name}</strong>
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#d1d5db',
                marginBottom: '0.5rem'
              }}>
                Restore Scope
              </label>
              <select
                value={restoreScope}
                onChange={(e) => setRestoreScope(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="full">Full Restore</option>
                <option value="security_logs">Security Logs Only</option>
                <option value="users">Users Data Only</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackup(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#4b5563',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Restoring...' : 'Restore Backup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupPage;