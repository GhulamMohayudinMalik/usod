import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const SecurityPage = () => {
  const [securityStats, setSecurityStats] = useState({
    blockedIPs: 0,
    suspiciousIPs: 0,
    totalAttempts: 0,
    activeThreats: 0
  });
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // IP management
  const [newIP, setNewIP] = useState('');
  const [blockReason, setBlockReason] = useState('manual_block');
  const [unblockReason, setUnblockReason] = useState('manual_unblock');

  // Fetch security statistics
  const fetchSecurityStats = async () => {
    try {
      const result = await apiService.getSecurityStats();
      if (result.success) {
        setSecurityStats(result.data);
      } else {
        setError('Failed to fetch security statistics');
      }
    } catch (error) {
      console.error('Error fetching security stats:', error);
      setError('Failed to fetch security statistics');
    }
  };

  // Fetch blocked IPs
  const fetchBlockedIPs = async () => {
    try {
      const result = await apiService.getBlockedIPs();
      if (result.success) {
        setBlockedIPs(result.data);
      } else {
        setError('Failed to fetch blocked IPs');
      }
    } catch (error) {
      console.error('Error fetching blocked IPs:', error);
      setError('Failed to fetch blocked IPs');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSecurityStats(),
        fetchBlockedIPs()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  // Block an IP address
  const handleBlockIP = async (e) => {
    e.preventDefault();
    if (!newIP.trim()) return;

    try {
      const result = await apiService.blockIP(newIP.trim(), blockReason);
      if (result.success) {
        setSuccessMessage(`IP ${newIP} has been blocked successfully`);
        setNewIP('');
        fetchBlockedIPs();
        fetchSecurityStats();
      } else {
        setError(result.message || 'Failed to block IP address');
      }
    } catch (error) {
      console.error('Error blocking IP:', error);
      setError('Failed to block IP address');
    }
  };

  // Unblock an IP address
  const handleUnblockIP = async (ip) => {
    try {
      const result = await apiService.unblockIP(ip, unblockReason);
      if (result.success) {
        setSuccessMessage(`IP ${ip} has been unblocked successfully`);
        fetchBlockedIPs();
        fetchSecurityStats();
      } else {
        setError(result.message || 'Failed to unblock IP address');
      }
    } catch (error) {
      console.error('Error unblocking IP:', error);
      setError('Failed to unblock IP address');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #374151',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#9ca3af' }}>Loading security data...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: 'white'
        }}>
          Security Management
        </h1>
        <button 
          style={{
            padding: '0.5rem 1rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => {
            fetchSecurityStats();
            fetchBlockedIPs();
          }}
        >
          Refresh
        </button>
      </div>

      {/* Messages */}
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

      {/* Security Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              padding: '0.5rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '0.5rem' 
            }}>
              <svg style={{ width: '1.5rem', height: '1.5rem', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div style={{ marginLeft: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Blocked IPs</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', margin: 0 }}>{securityStats.blockedIPs}</p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              padding: '0.5rem', 
              background: 'rgba(245, 158, 11, 0.1)', 
              borderRadius: '0.5rem' 
            }}>
              <svg style={{ width: '1.5rem', height: '1.5rem', color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div style={{ marginLeft: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Suspicious IPs</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', margin: 0 }}>{securityStats.suspiciousIPs}</p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              padding: '0.5rem', 
              background: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: '0.5rem' 
            }}>
              <svg style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div style={{ marginLeft: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Total Attempts</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', margin: 0 }}>{securityStats.totalAttempts}</p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              padding: '0.5rem', 
              background: 'rgba(139, 92, 246, 0.1)', 
              borderRadius: '0.5rem' 
            }}>
              <svg style={{ width: '1.5rem', height: '1.5rem', color: '#8b5cf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div style={{ marginLeft: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Active Threats</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', margin: 0 }}>{securityStats.activeThreats}</p>
            </div>
          </div>
        </div>
      </div>

      {/* IP Management */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Block IP Form */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: 'white', 
            marginBottom: '1rem' 
          }}>
            Block IP Address
          </h3>
          <form onSubmit={handleBlockIP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#d1d5db',
                marginBottom: '0.25rem'
              }}>
                IP Address
              </label>
              <input
                type="text"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                placeholder="192.168.1.100"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.375rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
                required
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
                Reason
              </label>
              <select
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.375rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="manual_block">Manual Block</option>
                <option value="brute_force_attack">Brute Force Attack</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="malicious_behavior">Malicious Behavior</option>
                <option value="policy_violation">Policy Violation</option>
              </select>
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Block IP Address
            </button>
          </form>
        </div>

        {/* Blocked IPs List */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: 'white', 
            marginBottom: '1rem' 
          }}>
            Blocked IP Addresses
          </h3>
          {blockedIPs.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>No IPs are currently blocked</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {blockedIPs.map((ip, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '0.75rem', 
                  background: 'rgba(55, 65, 81, 0.3)', 
                  borderRadius: '0.375rem' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '0.5rem', 
                      height: '0.5rem', 
                      background: '#ef4444', 
                      borderRadius: '50%', 
                      marginRight: '0.75rem' 
                    }}></div>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.875rem', 
                      color: 'white' 
                    }}>
                      {ip}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnblockIP(ip)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security Information */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#60a5fa', 
          marginBottom: '1rem' 
        }}>
          Security Features
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          fontSize: '0.875rem',
          color: '#93c5fd'
        }}>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#60a5fa' }}>Automatic Detection:</h4>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              <li>• SQL Injection attempts</li>
              <li>• XSS attack patterns</li>
              <li>• CSRF token violations</li>
              <li>• Brute force attacks</li>
              <li>• Suspicious activity patterns</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#60a5fa' }}>Protection Measures:</h4>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              <li>• Automatic IP blocking</li>
              <li>• Account lockout after failed attempts</li>
              <li>• Real-time threat monitoring</li>
              <li>• Comprehensive security logging</li>
              <li>• Manual IP management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
