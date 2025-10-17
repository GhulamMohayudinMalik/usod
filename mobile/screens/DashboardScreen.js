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

const DashboardScreen = ({ user }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    securityScore: 0,
    activeThreats: 0,
    protectedUsers: 0,
    recentEvents: 0
  });
  const [recentThreats, setRecentThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setError(null);
      // Fetch dashboard stats
      const statsData = await apiService.getDashboardStats();
      setStats(statsData);

      // Fetch recent security events
      const eventsData = await apiService.getSecurityEvents();
      setRecentThreats(eventsData.slice(0, 3)); // Show only recent 3 events
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getSeverityBgColor = (severity) => {
    switch (severity) {
      case 'critical': return 'rgba(239, 68, 68, 0.1)';
      case 'high': return 'rgba(245, 158, 11, 0.1)';
      case 'medium': return 'rgba(59, 130, 246, 0.1)';
      case 'low': return 'rgba(16, 185, 129, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
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
          <Text style={styles.welcomeText}>Welcome back, {user?.username || 'User'}!</Text>
          <Text style={styles.subtitleText}>Security Dashboard Overview</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.securityScore}%</Text>
            <Text style={styles.statLabel}>Security Score</Text>
            <Text style={styles.statChange}>Overall security posture</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.activeThreats}</Text>
            <Text style={styles.statLabel}>Active Threats</Text>
            <Text style={styles.statChange}>Threats requiring attention</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{stats.protectedUsers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Protected Users</Text>
            <Text style={styles.statChange}>Users with security policies</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{recentThreats.length}</Text>
            <Text style={styles.statLabel}>Recent Events</Text>
            <Text style={styles.statChange}>Latest security events</Text>
          </View>
        </View>
        
        {/* Recent Threats Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Threats</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentThreats.length > 0 ? (
            recentThreats.map((threat) => (
              <View key={threat.id} style={[styles.threatCard, { backgroundColor: getSeverityBgColor(threat.severity) }]}>
                <View style={styles.threatHeader}>
                  <View style={styles.threatInfo}>
                    <Text style={styles.threatType}>{threat.type || 'Security Event'}</Text>
                    <Text style={styles.threatSource}>Source: {threat.source || 'Unknown'}</Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(threat.severity) }]}>
                    <Text style={styles.severityText}>{threat.severity?.toUpperCase() || 'MEDIUM'}</Text>
                  </View>
                </View>
                <Text style={styles.threatDescription}>{threat.description || 'Security event detected'}</Text>
                <Text style={styles.threatTimestamp}>{new Date(threat.timestamp).toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent threats detected</Text>
            </View>
          )}
        </View>

        {/* AI Analysis Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-Powered Threat Analysis</Text>
          <View style={styles.aiCard}>
            <Text style={styles.aiDescription}>
              Analyze text or network traffic for potential security threats using advanced AI detection.
            </Text>
            <TouchableOpacity style={styles.analyzeButton}>
              <Text style={styles.analyzeButtonText}>Run Analysis</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statusText}>All Systems Operational</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statusText}>Monitoring Active</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statusText}>Backup Complete</Text>
            </View>
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
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  refreshButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  threatCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  threatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  threatInfo: {
    flex: 1,
  },
  threatType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  threatSource: {
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
  threatDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
    lineHeight: 20,
  },
  threatTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  aiCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  aiDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 20,
  },
  analyzeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
});

export default DashboardScreen;