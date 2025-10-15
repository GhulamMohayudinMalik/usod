import React, { useState, useEffect } from 'react';

const SecurityLabPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mock security logs for demo
        const mockLogs = [
          {
            id: 'log_001',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            action: 'sql_injection_attempt',
            ip: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            details: 'Attempted SQL injection: SELECT * FROM users WHERE id = 1 OR 1=1',
            severity: 'high'
          },
          {
            id: 'log_002',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            action: 'xss_attempt',
            ip: '203.0.113.42',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            details: 'XSS attempt detected: <script>alert("XSS")</script>',
            severity: 'medium'
          },
          {
            id: 'log_003',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            action: 'brute_force_attack',
            ip: '198.51.100.25',
            userAgent: 'curl/7.68.0',
            details: 'Multiple failed login attempts detected (15 attempts in 5 minutes)',
            severity: 'high'
          },
          {
            id: 'log_004',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            action: 'suspicious_activity',
            ip: '10.0.0.15',
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            details: 'Unusual access pattern detected from internal network',
            severity: 'low'
          }
        ];

        setLogs(mockLogs);
        setBackendError(false);
      } catch (err) {
        setBackendError(true);
        setError('Failed to load security logs');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const attackTypes = {
    sql_injection: {
      name: 'SQL Injection',
      description: 'Test for SQL injection vulnerabilities',
      payload: "' OR '1'='1",
      color: 'red',
      icon: '💉'
    },
    xss: {
      name: 'Cross-Site Scripting (XSS)',
      description: 'Test for XSS vulnerabilities',
      payload: '<script>alert("XSS")</script>',
      color: 'orange',
      icon: '🎯'
    },
    csrf: {
      name: 'CSRF Attack',
      description: 'Test for CSRF vulnerabilities',
      payload: 'CSRF token manipulation',
      color: 'yellow',
      icon: '🔄'
    },
    path_traversal: {
      name: 'Path Traversal',
      description: 'Test for directory traversal vulnerabilities',
      payload: '../../../etc/passwd',
      color: 'purple',
      icon: '📁'
    },
    command_injection: {
      name: 'Command Injection',
      description: 'Test for command injection vulnerabilities',
      payload: '; cat /etc/passwd',
      color: 'pink',
      icon: '⚡'
    },
    ldap_injection: {
      name: 'LDAP Injection',
      description: 'Test for LDAP injection vulnerabilities',
      payload: '*)(uid=*))(|(uid=*',
      color: 'blue',
      icon: '🔍'
    }
  };

  const runSecurityTest = async (testType) => {
    setActiveTest(testType);
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const attackType = attackTypes[testType];
      const result = {
        id: `test_${Date.now()}`,
        type: testType,
        name: attackType.name,
        payload: testInput || attackType.payload,
        timestamp: new Date().toISOString(),
        status: Math.random() > 0.3 ? 'blocked' : 'detected',
        severity: Math.random() > 0.5 ? 'high' : 'medium',
        details: `Security test "${attackType.name}" executed with payload: ${testInput || attackType.payload}`
      };
      
      setTestResults([result, ...testResults]);
      
      // Add to logs
      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: `${testType}_test`,
        ip: '127.0.0.1',
        userAgent: 'Security Lab Test Tool',
        details: result.details,
        severity: result.severity
      };
      
      setLogs([newLog, ...logs]);
      setSuccessMessage(`Security test "${attackType.name}" completed successfully!`);
      setTestInput('');
    } catch (err) {
      setError('Failed to run security test');
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults([]);
    setSuccessMessage('Security logs cleared successfully!');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'blocked': return '#10b981';
      case 'detected': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
            🛡️ Interactive Security Lab
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
            Learn about attacks and see our security system in action
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Refresh Logs
          </button>
          <button 
            onClick={clearLogs}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Backend Error Message */}
      {backendError && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.2)',
          border: '1px solid rgba(245, 158, 11, 0.5)',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#f59e0b',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '0.5rem', fontSize: '1.25rem' }}>⚠️</div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Backend Server Not Available
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                Please make sure the backend server is running on port 5000.
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Interactive Attack Lab */}
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
          Interactive Attack Lab
        </h2>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
          Test various security vulnerabilities and see how our system responds. These are safe, controlled tests.
        </p>

        {/* Test Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#e5e7eb',
            marginBottom: '0.5rem'
          }}>
            Custom Test Payload (Optional)
          </label>
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Enter custom payload or leave empty for default"
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

        {/* Attack Types */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {Object.entries(attackTypes).map(([key, attack]) => (
            <div
              key={key}
              style={{
                background: 'rgba(55, 65, 81, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{attack.icon}</span>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600' }}>
                  {attack.name}
                </h3>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {attack.description}
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  Default Payload:
                </div>
                <code style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  color: '#e5e7eb',
                  wordBreak: 'break-all'
                }}>
                  {attack.payload}
                </code>
              </div>
              <button
                onClick={() => runSecurityTest(key)}
                disabled={loading && activeTest === key}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: loading && activeTest === key 
                    ? 'rgba(107, 114, 128, 0.5)' 
                    : `linear-gradient(135deg, ${getSeverityColor('medium')} 0%, ${getSeverityColor('high')} 100%)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: loading && activeTest === key ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: loading && activeTest === key ? 0.5 : 1
                }}
              >
                {loading && activeTest === key ? 'Testing...' : `Test ${attack.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
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
            Test Results
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {testResults.slice(0, 5).map((result) => (
              <div
                key={result.id}
                style={{
                  background: 'rgba(55, 65, 81, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  border: '1px solid rgba(75, 85, 99, 0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{attackTypes[result.type]?.icon}</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>{result.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `rgba(${getStatusColor(result.status).replace('#', '')}, 0.2)`,
                      color: getStatusColor(result.status),
                      border: `1px solid rgba(${getStatusColor(result.status).replace('#', '')}, 0.3)`
                    }}>
                      {result.status}
                    </span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `rgba(${getSeverityColor(result.severity).replace('#', '')}, 0.2)`,
                      color: getSeverityColor(result.severity),
                      border: `1px solid rgba(${getSeverityColor(result.severity).replace('#', '')}, 0.3)`
                    }}>
                      {result.severity}
                    </span>
                  </div>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Payload: <code style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>
                    {result.payload}
                  </code>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                  {formatTimestamp(result.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Logs */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          Recent Security Logs
        </h2>
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
                  IP Address
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Severity
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)' }}>
                  <td style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#3b82f6',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>
                    {log.ip}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `rgba(${getSeverityColor(log.severity).replace('#', '')}, 0.2)`,
                      color: getSeverityColor(log.severity),
                      border: `1px solid rgba(${getSeverityColor(log.severity).replace('#', '')}, 0.3)`
                    }}>
                      {log.severity}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.875rem', maxWidth: '300px' }}>
                    <div style={{ wordBreak: 'break-word' }}>
                      {log.details}
                    </div>
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

export default SecurityLabPage;
