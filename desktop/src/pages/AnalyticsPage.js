import React, { useState, useEffect } from 'react';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    securityEvents: [],
    loginAttempts: [],
    stats: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock analytics data
      const mockStats = {
        totalEvents: 1247,
        criticalEvents: 23,
        resolvedEvents: 1189,
        avgResponseTime: 2.3,
        securityScore: 87,
        uptime: 99.9
      };

      const mockSecurityEvents = [
        { date: '2024-01-01', count: 45, severity: 'high' },
        { date: '2024-01-02', count: 32, severity: 'medium' },
        { date: '2024-01-03', count: 67, severity: 'high' },
        { date: '2024-01-04', count: 28, severity: 'low' },
        { date: '2024-01-05', count: 89, severity: 'critical' },
        { date: '2024-01-06', count: 54, severity: 'high' },
        { date: '2024-01-07', count: 41, severity: 'medium' }
      ];

      const mockLoginAttempts = [
        { hour: '00:00', attempts: 12, successful: 8 },
        { hour: '04:00', attempts: 8, successful: 6 },
        { hour: '08:00', attempts: 45, successful: 42 },
        { hour: '12:00', attempts: 67, successful: 61 },
        { hour: '16:00', attempts: 89, successful: 82 },
        { hour: '20:00', attempts: 34, successful: 31 }
      ];
      
      setAnalytics({
        securityEvents: mockSecurityEvents,
        loginAttempts: mockLoginAttempts,
        stats: mockStats
      });
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  // Calculate analytics metrics
  const calculateMetrics = () => {
    if (!analytics.stats) return null;
    
    const { stats } = analytics;
    return {
      threatTrend: ((stats.criticalEvents / stats.totalEvents) * 100).toFixed(1),
      resolutionRate: ((stats.resolvedEvents / stats.totalEvents) * 100).toFixed(1),
      avgThreatsPerDay: (stats.totalEvents / 30).toFixed(1),
      systemHealth: stats.uptime
    };
  };

  const metrics = calculateMetrics();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading analytics...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.2)',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        borderRadius: '0.5rem',
        padding: '1rem',
        color: '#ef4444',
        marginBottom: '1rem'
      }}>
        <p>{error}</p>
        <button 
          style={{
            marginTop: '0.5rem',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            color: '#ef4444',
            cursor: 'pointer'
          }}
          onClick={fetchAnalytics}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '2rem', color: 'white' }}>
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
          Security Analytics
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '2rem' }}>
          Comprehensive security metrics, trends, and performance analytics
        </p>
      </div>

      {/* Header with refresh */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          {lastUpdated && (
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
        <button 
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={fetchAnalytics}
        >
          Refresh Data
        </button>
      </div>
      
      {/* Key Metrics */}
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
                Total Security Events
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {analytics.stats?.totalEvents.toLocaleString()}
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
                Critical Events
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {analytics.stats?.criticalEvents}
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
                Resolution Rate
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {metrics?.resolutionRate}%
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
                System Uptime
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '600' }}>
                {analytics.stats?.uptime}%
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
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Security Events Chart */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: 'white'
          }}>
            Security Events Trend (7 Days)
          </h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '0.5rem', padding: '1rem 0' }}>
            {analytics.securityEvents.map((event, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div 
                  style={{
                    width: '100%',
                    height: `${(event.count / 100) * 150}px`,
                    background: event.severity === 'critical' ? '#ef4444' : 
                               event.severity === 'high' ? '#f59e0b' : 
                               event.severity === 'medium' ? '#06b6d4' : '#10b981',
                    borderRadius: '0.25rem 0.25rem 0 0',
                    marginBottom: '0.5rem',
                    minHeight: '20px'
                  }}
                ></div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'white', fontWeight: '500' }}>
                  {event.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Attempts Chart */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: 'white'
          }}>
            Login Attempts (24 Hours)
          </h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '0.5rem', padding: '1rem 0' }}>
            {analytics.loginAttempts.map((attempt, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '150px', justifyContent: 'end', gap: '2px' }}>
                  <div 
                    style={{
                      width: '100%',
                      height: `${(attempt.successful / 100) * 100}px`,
                      background: '#10b981',
                      borderRadius: '0.25rem 0.25rem 0 0',
                      minHeight: '10px'
                    }}
                  ></div>
                  <div 
                    style={{
                      width: '100%',
                      height: `${((attempt.attempts - attempt.successful) / 100) * 100}px`,
                      background: '#ef4444',
                      borderRadius: '0 0 0.25rem 0.25rem',
                      minHeight: '5px'
                    }}
                  ></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.5rem' }}>
                  {attempt.hour}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'white', fontWeight: '500' }}>
                  {attempt.attempts}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '0.25rem' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Successful</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '0.25rem' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Failed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: 'white'
        }}>
          Performance Metrics
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            background: 'rgba(55, 65, 81, 0.3)',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Avg Response Time
            </div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>
              {analytics.stats?.avgResponseTime}s
            </div>
          </div>
          <div style={{
            padding: '1rem',
            background: 'rgba(55, 65, 81, 0.3)',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Security Score
            </div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>
              {analytics.stats?.securityScore}%
            </div>
          </div>
          <div style={{
            padding: '1rem',
            background: 'rgba(55, 65, 81, 0.3)',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Threats/Day
            </div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>
              {metrics?.avgThreatsPerDay}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            background: 'rgba(55, 65, 81, 0.3)',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Threat Trend
            </div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>
              {metrics?.threatTrend}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
