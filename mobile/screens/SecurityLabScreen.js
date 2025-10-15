import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  RefreshControl,
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

const SecurityLabScreen = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState([]);

  // Dummy security logs
  const dummyLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      action: 'sql_injection_attempt',
      status: 'detected',
      ipAddress: '192.168.1.100',
      details: { description: 'SQL injection pattern detected in login form' }
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      action: 'brute_force_detected',
      status: 'detected',
      ipAddress: '10.0.0.50',
      details: { description: 'Multiple failed login attempts detected' }
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      action: 'xss_attempt',
      status: 'detected',
      ipAddress: '172.16.0.25',
      details: { description: 'XSS payload detected in user input' }
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      action: 'suspicious_activity',
      status: 'detected',
      ipAddress: '203.0.113.1',
      details: { description: 'Suspicious file upload attempt' }
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      action: 'csrf_attempt',
      status: 'detected',
      ipAddress: '198.51.100.5',
      details: { description: 'CSRF token validation failed' }
    }
  ];

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  const fetchSecurityLogs = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setLogs(dummyLogs);
      }, 1000);
    } catch (error) {
      console.error('Error fetching security logs:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchSecurityLogs();
      setRefreshing(false);
    }, 1500);
  };

  const executeAttack = async (attackType, payload) => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    const timestamp = new Date();
    
    try {
      // Simulate attack execution
      setTimeout(() => {
        const result = {
          id: Date.now(),
          attackType,
          payload,
          timestamp,
          status: Math.random() > 0.3 ? 'blocked' : 'executed',
          response: Math.random() > 0.3 ? 'blocked' : 'success'
        };
        
        setTestResults(prev => [result, ...prev.slice(0, 4)]);
        setSuccessMessage(`Attack executed! Check the logs below to see if it was detected.`);
        setLoading(false);
        fetchSecurityLogs(); // Refresh logs
      }, 2000);
    } catch (error) {
      setError(`Attack was blocked: ${error.message}`);
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      setLogs([]);
      setTestResults([]);
      setSuccessMessage('Logs cleared successfully');
    } catch (error) {
      console.error('Error clearing logs:', error);
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
      return '#EF4444';
    } else if (action.includes('login') || action.includes('logout')) {
      return '#3B82F6';
    } else if (action.includes('user_') || action.includes('role_')) {
      return '#8B5CF6';
    } else {
      return '#6B7280';
    }
  };

  const getLogTypeBgColor = (action) => {
    const securityActions = [
      'sql_injection_attempt', 'xss_attempt', 'csrf_attempt', 
      'brute_force_detected', 'suspicious_activity', 'ip_blocked', 'ip_unblocked',
      'ldap_injection_attempt', 'nosql_injection_attempt', 'command_injection_attempt',
      'path_traversal_attempt', 'ssrf_attempt', 'xxe_attempt', 'information_disclosure_attempt'
    ];
    
    if (securityActions.includes(action)) {
      return 'rgba(239, 68, 68, 0.1)';
    } else if (action.includes('login') || action.includes('logout')) {
      return 'rgba(59, 130, 246, 0.1)';
    } else if (action.includes('user_') || action.includes('role_')) {
      return 'rgba(139, 92, 246, 0.1)';
    } else {
      return 'rgba(107, 114, 128, 0.1)';
    }
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
      color: '#EF4444',
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
      color: '#F59E0B',
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
      color: '#F59E0B',
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
      color: '#8B5CF6',
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
      color: '#3B82F6',
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
      color: '#3B82F6',
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
      color: '#10B981',
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
      color: '#EF4444',
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
      color: '#EC4899',
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
      color: '#06B6D4',
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
      color: '#06B6D4',
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
      color: '#6B7280',
      icon: '🔍'
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🛡️ Interactive Security Lab</Text>
          <Text style={styles.subtitle}>Learn about attacks and see our security system in action</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>🔄 Refresh Logs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
              <Text style={styles.clearButtonText}>🗑️ Clear Logs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        {successMessage ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Interactive Attack Lab */}
        <View style={styles.attackLabSection}>
          <Text style={styles.sectionTitle}>🎯 Choose an Attack to Test</Text>
          <Text style={styles.sectionDescription}>
            Click on any attack type to learn about it and test our security system
          </Text>
          
          <View style={styles.attackTypesGrid}>
            {Object.entries(attackTypes).map(([key, attack]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.attackTypeCard,
                  { borderColor: attack.color },
                  activeTest === key && { backgroundColor: `${attack.color}20` }
                ]}
                onPress={() => setActiveTest(activeTest === key ? null : key)}
              >
                <View style={styles.attackTypeHeader}>
                  <Text style={styles.attackIcon}>{attack.icon}</Text>
                  <Text style={[styles.attackName, { color: attack.color }]}>
                    {attack.name}
                  </Text>
                </View>
                <Text style={styles.attackDescription}>
                  {attack.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Attack Details and Testing */}
        {activeTest && (
          <View style={styles.attackDetailsSection}>
            <View style={styles.attackDetailsHeader}>
              <Text style={styles.attackDetailsTitle}>
                {attackTypes[activeTest].icon} {attackTypes[activeTest].name}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setActiveTest(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.attackDetailsDescription}>
              {attackTypes[activeTest].description}
            </Text>
            
            <View style={styles.examplesSection}>
              <Text style={styles.examplesTitle}>Example Payloads:</Text>
              <View style={styles.examplesGrid}>
                {attackTypes[activeTest].examples.map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exampleButton}
                    onPress={() => setTestInput(example)}
                  >
                    <Text style={styles.exampleText}>{example}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.testInputSection}>
              <TextInput
                style={styles.testInput}
                value={testInput}
                onChangeText={setTestInput}
                placeholder="Enter your own payload or click an example above"
                placeholderTextColor="#9CA3AF"
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.executeButton,
                  { backgroundColor: attackTypes[activeTest].color },
                  (!testInput || loading) && styles.executeButtonDisabled
                ]}
                onPress={() => executeAttack(activeTest, testInput)}
                disabled={!testInput || loading}
              >
                <Text style={styles.executeButtonText}>
                  {loading ? 'Testing...' : '🚀 Execute Attack'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <View style={styles.testResultsSection}>
            <Text style={styles.sectionTitle}>Recent Test Results</Text>
            <View style={styles.testResultsList}>
              {testResults.map((result) => (
                <View key={result.id} style={styles.testResultCard}>
                  <View style={styles.testResultHeader}>
                    <View style={styles.testResultInfo}>
                      <Text style={[
                        styles.testResultStatus,
                        { color: result.status === 'blocked' ? '#EF4444' : '#10B981' }
                      ]}>
                        {result.status === 'blocked' ? '🚫 BLOCKED' : '✅ EXECUTED'}
                      </Text>
                      <Text style={styles.testResultAttack}>
                        {attackTypes[result.attackType]?.icon} {attackTypes[result.attackType]?.name}
                      </Text>
                    </View>
                    <Text style={styles.testResultTime}>
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={styles.testResultPayload}>
                    <Text style={styles.testResultPayloadText}>{result.payload}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Live Security Logs */}
        <View style={styles.logsSection}>
          <Text style={styles.sectionTitle}>Live Security Logs</Text>
          <Text style={styles.sectionDescription}>Real-time security event monitoring</Text>
          
          <View style={styles.logsList}>
            {logs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No security logs found. Run some tests to see them here!</Text>
              </View>
            ) : (
              logs.map((log) => (
                <View key={log.id} style={[styles.logCard, { backgroundColor: getLogTypeBgColor(log.action) }]}>
                  <View style={styles.logHeader}>
                    <View style={styles.logInfo}>
                      <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</Text>
                      <Text style={styles.logIP}>{log.ipAddress}</Text>
                    </View>
                    <View style={[styles.logTypeBadge, { backgroundColor: getLogTypeColor(log.action) }]}>
                      <Text style={styles.logTypeText}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.logStatus}>
                    <Text style={[
                      styles.logStatusText,
                      { color: log.status === 'detected' ? '#EF4444' : '#10B981' }
                    ]}>
                      {log.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.logDescription}>
                    {log.details?.description || 'Security event detected'}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  refreshButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  clearButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  attackLabSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  attackTypesGrid: {
    gap: 12,
  },
  attackTypeCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  attackTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attackIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  attackName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attackDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  attackDetailsSection: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  attackDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  attackDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  attackDetailsDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 20,
  },
  examplesSection: {
    marginBottom: 16,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  examplesGrid: {
    gap: 8,
  },
  exampleButton: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  exampleText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  testInputSection: {
    gap: 12,
  },
  testInput: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  executeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  executeButtonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.5,
  },
  executeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  testResultsSection: {
    marginBottom: 24,
  },
  testResultsList: {
    gap: 12,
  },
  testResultCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  testResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  testResultInfo: {
    flex: 1,
  },
  testResultStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  testResultAttack: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  testResultTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  testResultPayload: {
    backgroundColor: '#374151',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  testResultPayloadText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  logsSection: {
    marginBottom: 24,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  logsList: {
    gap: 12,
  },
  logCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logInfo: {
    flex: 1,
  },
  logTime: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  logIP: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  logTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  logTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logStatus: {
    marginBottom: 8,
  },
  logStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
});

export default SecurityLabScreen;