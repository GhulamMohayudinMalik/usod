import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch logs from backend
  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
        // Remove platform filter for now to show all logs
      };
      
      if (filters.action) {
        params.action = filters.action;
      }
      
      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }
      
      const result = await apiService.getLogs(params);
      
      if (result.success) {
        const logs = result.data.logs || [];
        console.log('Fetched logs:', logs.length, 'logs');
        
        setLogs(logs);
        setPagination(result.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch logs:', result.message);
        if (result.message && result.message.includes('unauthorized')) {
          // Handle unauthorized access - redirect to login
          window.location.href = '/login';
        } else {
          setError(result.message || 'Failed to load logs');
        }
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      if (err.message && err.message.includes('unauthorized')) {
        // Handle unauthorized access - redirect to login
        window.location.href = '/login';
      } else {
        setError('Failed to load logs. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };


  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.limit]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const toTitleCase = (str) => {
    if (!str) return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getPlatformBadgeStyle = (platform) => {
    const normalizedPlatform = platform?.toLowerCase();
    
    if (normalizedPlatform === 'mobile') {
      return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
    } else if (normalizedPlatform === 'desktop') {
      return { background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' };
    } else if (normalizedPlatform === 'web') {
      return { background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
    } else {
      return { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    }
  };


  const showLogDetails = (log) => {
    const details = JSON.stringify(log.details || {}, null, 2);
    alert(`Log Details:\n\n${details}`);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({ action: '', startDate: '', endDate: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const goToPage = (pageNumber) => {
    setPagination(prev => ({ ...prev, page: pageNumber }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <div style={{
          background: 'rgba(254, 242, 242, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '1rem',
          borderRadius: '0.5rem'
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: 'white',
          margin: 0
        }}>
          Security Logs
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {lastUpdated && (
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#9ca3af'
            }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button 
            style={{
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.background = '#2563eb'}
            onClick={fetchLogs}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div style={{
        marginBottom: '1.5rem',
        background: 'rgba(31, 41, 55, 0.8)',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid rgba(55, 65, 81, 0.3)'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: 'white'
        }}>
          Filters
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#d1d5db',
              marginBottom: '0.25rem'
            }}>
              Action
            </label>
            <select 
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '0.375rem',
                background: 'rgba(55, 65, 81, 0.5)',
                color: 'white',
                fontSize: '0.875rem'
              }}
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="security_event">Security Event</option>
              <option value="password_change">Password Change</option>
              <option value="profile_update">Profile Update</option>
              <option value="access_denied">Access Denied</option>
              <option value="system_error">System Error</option>
              <option value="session_created">Session Created</option>
              <option value="session_expired">Session Expired</option>
              <option value="token_refresh">Token Refresh</option>
              <option value="account_locked">Account Locked</option>
              <option value="account_unlocked">Account Unlocked</option>
              <option value="user_created">User Created</option>
              <option value="user_deleted">User Deleted</option>
              <option value="role_changed">Role Changed</option>
              <option value="settings_changed">Settings Changed</option>
              <option value="backup_created">Backup Created</option>
              <option value="backup_restored">Backup Restored</option>
              <option value="suspicious_activity">Suspicious Activity</option>
              <option value="brute_force_detected">Brute Force Detected</option>
              <option value="sql_injection_attempt">SQL Injection Attempt</option>
              <option value="xss_attempt">XSS Attempt</option>
              <option value="csrf_attempt">CSRF Attempt</option>
              <option value="ip_blocked">IP Blocked</option>
              <option value="ip_unblocked">IP Unblocked</option>
            </select>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#d1d5db',
              marginBottom: '0.25rem'
            }}>
              Start Date
            </label>
            <input 
              type="date" 
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '0.375rem',
                background: 'rgba(55, 65, 81, 0.5)',
                color: 'white',
                fontSize: '0.875rem'
              }}
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#d1d5db',
              marginBottom: '0.25rem'
            }}>
              End Date
            </label>
            <input 
              type="date" 
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '0.375rem',
                background: 'rgba(55, 65, 81, 0.5)',
                color: 'white',
                fontSize: '0.875rem'
              }}
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button 
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(75, 85, 99, 0.5)',
              color: '#d1d5db',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(75, 85, 99, 0.7)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(75, 85, 99, 0.5)'}
            onClick={resetFilters}
          >
            Reset
          </button>
          <button 
            style={{
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.background = '#2563eb'}
            onClick={applyFilters}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        borderRadius: '0.5rem',
        border: '1px solid rgba(55, 65, 81, 0.3)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(55, 65, 81, 0.5)' }}>
              <tr>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  color: '#d1d5db', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Timestamp
                </th>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  color: '#d1d5db', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Action
                </th>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  color: '#d1d5db', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  User
                </th>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  color: '#d1d5db', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  IP Address
                </th>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  color: '#d1d5db', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  color: '#d1d5db', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Platform
                </th>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  color: '#d1d5db', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody style={{ background: 'rgba(31, 41, 55, 0.8)' }}>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                    No logs found matching the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr 
                    key={log.id || log._id || `log-${index}`} 
                    style={{ 
                      borderBottom: '1px solid rgba(55, 65, 81, 0.3)'
                    }}
                  >
                    <td style={{ 
                      padding: '1rem 1.5rem', 
                      color: 'white', 
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td style={{ 
                      padding: '1rem 1.5rem', 
                      color: 'white', 
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {log.action}
                    </td>
                    <td style={{ 
                      padding: '1rem 1.5rem', 
                      color: 'white', 
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {log.userId?.username || log.details?.username || 'Unknown'}
                    </td>
                    <td style={{ 
                      padding: '1rem 1.5rem', 
                      color: 'white', 
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {log.ipAddress || log.ip_address || 'Unknown'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {log.status ? (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          ...(log.status === 'success' 
                            ? { background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }
                            : { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
                          )
                        }}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        ...(getPlatformBadgeStyle(log.details?.platform))
                      }}>
                        {toTitleCase(log.details?.platform)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textDecoration: 'underline',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
                        onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                        onClick={() => showLogDetails(log)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 0 && (
          <div style={{
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(55, 65, 81, 0.3)'
          }}>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#d1d5db'
            }}>
              Showing <span style={{ fontWeight: '500' }}>{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span style={{ fontWeight: '500' }}>
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of{' '}
              <span style={{ fontWeight: '500' }}>{pagination.total}</span> results
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(75, 85, 99, 0.5)',
                  color: '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  opacity: pagination.page === 1 ? 0.5 : 1,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (pagination.page !== 1) {
                    e.target.style.background = 'rgba(75, 85, 99, 0.7)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pagination.page !== 1) {
                    e.target.style.background = 'rgba(75, 85, 99, 0.5)';
                  }
                }}
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <button
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(75, 85, 99, 0.5)',
                  color: '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  opacity: pagination.page === pagination.totalPages ? 0.5 : 1,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (pagination.page !== pagination.totalPages) {
                    e.target.style.background = 'rgba(75, 85, 99, 0.7)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pagination.page !== pagination.totalPages) {
                    e.target.style.background = 'rgba(75, 85, 99, 0.5)';
                  }
                }}
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;
