import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalThreats: 0,
    activeUsers: 0,
    securityEvents: 0,
    systemHealth: 0
  });

  const [recentThreats, setRecentThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalThreats: 24,
        activeUsers: 8,
        securityEvents: 156,
        systemHealth: 98
      });

      setRecentThreats([
        {
          id: 1,
          type: 'SQL Injection',
          severity: 'High',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          source: '192.168.1.100',
          status: 'Blocked'
        },
        {
          id: 2,
          type: 'Brute Force',
          severity: 'Medium',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          source: '203.0.113.42',
          status: 'Detected'
        },
        {
          id: 3,
          type: 'XSS Attempt',
          severity: 'High',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          source: '198.51.100.25',
          status: 'Blocked'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
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
          Dashboard Overview
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
          Welcome to your security operations dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                {stats.totalThreats}
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
                Active Users
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {stats.activeUsers}
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
              👥
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Security Events
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {stats.securityEvents}
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

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                System Health
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {stats.systemHealth}%
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
              ✅
            </div>
          </div>
        </div>
      </div>

      {/* Recent Threats */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Security Threats</h2>
          <button className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
            View All
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recentThreats.map((threat) => (
            <div
              key={threat.id}
              style={{
                background: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(55, 65, 81, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: `linear-gradient(135deg, ${getSeverityColor(threat.severity)} 0%, ${getSeverityColor(threat.severity)}CC 100%)`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  🛡️
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {threat.type}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    {threat.source} • {formatTimestamp(threat.timestamp)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981'
                }}>
                  {threat.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
