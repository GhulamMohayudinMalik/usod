import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mock data for demo
        const mockStats = {
          blockedIPs: 12,
          suspiciousIPs: 8,
          totalAttempts: 156,
          activeThreats: 3
        };

        const mockBlockedIPs = [
          { ip: '192.168.1.100', reason: 'brute_force', blockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
          { ip: '203.0.113.42', reason: 'sql_injection', blockedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
          { ip: '198.51.100.25', reason: 'xss_attempt', blockedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
          { ip: '10.0.0.15', reason: 'suspicious_activity', blockedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() }
        ];

        setSecurityStats(mockStats);
        setBlockedIPs(mockBlockedIPs);
      } catch (err) {
        setError('Failed to load security data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBlockIP = async (e) => {
    e.preventDefault();
    if (!newIP.trim()) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBlockedIP = {
        ip: newIP.trim(),
        reason: blockReason,
        blockedAt: new Date().toISOString()
      };
      
      setBlockedIPs([newBlockedIP, ...blockedIPs]);
      setSecurityStats(prev => ({
        ...prev,
        blockedIPs: prev.blockedIPs + 1
      }));
      
      setSuccessMessage(`IP ${newIP} has been blocked successfully`);
      setNewIP('');
    } catch (err) {
      setError('Failed to block IP address');
    }
  };

  const handleUnblockIP = async (ip) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBlockedIPs(blockedIPs.filter(blockedIP => blockedIP.ip !== ip));
      setSecurityStats(prev => ({
        ...prev,
        blockedIPs: prev.blockedIPs - 1
      }));
      
      setSuccessMessage(`IP ${ip} has been unblocked successfully`);
    } catch (err) {
      setError('Failed to unblock IP address');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading security data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      {/* Header */}
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
          Security Management
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '2rem' }}>
          Monitor and manage security threats, IP blocking, and system protection
        </p>
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

      {/* Security Stats */}
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
                Blocked IPs
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {securityStats.blockedIPs}
              </div>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🚫
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
                Suspicious IPs
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {securityStats.suspiciousIPs}
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
              ⚠️
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
                Total Attempts
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {securityStats.totalAttempts}
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
                Active Threats
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {securityStats.activeThreats}
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
              🛡️
            </div>
          </div>
        </div>
      </div>

      {/* Block IP Form */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          Block IP Address
        </h2>
        <form onSubmit={handleBlockIP} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#e5e7eb',
              marginBottom: '0.5rem'
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
                padding: '0.75rem',
                background: 'rgba(55, 65, 81, 0.5)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#e5e7eb',
              marginBottom: '0.5rem'
            }}>
              Reason
            </label>
            <select
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
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
              <option value="manual_block">Manual Block</option>
              <option value="brute_force">Brute Force</option>
              <option value="sql_injection">SQL Injection</option>
              <option value="xss_attempt">XSS Attempt</option>
              <option value="suspicious_activity">Suspicious Activity</option>
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Block IP
          </button>
        </form>
      </div>

      {/* Blocked IPs List */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          Blocked IP Addresses
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  IP Address
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Reason
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Blocked At
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {blockedIPs.map((blockedIP, index) => (
                <tr key={index} style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                  <td style={{ padding: '1rem', color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>
                    {blockedIP.ip}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                      {blockedIP.reason.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                    {formatTimestamp(blockedIP.blockedAt)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleUnblockIP(blockedIP.ip)}
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
                      Unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
