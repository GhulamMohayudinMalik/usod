import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    securityEvents: [],
    loginAttempts: [],
    logs: [],
    stats: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsResult, securityEventsResult, loginAttemptsResult, logsResult] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getThreats(50),
        apiService.getLoginAttempts(50),
        apiService.getLogs({ limit: 20 })
      ]);
      
      setAnalytics({
        securityEvents: securityEventsResult.success ? securityEventsResult.data : [],
        loginAttempts: loginAttemptsResult.success ? loginAttemptsResult.data : [],
        logs: logsResult.success ? logsResult.data.logs || [] : [],
        stats: statsResult.success ? statsResult.data : null
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
    const { securityEvents = [], loginAttempts = [] } = analytics;
    
    // Security events by type
    const eventsByType = securityEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});
    
    // Security events by severity
    const eventsBySeverity = securityEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {});
    
    // Login attempts success rate
    const successfulLogins = loginAttempts.filter(attempt => attempt.successful).length;
    const loginSuccessRate = loginAttempts.length > 0 ? (successfulLogins / loginAttempts.length) * 100 : 0;
    
    // Recent activity (last 24 hours)
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = securityEvents.filter(event => 
      new Date(event.timestamp) > last24Hours
    ).length;
    
    const recentLogins = loginAttempts.filter(attempt => 
      new Date(attempt.timestamp) > last24Hours
    ).length;
    
    return {
      eventsByType,
      eventsBySeverity,
      loginSuccessRate,
      recentEvents,
      recentLogins,
      totalEvents: securityEvents.length,
      totalLogins: loginAttempts.length
    };
  };

  const metrics = calculateMetrics();
  
  if (error) {
    return (
      <div style={{ padding: '1.5rem' }}>
      <div style={{
        background: 'rgba(239, 68, 68, 0.2)',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        borderRadius: '0.5rem',
        padding: '1rem',
          color: '#ef4444'
        }}>
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '1.5rem', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div>
        <h1 style={{ 
            fontSize: '1.5rem', 
          fontWeight: '600', 
            marginBottom: '0.25rem',
            color: 'white'
          }}>
            Analytics Dashboard
        </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            Security insights and performance metrics
        </p>
      </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {lastUpdated && (
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
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
          onClick={fetchAnalytics}
        >
            Refresh
        </button>
        </div>
      </div>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #374151',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
      <div style={{
        display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
            marginBottom: '1.5rem'
      }}>
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(75, 85, 99, 0.3)'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '500', 
                color: 'white', 
                marginBottom: '0.5rem' 
              }}>
                Total Security Events
              </h3>
              <p style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: '#2563eb', 
                margin: 0 
              }}>
                {metrics.totalEvents}
              </p>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#9ca3af', 
                margin: 0 
              }}>
                Last 24h: {metrics.recentEvents}
              </p>
            </div>
            
            <div style={{
              background: 'rgba(31, 41, 55, 0.8)',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(75, 85, 99, 0.3)'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '500', 
                color: 'white', 
                marginBottom: '0.5rem' 
              }}>
                Login Attempts
              </h3>
              <p style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: '#10b981', 
                margin: 0 
              }}>
                {metrics.totalLogins}
              </p>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#9ca3af', 
                margin: 0 
              }}>
                Last 24h: {metrics.recentLogins}
              </p>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(75, 85, 99, 0.3)'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '500', 
                color: 'white', 
                marginBottom: '0.5rem' 
              }}>
                Login Success Rate
              </h3>
              <p style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: '#8b5cf6', 
                margin: 0 
              }}>
                {metrics.loginSuccessRate.toFixed(1)}%
              </p>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#9ca3af', 
                margin: 0 
              }}>
                Successful logins
              </p>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(75, 85, 99, 0.3)'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '500', 
                color: 'white', 
                marginBottom: '0.5rem' 
              }}>
                Security Score
              </h3>
              <p style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: '#f97316', 
                margin: 0 
              }}>
                {analytics.stats?.securityScore || 0}%
              </p>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#9ca3af', 
                margin: 0 
              }}>
                Overall security posture
              </p>
        </div>
      </div>


      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
            marginBottom: '1.5rem'
      }}>
            {/* Security Events by Type */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(75, 85, 99, 0.3)'
        }}>
          <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '500', 
            marginBottom: '1rem',
            color: 'white'
          }}>
                Security Events by Type
          </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(metrics.eventsByType).map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      color: '#d1d5db',
                      textTransform: 'capitalize'
                    }}>
                      {type.replace('_', ' ')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: '8rem', 
                        background: 'rgba(55, 65, 81, 0.3)', 
                        borderRadius: '9999px', 
                        height: '0.5rem' 
                      }}>
                <div 
                  style={{
                            background: '#2563eb', 
                            height: '0.5rem', 
                            borderRadius: '9999px',
                            width: `${(count / metrics.totalEvents) * 100}%` 
                  }}
                ></div>
                </div>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        color: 'white', 
                        width: '2rem', 
                        textAlign: 'right' 
                      }}>
                        {count}
                      </span>
                </div>
              </div>
            ))}
          </div>
        </div>

            {/* Security Events by Severity */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(75, 85, 99, 0.3)'
        }}>
          <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '500', 
            marginBottom: '1rem',
            color: 'white'
          }}>
                Events by Severity
          </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(metrics.eventsBySeverity).map(([severity, count]) => {
                  const colors = {
                    low: '#10b981',
                    medium: '#f59e0b',
                    high: '#f97316',
                    critical: '#ef4444'
                  };
                  
                  return (
                    <div key={severity} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        color: '#d1d5db',
                        textTransform: 'capitalize'
                      }}>
                        {severity}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          width: '8rem', 
                          background: 'rgba(55, 65, 81, 0.3)', 
                          borderRadius: '9999px', 
                          height: '0.5rem' 
                        }}>
                  <div 
                    style={{
                              background: colors[severity] || '#6b7280', 
                              height: '0.5rem', 
                              borderRadius: '9999px',
                              width: `${(count / metrics.totalEvents) * 100}%` 
                    }}
                  ></div>
                </div>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '500', 
                          color: 'white', 
                          width: '2rem', 
                          textAlign: 'right' 
                        }}>
                          {count}
                        </span>
                </div>
                </div>
                  );
                })}
          </div>
        </div>
      </div>

          {/* Recent Activity */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        padding: '1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(75, 85, 99, 0.3)'
      }}>
        <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '500', 
          marginBottom: '1rem',
          color: 'white'
        }}>
              Recent Activity
        </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(55, 65, 81, 0.3)' }}>
                  <tr>
                    <th style={{ 
                      padding: '0.75rem 1.5rem', 
                      textAlign: 'left', 
                      fontSize: '0.75rem', 
                      fontWeight: '500', 
                      color: '#9ca3af', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em' 
                    }}>
                      Time
                    </th>
                    <th style={{ 
                      padding: '0.75rem 1.5rem', 
                      textAlign: 'left', 
                      fontSize: '0.75rem', 
                      fontWeight: '500', 
                      color: '#9ca3af', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em' 
                    }}>
                      Type
                    </th>
                    <th style={{ 
                      padding: '0.75rem 1.5rem', 
                      textAlign: 'left', 
                      fontSize: '0.75rem', 
                      fontWeight: '500', 
                      color: '#9ca3af', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em' 
                    }}>
                      Action/Event
                    </th>
                    <th style={{ 
                      padding: '0.75rem 1.5rem', 
                      textAlign: 'left', 
                      fontSize: '0.75rem', 
                      fontWeight: '500', 
                      color: '#9ca3af', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em' 
                    }}>
                      Source
                    </th>
                    <th style={{ 
                      padding: '0.75rem 1.5rem', 
                      textAlign: 'left', 
                      fontSize: '0.75rem', 
                      fontWeight: '500', 
                      color: '#9ca3af', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em' 
                    }}>
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Combine security events and logs, sort by timestamp
                    const combinedActivity = [
                      ...(analytics.securityEvents || []).slice(0, 5).map(event => ({
                        ...event,
                        activityType: 'security_event',
                        displayType: 'Security Event',
                        displayAction: event.type?.replace('_', ' ') || 'Security Event',
                        displaySource: event.source,
                        displayDetails: event.description,
                        severity: event.severity
                      })),
                      ...(analytics.logs || []).slice(0, 5).map(log => ({
                        ...log,
                        activityType: 'log',
                        displayType: 'System Log',
                        displayAction: log.action || 'System Action',
                        displaySource: log.ipAddress || 'Unknown',
                        displayDetails: log.details?.description || log.action || 'System activity',
                        severity: log.status === 'failure' ? 'medium' : 'low'
                      }))
                    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10);

                    return combinedActivity.map((item, index) => (
                      <tr key={`${item.activityType}-${item.id || item._id || index}`} style={{ 
                        borderBottom: '1px solid rgba(55, 65, 81, 0.3)',
                        transition: 'background-color 0.2s'
                      }}>
                        <td style={{ 
                          padding: '1rem 1.5rem', 
                          whiteSpace: 'nowrap', 
                          fontSize: '0.875rem', 
                          color: 'white' 
                        }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem', 
                          whiteSpace: 'nowrap', 
                          fontSize: '0.875rem' 
                        }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            background: item.activityType === 'security_event' 
                              ? 'rgba(59, 130, 246, 0.1)' 
                              : 'rgba(55, 65, 81, 0.3)',
                            color: item.activityType === 'security_event' 
                              ? '#60a5fa' 
                              : '#9ca3af'
                          }}>
                            {item.displayType}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem', 
                          whiteSpace: 'nowrap', 
                          fontSize: '0.875rem', 
                          color: 'white',
                          textTransform: 'capitalize'
                        }}>
                          {item.displayAction}
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem', 
                          whiteSpace: 'nowrap', 
                          fontSize: '0.875rem', 
                          color: 'white' 
                        }}>
                          {item.displaySource}
                        </td>
                        <td style={{ 
                          padding: '1rem 1.5rem', 
                          fontSize: '0.875rem', 
                          color: 'white', 
                          maxWidth: '12rem', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}>
                          {item.displayDetails}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
