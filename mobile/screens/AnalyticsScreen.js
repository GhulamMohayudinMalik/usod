import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const [analytics, setAnalytics] = useState({
    securityEvents: [],
    loginAttempts: [],
    stats: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Dummy analytics data
  const dummySecurityEvents = [
    { id: 1, type: 'sql_injection', severity: 'high', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), source: '192.168.1.100', description: 'SQL injection attempt detected' },
    { id: 2, type: 'brute_force', severity: 'medium', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), source: '10.0.0.50', description: 'Brute force attack detected' },
    { id: 3, type: 'xss_attempt', severity: 'high', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), source: '172.16.0.25', description: 'XSS payload detected' },
    { id: 4, type: 'suspicious_activity', severity: 'medium', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), source: '203.0.113.1', description: 'Suspicious file upload' },
    { id: 5, type: 'csrf_attempt', severity: 'low', timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(), source: '198.51.100.5', description: 'CSRF token validation failed' },
    { id: 6, type: 'path_traversal', severity: 'high', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), source: '192.0.2.10', description: 'Path traversal attempt' },
    { id: 7, type: 'ldap_injection', severity: 'medium', timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(), source: '203.0.113.15', description: 'LDAP injection attempt' },
    { id: 8, type: 'command_injection', severity: 'critical', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), source: '198.51.100.20', description: 'Command injection attempt' },
    { id: 9, type: 'sql_injection', severity: 'high', timestamp: new Date(Date.now() - 1000 * 60 * 270).toISOString(), source: '192.168.1.150', description: 'SQL injection pattern detected' },
    { id: 10, type: 'brute_force', severity: 'medium', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), source: '10.0.0.75', description: 'Multiple failed login attempts' }
  ];

  const dummyLoginAttempts = [
    { id: 1, successful: true, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), ip: '192.168.1.100', username: 'admin' },
    { id: 2, successful: false, timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), ip: '203.0.113.1', username: 'hacker' },
    { id: 3, successful: true, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), ip: '10.0.0.50', username: 'user1' },
    { id: 4, successful: false, timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), ip: '198.51.100.5', username: 'test' },
    { id: 5, successful: true, timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), ip: '172.16.0.25', username: 'user2' },
    { id: 6, successful: false, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), ip: '192.0.2.10', username: 'admin' },
    { id: 7, successful: true, timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), ip: '203.0.113.15', username: 'user3' },
    { id: 8, successful: false, timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(), ip: '198.51.100.20', username: 'root' },
    { id: 9, successful: true, timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), ip: '192.168.1.200', username: 'admin' },
    { id: 10, successful: false, timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(), ip: '10.0.0.100', username: 'guest' }
  ];

  const dummyStats = {
    securityScore: 87,
    activeThreats: 3,
    protectedUsers: 1247
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setAnalytics({
          securityEvents: dummySecurityEvents,
          loginAttempts: dummyLoginAttempts,
          stats: dummyStats
        });
        setLastUpdated(new Date());
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load analytics data');
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchAnalytics();
      setRefreshing(false);
    }, 1500);
  };

  const calculateMetrics = () => {
    const { securityEvents, loginAttempts } = analytics;
    
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  const getSeverityBgColor = (severity) => {
    switch (severity) {
      case 'low': return 'rgba(16, 185, 129, 0.1)';
      case 'medium': return 'rgba(245, 158, 11, 0.1)';
      case 'high': return 'rgba(239, 68, 68, 0.1)';
      case 'critical': return 'rgba(124, 58, 237, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAnalytics}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.title}>Analytics Dashboard</Text>
          <Text style={styles.subtitle}>Security insights and performance metrics</Text>
          <View style={styles.headerActions}>
            {lastUpdated && (
              <Text style={styles.lastUpdated}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            )}
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{metrics.totalEvents}</Text>
            <Text style={styles.statLabel}>Total Security Events</Text>
            <Text style={styles.statSubtext}>Last 24h: {metrics.recentEvents}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{metrics.totalLogins}</Text>
            <Text style={styles.statLabel}>Login Attempts</Text>
            <Text style={styles.statSubtext}>Last 24h: {metrics.recentLogins}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>
              {metrics.loginSuccessRate.toFixed(1)}%
            </Text>
            <Text style={styles.statLabel}>Login Success Rate</Text>
            <Text style={styles.statSubtext}>Successful logins</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
              {analytics.stats?.securityScore || 0}%
            </Text>
            <Text style={styles.statLabel}>Security Score</Text>
            <Text style={styles.statSubtext}>Overall security posture</Text>
          </View>
        </View>
        
        {/* Charts Section */}
        <View style={styles.chartsSection}>
          {/* Security Events by Type */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Security Events by Type</Text>
            <View style={styles.chartContent}>
              {Object.entries(metrics.eventsByType).map(([type, count]) => (
                <View key={type} style={styles.chartItem}>
                  <View style={styles.chartItemHeader}>
                    <Text style={styles.chartItemLabel}>
                      {type.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.chartItemValue}>{count}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(count / metrics.totalEvents) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
          
          {/* Security Events by Severity */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Events by Severity</Text>
            <View style={styles.chartContent}>
              {Object.entries(metrics.eventsBySeverity).map(([severity, count]) => (
                <View key={severity} style={styles.chartItem}>
                  <View style={styles.chartItemHeader}>
                    <Text style={styles.chartItemLabel}>
                      {severity.toUpperCase()}
                    </Text>
                    <Text style={styles.chartItemValue}>{count}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${(count / metrics.totalEvents) * 100}%`,
                          backgroundColor: getSeverityColor(severity)
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        {/* Recent Activity */}
        <View style={styles.recentActivitySection}>
          <Text style={styles.sectionTitle}>Recent Security Events</Text>
          <View style={styles.eventsList}>
            {analytics.securityEvents.slice(0, 5).map((event) => (
              <View key={event.id} style={[styles.eventCard, { backgroundColor: getSeverityBgColor(event.severity) }]}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventType}>{event.type.replace('_', ' ').toUpperCase()}</Text>
                    <Text style={styles.eventSource}>{event.source}</Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(event.severity) }]}>
                    <Text style={styles.severityText}>{event.severity.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.eventDescription}>{event.description}</Text>
                <Text style={styles.eventTimestamp}>
                  {new Date(event.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Login Activity */}
        <View style={styles.loginActivitySection}>
          <Text style={styles.sectionTitle}>Recent Login Activity</Text>
          <View style={styles.loginList}>
            {analytics.loginAttempts.slice(0, 5).map((attempt) => (
              <View key={attempt.id} style={styles.loginCard}>
                <View style={styles.loginHeader}>
                  <View style={styles.loginInfo}>
                    <Text style={styles.loginUser}>{attempt.username}</Text>
                    <Text style={styles.loginIP}>{attempt.ip}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: attempt.successful ? '#10B981' : '#EF4444' }
                  ]}>
                    <Text style={styles.statusText}>
                      {attempt.successful ? 'SUCCESS' : 'FAILED'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.loginTimestamp}>
                  {new Date(attempt.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chartsSection: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chartContent: {
    gap: 12,
  },
  chartItem: {
    marginBottom: 8,
  },
  chartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartItemValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  recentActivitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventInfo: {
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventSource: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
    lineHeight: 20,
  },
  eventTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loginActivitySection: {
    marginBottom: 24,
  },
  loginList: {
    gap: 12,
  },
  loginCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  loginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  loginInfo: {
    flex: 1,
  },
  loginUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  loginIP: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loginTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default AnalyticsScreen;