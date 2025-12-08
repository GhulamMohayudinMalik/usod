'use client';

import { useState, useEffect } from 'react';
import { getData, postData } from '@/services/api';

export default function SecurityLabPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState([]);

  // Fetch recent security logs
  const fetchSecurityLogs = async () => {
    try {
      setBackendError(false);
      // Get all logs and filter for security-related ones on the frontend
      const response = await getData('/api/logs?limit=100');
      const securityLogs = (response.logs || []).filter(log => 
        log.action.includes('sql_injection') ||
        log.action.includes('xss') ||
        log.action.includes('csrf') ||
        log.action.includes('brute_force') ||
        log.action.includes('suspicious') ||
        log.action.includes('ldap_injection') ||
        log.action.includes('nosql_injection') ||
        log.action.includes('command_injection') ||
        log.action.includes('path_traversal') ||
        log.action.includes('ssrf') ||
        log.action.includes('xxe') ||
        log.action.includes('information_disclosure') ||
        log.action.includes('ip_blocked') ||
        log.action.includes('ip_unblocked') ||
        log.action.includes('security_event')
      );
      setLogs(securityLogs);
    } catch (error) {
      console.error('Error fetching security logs:', error);
      setBackendError(true);
      setLogs([]); // Set empty array on error
    }
  };

  // Load logs on component mount
  useEffect(() => {
    fetchSecurityLogs();
    const interval = setInterval(fetchSecurityLogs, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Interactive test functions
  const executeAttack = async (attackType, payload) => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    const timestamp = new Date();
    
    try {
      let response;
      
      switch (attackType) {
        case 'sql_injection':
          response = await postData('/api/auth/login', {
            username: payload,
            password: 'test'
          });
          break;
          
        case 'xss':
          response = await postData('/api/auth/register', {
            username: payload,
            email: 'test@test.com',
            password: 'test123'
          });
          break;
          
        case 'brute_force':
          for (let i = 0; i < 5; i++) {
            try {
              await postData('/api/auth/login', {
                username: payload,
                password: 'wrongpassword'
              });
            } catch (error) {
              // Expected to fail
            }
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          break;
          
        case 'suspicious_activity':
          response = await postData('/api/auth/register', {
            username: payload,
            email: 'test@test.com',
            password: 'test123'
          });
          break;
          
        case 'csrf':
          // Simulate CSRF by sending request without proper headers
          response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: payload,
              password: 'test'
            })
          });
          break;
          
        case 'ldap_injection':
          response = await postData('/api/auth/login', {
            username: payload,
            password: 'test'
          });
          break;
          
        case 'nosql_injection':
          response = await postData('/api/auth/register', {
            username: payload,
            email: 'test@test.com',
            password: 'test123'
          });
          break;
          
        case 'command_injection':
          response = await postData('/api/auth/login', {
            username: payload,
            password: 'test'
          });
          break;
          
        case 'path_traversal':
          response = await postData('/api/auth/register', {
            username: payload,
            email: 'test@test.com',
            password: 'test123'
          });
          break;
          
        case 'ssrf':
          response = await postData('/api/auth/register', {
            username: payload,
            email: 'test@test.com',
            password: 'test123'
          });
          break;
          
        case 'xxe':
          response = await postData('/api/auth/register', {
            username: payload,
            email: 'test@test.com',
            password: 'test123'
          });
          break;
          
        case 'information_disclosure':
          response = await postData('/api/auth/login', {
            username: payload,
            password: 'test'
          });
          break;
      }
      
      setTestResults(prev => [...prev, {
        id: Date.now(),
        attackType,
        payload,
        timestamp,
        status: 'executed',
        response: response?.status || 'blocked'
      }]);
      
      setSuccessMessage(`Attack executed! Check the logs below to see if it was detected.`);
      
    } catch (error) {
      setError(`Attack was blocked: ${error.message}`);
      setTestResults(prev => [...prev, {
        id: Date.now(),
        attackType,
        payload,
        timestamp,
        status: 'blocked',
        error: error.message
      }]);
    }
    
    setLoading(false);
    fetchSecurityLogs(); // Refresh logs
  };

  const clearLogs = async () => {
    try {
      await postData('/api/logs/clear', {});
      setLogs([]);
      setTestResults([]);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-yellow-400 bg-yellow-900/30 border border-yellow-500/30';
      case 'completed': return 'text-green-400 bg-green-900/30 border border-green-500/30';
      case 'error': return 'text-red-400 bg-red-900/30 border border-red-500/30';
      default: return 'text-gray-400 bg-gray-700/30 border border-gray-500/30';
    }
  };

  const getLogTypeColor = (action) => {
    const securityActions = [
      'sql_injection_attempt', 'xss_attempt', 'csrf_attempt', 
      'brute_force_detected', 'suspicious_activity', 'ip_blocked', 'ip_unblocked',
      'ldap_injection_attempt', 'nosql_injection_attempt', 'command_injection_attempt',
      'path_traversal_attempt', 'ssrf_attempt', 'xxe_attempt', 'information_disclosure_attempt'
    ];
    
    if (securityActions.includes(action)) {
      return 'text-red-400 bg-red-900/30 border border-red-500/30';
    } else if (action.includes('login') || action.includes('logout')) {
      return 'text-blue-400 bg-blue-900/30 border border-blue-500/30';
    } else if (action.includes('user_') || action.includes('role_')) {
      return 'text-purple-400 bg-purple-900/30 border border-purple-500/30';
    } else {
      return 'text-gray-400 bg-gray-700/30 border border-gray-500/30';
    }
  };

  // Get consistent attack button styling
  const getAttackButtonStyle = (attackKey, isActive) => {
    const baseStyle = 'p-4 border-2 rounded-lg transition-all text-left';
    if (isActive) {
      return `${baseStyle} border-emerald-500 bg-emerald-900/20`;
    }
    return `${baseStyle} border-gray-600 bg-gray-800/50 hover:border-gray-500`;
  };

  // Attack definitions with examples
  const attackTypes = {
    sql_injection: {
      name: 'SQL Injection',
      description: 'Attempts to manipulate database queries through malicious input',
      examples: [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "UNION SELECT * FROM users",
        "admin'--"
      ],
      color: 'red',
      icon: '🗄️'
    },
    xss: {
      name: 'Cross-Site Scripting (XSS)',
      description: 'Injects malicious scripts into web pages viewed by other users',
      examples: [
        "<script>alert('XSS')</script>",
        "javascript:alert('XSS')",
        "<img src=x onerror=alert('XSS')>",
        "<iframe src='javascript:alert(1)'></iframe>"
      ],
      color: 'orange',
      icon: '🎯'
    },
    brute_force: {
      name: 'Brute Force Attack',
      description: 'Attempts to gain access by trying many password combinations',
      examples: [
        'admin',
        'testuser',
        'hacker',
        'root'
      ],
      color: 'yellow',
      icon: '🔨'
    },
    suspicious_activity: {
      name: 'Suspicious Activity',
      description: 'Detects potentially malicious patterns in user input',
      examples: [
        "../../../etc/passwd",
        "admin",
        "administrator",
        "debug"
      ],
      color: 'purple',
      icon: '⚠️'
    },
    csrf: {
      name: 'Cross-Site Request Forgery (CSRF)',
      description: 'Forces users to execute unwanted actions on web applications',
      examples: [
        'test',
        'admin',
        'user',
        'hacker'
      ],
      color: 'indigo',
      icon: '🔒'
    },
    ldap_injection: {
      name: 'LDAP Injection',
      description: 'Attempts to manipulate LDAP queries to access unauthorized data',
      examples: [
        "*)(uid=*",
        "*)(|(uid=*",
        "*)(&(uid=*",
        "*)(|(objectClass=*"
      ],
      color: 'blue',
      icon: '📁'
    },
    nosql_injection: {
      name: 'NoSQL Injection',
      description: 'Attempts to manipulate NoSQL database queries',
      examples: [
        '{"$ne": null}',
        '{"$gt": ""}',
        '{"$where": "this.username"}',
        '{"$regex": ".*"}'
      ],
      color: 'green',
      icon: '🍃'
    },
    command_injection: {
      name: 'Command Injection',
      description: 'Attempts to execute system commands through application input',
      examples: [
        '; ls -la',
        '| cat /etc/passwd',
        '&& whoami',
        '`id`'
      ],
      color: 'red',
      icon: '💻'
    },
    path_traversal: {
      name: 'Path Traversal',
      description: 'Attempts to access files outside the intended directory',
      examples: [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
      ],
      color: 'pink',
      icon: '📂'
    },
    ssrf: {
      name: 'Server-Side Request Forgery (SSRF)',
      description: 'Attempts to make the server perform requests to internal resources',
      examples: [
        'http://localhost:22',
        'http://127.0.0.1:3306',
        'http://169.254.169.254/latest/meta-data',
        'file:///etc/passwd'
      ],
      color: 'teal',
      icon: '🌐'
    },
    xxe: {
      name: 'XML External Entity (XXE)',
      description: 'Attempts to exploit XML parsers to access local files or perform SSRF',
      examples: [
        '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
        '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://localhost:22">]>',
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
        '<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "file:///etc/passwd">]>'
      ],
      color: 'cyan',
      icon: '📄'
    },
    information_disclosure: {
      name: 'Information Disclosure',
      description: 'Attempts to gather sensitive system information or configuration details',
      examples: [
        'version',
        'debug',
        'test',
        'localhost',
        'internal',
        'secret',
        'password',
        'api_key'
      ],
      color: 'gray',
      icon: '🔍'
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">🛡️ Interactive Security Lab</h1>
          <p className="text-gray-600 dark:text-gray-400">Learn about attacks and see our security system in action</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={fetchSecurityLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Logs
          </button>
          <button 
            onClick={clearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Backend Error Message */}
      {backendError && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Backend Server Not Available</strong>
              <p className="text-sm mt-1">
                Please make sure the backend server is running on port 5000. 
                <br />
                Run: <code className="bg-yellow-200 px-1 rounded">cd backend && node src/server.js</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Attack Lab */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎯 Choose an Attack to Test</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Click on any attack type to learn about it and test our security system</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(attackTypes).map(([key, attack]) => (
            <button
              key={key}
              onClick={() => setActiveTest(activeTest === key ? null : key)}
              className={getAttackButtonStyle(key, activeTest === key)}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{attack.icon}</span>
                <h4 className="font-semibold text-gray-100">
                  {attack.name}
                </h4>
              </div>
              <p className="text-sm text-gray-400">
                {attack.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Attack Details and Testing */}
      {activeTest && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {attackTypes[activeTest].icon} {attackTypes[activeTest].name}
            </h3>
            <button
              onClick={() => setActiveTest(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {attackTypes[activeTest].description}
          </p>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Example Payloads:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {attackTypes[activeTest].examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setTestInput(example)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-left text-sm font-mono hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter your own payload or click an example above"
              className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => executeAttack(activeTest, testInput)}
              disabled={!testInput || loading}
              className={`px-6 py-3 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                attackTypes[activeTest].color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                attackTypes[activeTest].color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                attackTypes[activeTest].color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                attackTypes[activeTest].color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                attackTypes[activeTest].color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' :
                attackTypes[activeTest].color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                attackTypes[activeTest].color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                attackTypes[activeTest].color === 'pink' ? 'bg-pink-600 hover:bg-pink-700' :
                attackTypes[activeTest].color === 'teal' ? 'bg-teal-600 hover:bg-teal-700' :
                attackTypes[activeTest].color === 'cyan' ? 'bg-cyan-600 hover:bg-cyan-700' :
                attackTypes[activeTest].color === 'gray' ? 'bg-gray-600 hover:bg-gray-700' :
                'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {loading ? 'Testing...' : '🚀 Execute Attack'}
            </button>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Test Results</h3>
          <div className="space-y-3">
            {testResults.slice(-5).reverse().map((result) => (
              <div key={result.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      result.status === 'blocked' ? 'text-red-400 bg-red-900/30 border-red-500/30' : 'text-green-400 bg-green-900/30 border-green-500/30'
                    }`}>
                      {result.status === 'blocked' ? '🚫 BLOCKED' : '✅ EXECUTED'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {attackTypes[result.attackType]?.icon} {attackTypes[result.attackType]?.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded font-mono text-sm">
                  {result.payload}
                </div>
                {result.error && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Security Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Security Logs</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Real-time security event monitoring</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No security logs found. Run some tests to see them here!
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogTypeColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        log.status === 'detected' ? 'text-red-400 bg-red-900/30 border-red-500/30' :
                        log.status === 'success' ? 'text-green-400 bg-green-900/30 border-green-500/30' :
                        'text-yellow-400 bg-yellow-900/30 border-yellow-500/30'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {log.details?.description || log.details?.reason || 'Security event detected'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
