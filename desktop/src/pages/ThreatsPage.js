import React, { useState, useEffect } from 'react';

const ThreatsPage = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setThreats([
        {
          id: 1,
          type: 'SQL Injection',
          severity: 'High',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          source: '192.168.1.100',
          status: 'Blocked',
          description: 'Attempted SQL injection on login endpoint'
        },
        {
          id: 2,
          type: 'Brute Force Attack',
          severity: 'Medium',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          source: '203.0.113.42',
          status: 'Detected',
          description: 'Multiple failed login attempts detected'
        },
        {
          id: 3,
          type: 'XSS Attempt',
          severity: 'High',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          source: '198.51.100.25',
          status: 'Blocked',
          description: 'Cross-site scripting attempt on user profile'
        },
        {
          id: 4,
          type: 'Malware Detection',
          severity: 'Critical',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          source: '192.168.1.50',
          status: 'Quarantined',
          description: 'Malicious file detected and quarantined'
        },
        {
          id: 5,
          type: 'DDoS Attack',
          severity: 'High',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          source: 'Multiple IPs',
          status: 'Mitigated',
          description: 'Distributed denial of service attack mitigated'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return '#dc2626';
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Blocked': return '#10b981';
      case 'Detected': return '#f59e0b';
      case 'Quarantined': return '#8b5cf6';
      case 'Mitigated': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
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
          Security Threats
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
          Monitor and manage security threats and incidents
        </p>
      </div>

      {/* Threat Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Total Threats
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {threats.length}
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
              🚨
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                High Severity
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {threats.filter(t => t.severity === 'High' || t.severity === 'Critical').length}
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

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Blocked
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {threats.filter(t => t.status === 'Blocked').length}
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
              🛡️
            </div>
          </div>
        </div>
      </div>

      {/* Threats List */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Threats</h2>
          <button className="btn btn-primary">
            Export Report
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {threats.map((threat) => (
            <div
              key={threat.id}
              style={{
                background: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(55, 65, 81, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: `linear-gradient(135deg, ${getSeverityColor(threat.severity)} 0%, ${getSeverityColor(threat.severity)}CC 100%)`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  🛡️
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ color: 'white', fontWeight: '600', fontSize: '1.1rem' }}>
                      {threat.type}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `rgba(${getSeverityColor(threat.severity)}20, 0.2)`,
                      color: getSeverityColor(threat.severity)
                    }}>
                      {threat.severity}
                    </span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `rgba(${getStatusColor(threat.status)}20, 0.2)`,
                      color: getStatusColor(threat.status)
                    }}>
                      {threat.status}
                    </span>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {threat.description}
                  </p>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    {threat.source} • {formatTimestamp(threat.timestamp)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                  View Details
                </button>
                <button className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                  Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatsPage;
