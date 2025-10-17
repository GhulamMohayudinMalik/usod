import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalThreats: 0,
    activeUsers: 0,
    securityEvents: 0,
    systemHealth: 0
  });

  const [recentThreats, setRecentThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dashboard stats and security events in parallel
      const [statsResult, eventsResult] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getSecurityEvents()
      ]);

      if (statsResult.success) {
        // Map backend data to our frontend format
        const backendStats = statsResult.data;
        setStats({
          totalThreats: backendStats.activeThreats || 0,
          activeUsers: backendStats.protectedUsers || 0,
          securityEvents: backendStats.activeThreats || 0, // Using activeThreats as security events count
          systemHealth: backendStats.securityScore || 0
        });
      } else {
        console.error('Failed to load dashboard stats:', statsResult.message);
        setError('Failed to load dashboard statistics');
      }

      if (eventsResult.success) {
        // Map backend security events to our frontend format
        const backendEvents = eventsResult.data;
        const mappedThreats = backendEvents.map((event, index) => ({
          id: event.id || index + 1,
          type: event.type || 'Security Event',
          severity: event.severity || 'Medium',
          timestamp: event.timestamp || new Date().toISOString(),
          source: event.source || 'Unknown',
          status: event.resolved ? 'Resolved' : 'Active'
        }));
        setRecentThreats(mappedThreats.slice(0, 10)); // Show only first 10 events
      } else {
        console.error('Failed to load security events:', eventsResult.message);
        // Don't set error for events, just use empty array
        setRecentThreats([]);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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
    <div style={{ padding: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', margin: 0, marginBottom: '0.25rem' }}>
              Dashboard Overview
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
              Welcome to your security operations dashboard
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, #059669 0%, #0891b2 100%)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)';
              }
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            color: '#fca5a5',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}
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
                Security Score
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {stats.systemHealth}%
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Overall security posture
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

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Active Threats
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {stats.totalThreats}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Threats requiring attention
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
                Protected Users
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {stats.activeUsers}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Users with security policies
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
              👥
            </div>
          </div>
        </div>
      </div>

      {/* Recent Threats */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
            Recent Threats
          </h2>
          <button 
            style={{ 
              color: '#60a5fa', 
              fontSize: '0.875rem', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={loadDashboardData}
          >
            View All
          </button>
        </div>
        
        {recentThreats && recentThreats.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {recentThreats.map((threat) => (
              <div
                key={threat.id}
                style={{
                  background: 'rgba(31, 41, 55, 0.9)',
                  border: '1px solid rgba(55, 65, 81, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start' }}>
                  <div style={{ marginRight: '0.75rem' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${getSeverityColor(threat.severity)} 0%, ${getSeverityColor(threat.severity)}CC 100%)`
                    }}>
                      <svg style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ 
                        color: getSeverityColor(threat.severity), 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        margin: 0,
                        textTransform: 'capitalize'
                      }}>
                        {threat.severity} Threat Level
                      </h3>
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                        {formatTimestamp(threat.timestamp)}
                      </span>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                      {threat.description || threat.type}
                    </p>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      <span style={{ color: '#9ca3af' }}>Source: </span>
                      <span style={{ color: '#e5e7eb' }}>{threat.source}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      <span style={{ color: '#9ca3af' }}>Confidence: </span>
                      <span style={{ color: '#e5e7eb' }}>75%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#9ca3af' }}>No recent events.</div>
        )}
      </div>

      {/* AI Analysis Block */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.5)',
        border: '1px solid rgba(55, 65, 81, 0.3)',
        borderRadius: '0.5rem'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(55, 65, 81, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ color: '#e5e7eb', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>
            AI-Powered Threat Analysis
          </h3>
          <button style={{ 
            color: '#60a5fa', 
            fontSize: '0.75rem', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer'
          }}>
            Run Analysis
          </button>
        </div>
        <div style={{ padding: '1rem' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Analyze text or network traffic for potential security threats using advanced AI detection.
          </p>
          <textarea 
            style={{
              width: '100%',
              height: '6rem',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              background: 'rgba(17, 24, 39, 0.8)',
              color: '#e5e7eb',
              border: '1px solid rgba(55, 65, 81, 0.3)',
              fontSize: '0.875rem',
              resize: 'vertical',
              outline: 'none'
            }}
            placeholder="Enter text to analyze for potential threats..."
          />
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}>
              Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
