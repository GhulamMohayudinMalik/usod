import React, { useState, useEffect } from 'react';

const AiInsightsPage = () => {
  const [threatData, setThreatData] = useState([]);
  const [insightResult, setInsightResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchThreatData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Mock threat data
        const mockThreats = [
          {
            id: 1,
            type: 'Malware Detection',
            severity: 'high',
            source: 'Endpoint Protection',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            description: 'Suspicious executable detected on workstation-03'
          },
          {
            id: 2,
            type: 'Failed Login',
            severity: 'medium',
            source: 'Authentication System',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            description: 'Multiple failed login attempts from IP 192.168.1.100'
          },
          {
            id: 3,
            type: 'Data Exfiltration',
            severity: 'critical',
            source: 'Network Monitor',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            description: 'Large data transfer detected to external server'
          },
          {
            id: 4,
            type: 'Phishing Attempt',
            severity: 'medium',
            source: 'Email Security',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            description: 'Suspicious email with malicious attachment blocked'
          },
          {
            id: 5,
            type: 'System Intrusion',
            severity: 'high',
            source: 'IDS/IPS',
            timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            description: 'Unauthorized access attempt detected on server-02'
          }
        ];
        
        setThreatData(mockThreats);
        
        // Generate insights automatically when data is loaded
        generateInsights(mockThreats);
      } catch (err) {
        console.error('Error fetching threat intelligence data:', err);
        setError('Failed to load threat intelligence data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchThreatData();
  }, []);
  
  const generateInsights = async (threats) => {
    setInsightLoading(true);
    
    try {
      // Mock insights
      const mockInsights = {
        summary: "Security posture shows moderate risk with several emerging threats detected. Recent malware activity suggests increased targeting of financial services sector. Suspicious login patterns indicate potential credential compromise attempts.",
        recommendations: [
          "Update intrusion detection signatures for emerging threats",
          "Implement additional authentication factors for critical systems",
          "Review and update firewall rules for known malicious IP ranges",
          "Conduct targeted phishing awareness training"
        ],
        risk_score: 65,
        trends: [
          { label: "Malware Detections", value: 23, change: 15 },
          { label: "Phishing Attempts", value: 42, change: -8 },
          { label: "Unauthorized Access", value: 12, change: 5 },
          { label: "Data Exfiltration", value: 4, change: -2 }
        ],
        top_threats: [
          { name: "Emotet Variant", count: 12, severity: "high" },
          { name: "Credential Stuffing", count: 18, severity: "medium" },
          { name: "SQL Injection", count: 7, severity: "high" },
          { name: "Zero-day Vulnerability", count: 3, severity: "critical" },
          { name: "Ransomware", count: 5, severity: "critical" }
        ]
      };
      
      setInsightResult(mockInsights);
    } finally {
      setInsightLoading(false);
    }
  };
  
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#7C3AED';
      default: return '#6B7280';
    }
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading AI insights...</div>
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
          onClick={() => window.location.reload()}
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
          AI Security Insights
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '2rem' }}>
          Advanced threat analysis and recommendations powered by AI
        </p>
      </div>
      
      {/* Main Insights Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Risk Score */}
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
            Security Risk Score
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <svg style={{ width: '8rem', height: '8rem' }} viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet">
                <path 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeDasharray="100, 100"
                  stroke="#374151"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeDasharray={`${insightResult?.risk_score || 0}, 100`}
                  stroke={insightResult?.risk_score ? (insightResult.risk_score > 75 ? '#EF4444' : insightResult.risk_score > 50 ? '#F59E0B' : '#10B981') : '#3B82F6'}
                  strokeWidth="3"
                  fill="none"
                />
                <text x="18" y="20" textAnchor="middle" fontSize="8" fill="currentColor" style={{ color: 'white', fontWeight: 'bold' }}>
                  {insightResult?.risk_score || 0}%
                </text>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Security Trends */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          gridColumn: 'span 2'
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: 'white'
          }}>
            Security Trends
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {insightResult?.trends.map((trend, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>{trend.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db' }}>{trend.value}</span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: trend.change > 0 ? '#ef4444' : '#10b981'
                  }}>
                    {trend.change > 0 ? '↗' : '↘'}
                    {Math.abs(trend.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Summary and Recommendations */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: 'white'
          }}>
            Summary
          </h3>
          <p style={{ color: '#d1d5db', lineHeight: '1.6' }}>
            {insightResult?.summary || 'No summary available'}
          </p>
        </div>
        
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
            Recommendations
          </h3>
          <ul style={{ color: '#d1d5db', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            {insightResult?.recommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Top Threats Chart */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: 'white'
        }}>
          Top Threats
        </h3>
        <div style={{ minHeight: '24rem' }}>
          {insightResult?.top_threats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {insightResult.top_threats.map((threat, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: 'rgba(55, 65, 81, 0.3)',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div 
                      style={{
                        width: '1rem',
                        height: '1rem',
                        borderRadius: '50%',
                        marginRight: '0.75rem',
                        backgroundColor: getSeverityColor(threat.severity)
                      }}
                    ></div>
                    <span style={{ fontWeight: '500', color: 'white' }}>{threat.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{threat.count} occurrences</span>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: getSeverityColor(threat.severity) + '20',
                      color: getSeverityColor(threat.severity),
                      border: `1px solid ${getSeverityColor(threat.severity)}40`
                    }}>
                      {threat.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Threat Intelligence */}
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
          Recent Security Events
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(55, 65, 81, 0.5)' }}>
              <tr>
                <th style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#d1d5db',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Event Type
                </th>
                <th style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#d1d5db',
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
                  color: '#d1d5db',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Severity
                </th>
                <th style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#d1d5db',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {threatData.slice(0, 5).map((event) => (
                <tr key={event.id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>{event.type}</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>{event.source}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: getSeverityColor(event.severity) + '20',
                      color: getSeverityColor(event.severity),
                      border: `1px solid ${getSeverityColor(event.severity)}40`
                    }}>
                      {event.severity.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                    {new Date(event.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          <button 
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: insightLoading ? 0.5 : 1
            }}
            onClick={() => generateInsights(threatData)}
            disabled={insightLoading}
          >
            {insightLoading ? 'Generating insights...' : 'Refresh Insights'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiInsightsPage;
