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
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const [analytics, setAnalytics] = useState({
    securityEvents: [],
    loginAttempts: [],
    logs: [],
    stats: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);


  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stats, securityEvents, loginAttempts, logsResponse] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getSecurityEvents({ count: 50 }),
        apiService.getLoginAttempts({ count: 50 }),
        apiService.getLogs({ limit: 20 })
      ]);
      
      setAnalytics({
        securityEvents,
        loginAttempts,
        logs: logsResponse.logs || [],
        stats
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics().finally(() => {
      setRefreshing(false);
    });
  };

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
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.eventsList}>
            {(() => {
              // Combine security events and logs, sort by timestamp
              const combinedActivity = [
                ...(analytics.securityEvents || []).slice(0, 3).map(event => ({
                  ...event,
                  activityType: 'security_event',
                  displayType: 'Security Event',
                  displayAction: event.type?.replace('_', ' ') || 'Security Event',
                  displaySource: event.source,
                  displayDetails: event.description,
                  severity: event.severity
                })),
                ...(analytics.logs || []).slice(0, 3).map(log => ({
                  ...log,
                  activityType: 'log',
                  displayType: 'System Log',
                  displayAction: log.action || 'System Action',
                  displaySource: log.ipAddress || 'Unknown',
                  displayDetails: log.details?.description || log.action || 'System activity',
                  severity: log.status === 'failure' ? 'medium' : 'low'
                }))
              ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 6);

              return combinedActivity.map((item, index) => (
                <View key={`${item.activityType}-${item.id || item._id || index}`} style={[
                  styles.eventCard, 
                  { backgroundColor: item.activityType === 'security_event' ? getSeverityBgColor(item.severity) : '#1F2937' }
                ]}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventInfo}>
                      <Text style={[
                        styles.eventType,
                        { color: item.activityType === 'security_event' ? '#FFFFFF' : '#F9FAFB' }
                      ]}>
                        {item.activityType === 'security_event' ? 'SECURITY EVENT' : 'SYSTEM LOG'}
                      </Text>
                      <Text style={[
                        styles.eventSource,
                        { color: item.activityType === 'security_event' ? '#F3F4F6' : '#D1D5DB' }
                      ]}>
                        {item.displaySource}
                      </Text>
                    </View>
                    <View style={[
                      styles.severityBadge, 
                      { 
                        backgroundColor: item.activityType === 'security_event' 
                          ? getSeverityColor(item.severity) 
                          : (item.severity === 'medium' ? '#F59E0B' : '#10B981')
                      }
                    ]}>
                      <Text style={styles.severityText}>
                        {item.activityType === 'security_event' ? item.severity.toUpperCase() : 'LOG'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.eventDescription,
                    { color: item.activityType === 'security_event' ? '#FFFFFF' : '#F9FAFB' }
                  ]}>
                    {item.displayDetails}
                  </Text>
                  <Text style={[
                    styles.eventTimestamp,
                    { color: item.activityType === 'security_event' ? '#F3F4F6' : '#D1D5DB' }
                  ]}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </View>
              ));
            })()}
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
});

export default AnalyticsScreen;