import React, { useState, useEffect } from 'react';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);

  // Static log data for demonstration
  const staticLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      action: 'login',
      userId: { username: 'GhulamMohayudin' },
      ipAddress: '192.168.1.100',
      status: 'success',
      details: { browser: 'Chrome', os: 'Windows 10', location: 'New York' }
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      action: 'security_event',
      userId: { username: 'admin' },
      ipAddress: '192.168.1.50',
      status: 'detected',
      details: { eventType: 'malware', severity: 'high', description: 'Suspicious file detected' }
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      action: 'sql_injection_attempt',
      userId: null,
      ipAddress: '10.0.0.15',
      status: 'detected',
      details: { pattern: 'UNION SELECT', endpoint: '/api/auth/login' }
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      action: 'password_change',
      userId: { username: 'Ali' },
      ipAddress: '192.168.1.75',
      status: 'success',
      details: { passwordStrength: 'strong', changedBy: 'Ali' }
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      action: 'brute_force_detected',
      userId: null,
      ipAddress: '203.0.113.42',
      status: 'detected',
      details: { attempts: 8, timeWindow: '5 minutes', blocked: true }
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      action: 'logout',
      userId: { username: 'Zuhaib' },
      ipAddress: '192.168.1.200',
      status: 'success',
      details: { reason: 'user_logout', sessionDuration: '2h 15m' }
    },
    {
      id: 7,
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      action: 'xss_attempt',
      userId: null,
      ipAddress: '198.51.100.25',
      status: 'detected',
      details: { pattern: '<script>', endpoint: '/api/users/profile' }
    },
    {
      id: 8,
      timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      action: 'backup_created',
      userId: { username: 'admin' },
      ipAddress: '192.168.1.1',
      status: 'success',
      details: { backupType: 'full', size: '2.5GB', reason: 'scheduled' }
    },
    {
      id: 9,
      timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      action: 'access_denied',
      userId: { username: 'user1234' },
      ipAddress: '192.168.1.150',
      status: 'failure',
      details: { resource: '/api/users', requiredRole: 'admin', userRole: 'user' }
    },
    {
      id: 10,
      timestamp: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
      action: 'session_created',
      userId: { username: 'AliSami' },
      ipAddress: '192.168.1.88',
      status: 'success',
      details: { sessionId: 'sess_abc123', expiresAt: '2024-01-15T10:30:00Z' }
    }
  ];

  useEffect(() => {
    // Simulate loading logs
    setTimeout(() => {
      setLogs(staticLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'success': return { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' };
      case 'failure': return { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
      case 'detected': return { background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' };
      default: return { background: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' };
    }
  };

  const showLogDetails = (log) => {
    const details = JSON.stringify(log.details || {}, null, 2);
    alert(`Log Details:\n\n${details}`);
  };

  const applyFilters = () => {
    let filteredLogs = staticLogs;

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
    }

    setLogs(filteredLogs);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ action: '', startDate: '', endDate: '' });
    setLogs(staticLogs);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Security Logs
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
          Monitor and analyze security events and activities
        </p>
      </div>

      {/* Filter Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Filters
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div className="form-group">
            <label className="form-label">Action</label>
            <select
              className="form-input"
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="security_event">Security Event</option>
              <option value="password_change">Password Change</option>
              <option value="access_denied">Access Denied</option>
              <option value="sql_injection_attempt">SQL Injection Attempt</option>
              <option value="xss_attempt">XSS Attempt</option>
              <option value="brute_force_detected">Brute Force Detected</option>
              <option value="backup_created">Backup Created</option>
              <option value="session_created">Session Created</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={resetFilters}>
            Reset
          </button>
          <button className="btn btn-primary" onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Timestamp
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Action
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  User
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  IP Address
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                    No logs found matching the current filters.
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                    <td style={{ padding: '1rem', color: 'white', fontSize: '0.875rem' }}>
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td style={{ padding: '1rem', color: 'white', fontSize: '0.875rem' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '1rem', color: 'white', fontSize: '0.875rem' }}>
                      {log.userId?.username || 'Unknown'}
                    </td>
                    <td style={{ padding: '1rem', color: 'white', fontSize: '0.875rem' }}>
                      {log.ipAddress || 'Unknown'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        ...getStatusBadgeClass(log.status)
                      }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#06b6d4',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textDecoration: 'underline'
                        }}
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
        {totalPages > 1 && (
          <div style={{
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(55, 65, 81, 0.3)',
            background: 'rgba(31, 41, 55, 0.5)'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, logs.length)} of {logs.length} results
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
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
