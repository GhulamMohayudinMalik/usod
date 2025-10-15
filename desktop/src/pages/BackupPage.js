import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mock data for demo
        const mockBackups = [
          {
            id: 'backup_001',
            name: 'Full System Backup',
            type: 'full',
            size: '2.4 GB',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            description: 'Complete system backup including all data and configurations'
          },
          {
            id: 'backup_002',
            name: 'Database Backup',
            type: 'database',
            size: '856 MB',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            description: 'Database backup with user data and logs'
          },
          {
            id: 'backup_003',
            name: 'Configuration Backup',
            type: 'config',
            size: '45 MB',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            description: 'System configuration and settings backup'
          },
          {
            id: 'backup_004',
            name: 'Security Logs Backup',
            type: 'logs',
            size: '128 MB',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            description: 'Security logs and audit trail backup'
          }
        ];

        const mockStats = {
          totalBackups: 4,
          totalSize: '3.4 GB',
          lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          successRate: 100
        };

        setBackups(mockBackups);
        setStats(mockStats);
      } catch (err) {
        setError('Failed to load backup data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBackup = {
        id: `backup_${Date.now()}`,
        name: `${backupType.charAt(0).toUpperCase() + backupType.slice(1)} Backup`,
        type: backupType,
        size: '0 MB',
        createdAt: new Date().toISOString(),
        status: 'completed',
        description: `New ${backupType} backup created successfully`
      };
      
      setBackups([newBackup, ...backups]);
      setStats(prev => ({
        ...prev,
        totalBackups: prev.totalBackups + 1,
        lastBackup: new Date().toISOString()
      }));
      
      setSuccessMessage('Backup created successfully!');
      setShowCreateModal(false);
    } catch (err) {
      setError('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSuccessMessage(`Backup "${selectedBackup.name}" restored successfully!`);
      setShowRestoreModal(false);
      setSelectedBackup(null);
    } catch (err) {
      setError('Failed to restore backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to delete this backup?')) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBackups(backups.filter(backup => backup.id !== backupId));
      setStats(prev => ({
        ...prev,
        totalBackups: prev.totalBackups - 1
      }));
      
      setSuccessMessage('Backup deleted successfully!');
    } catch (err) {
      setError('Failed to delete backup');
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('This will delete backups older than 30 days. Continue?')) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const filteredBackups = backups.filter(backup => 
        new Date(backup.createdAt) > thirtyDaysAgo
      );
      
      setBackups(filteredBackups);
      setSuccessMessage('Old backups cleaned up successfully!');
    } catch (err) {
      setError('Failed to cleanup old backups');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'in_progress': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'full': return '💾';
      case 'database': return '🗄️';
      case 'config': return '⚙️';
      case 'logs': return '📋';
      default: return '📦';
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading backup data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '600', 
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Backup Management
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
            Create, restore, and manage system backups
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleCleanup}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.5 : 1,
              fontSize: '0.875rem',
              fontWeight: '500'
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
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Create Backup
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#10b981',
          marginBottom: '2rem'
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
          marginBottom: '2rem'
        }}>
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Total Backups
                </div>
                <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                  {stats.totalBackups}
                </div>
              </div>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                💾
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Total Size
                </div>
                <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                  {stats.totalSize}
                </div>
              </div>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📊
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Success Rate
                </div>
                <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                  {stats.successRate}%
                </div>
              </div>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                ✅
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Last Backup
                </div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>
                  {formatTimestamp(stats.lastBackup)}
                </div>
              </div>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                🕒
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backups List */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          Available Backups
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Backup
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Type
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Size
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Created
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.id} style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                        {getTypeIcon(backup.type)} {backup.name}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                        {backup.description}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#3b82f6',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      {backup.type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>
                    {backup.size}
                  </td>
                  <td style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                    {formatTimestamp(backup.createdAt)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `rgba(${getStatusColor(backup.status).replace('#', '')}, 0.2)`,
                      color: getStatusColor(backup.status),
                      border: `1px solid rgba(${getStatusColor(backup.status).replace('#', '')}, 0.3)`
                    }}>
                      {backup.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setSelectedBackup(backup);
                          setShowRestoreModal(true);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(31, 41, 55, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Create New Backup
            </h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#e5e7eb',
                marginBottom: '0.5rem'
              }}>
                Backup Type
              </label>
              <select
                value={backupType}
                onChange={(e) => setBackupType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="full">Full System Backup</option>
                <option value="database">Database Backup</option>
                <option value="config">Configuration Backup</option>
                <option value="logs">Logs Backup</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  color: '#9ca3af',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
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
                  cursor: loading ? 'not-allowed' : 'pointer',
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

      {/* Restore Backup Modal */}
      {showRestoreModal && selectedBackup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(31, 41, 55, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Restore Backup
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>
                Selected Backup: <span style={{ color: 'white', fontWeight: '500' }}>{selectedBackup.name}</span>
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                {selectedBackup.description}
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#e5e7eb',
                marginBottom: '0.5rem'
              }}>
                Restore Scope
              </label>
              <select
                value={restoreScope}
                onChange={(e) => setRestoreScope(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="full">Full Restore</option>
                <option value="data">Data Only</option>
                <option value="config">Configuration Only</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackup(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  color: '#9ca3af',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.5rem',
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
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
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
