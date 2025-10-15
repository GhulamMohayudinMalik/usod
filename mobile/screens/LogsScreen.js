import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

const LogsScreen = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Dummy logs data
  const dummyLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      action: 'login',
      userId: { username: 'admin' },
      ipAddress: '192.168.1.100',
      status: 'success',
      details: { description: 'Successful login attempt' }
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      action: 'sql_injection_attempt',
      userId: { username: 'unknown' },
      ipAddress: '203.0.113.1',
      status: 'detected',
      details: { description: 'SQL injection pattern detected in login form' }
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      action: 'logout',
      userId: { username: 'user1' },
      ipAddress: '10.0.0.50',
      status: 'success',
      details: { description: 'User logged out successfully' }
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      action: 'brute_force_detected',
      userId: { username: 'unknown' },
      ipAddress: '198.51.100.5',
      status: 'detected',
      details: { description: 'Multiple failed login attempts detected' }
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      action: 'password_change',
      userId: { username: 'admin' },
      ipAddress: '192.168.1.100',
      status: 'success',
      details: { description: 'Password changed successfully' }
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
      action: 'xss_attempt',
      userId: { username: 'unknown' },
      ipAddress: '172.16.0.25',
      status: 'detected',
      details: { description: 'XSS payload detected in user input' }
    },
    {
      id: 7,
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      action: 'profile_update',
      userId: { username: 'user2' },
      ipAddress: '10.0.0.75',
      status: 'success',
      details: { description: 'User profile updated' }
    },
    {
      id: 8,
      timestamp: new Date(Date.now() - 1000 * 60 * 105).toISOString(),
      action: 'access_denied',
      userId: { username: 'user3' },
      ipAddress: '192.168.1.200',
      status: 'failed',
      details: { description: 'Access denied to restricted resource' }
    },
    {
      id: 9,
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      action: 'session_created',
      userId: { username: 'admin' },
      ipAddress: '192.168.1.100',
      status: 'success',
      details: { description: 'New session created' }
    },
    {
      id: 10,
      timestamp: new Date(Date.now() - 1000 * 60 * 135).toISOString(),
      action: 'suspicious_activity',
      userId: { username: 'unknown' },
      ipAddress: '203.0.113.10',
      status: 'detected',
      details: { description: 'Suspicious file upload attempt' }
    },
    {
      id: 11,
      timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
      action: 'user_created',
      userId: { username: 'admin' },
      ipAddress: '192.168.1.100',
      status: 'success',
      details: { description: 'New user account created' }
    },
    {
      id: 12,
      timestamp: new Date(Date.now() - 1000 * 60 * 165).toISOString(),
      action: 'csrf_attempt',
      userId: { username: 'unknown' },
      ipAddress: '198.51.100.15',
      status: 'detected',
      details: { description: 'CSRF token validation failed' }
    },
    {
      id: 13,
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      action: 'backup_created',
      userId: { username: 'admin' },
      ipAddress: '192.168.1.100',
      status: 'success',
      details: { description: 'System backup created successfully' }
    },
    {
      id: 14,
      timestamp: new Date(Date.now() - 1000 * 60 * 195).toISOString(),
      action: 'ip_blocked',
      userId: { username: 'system' },
      ipAddress: '203.0.113.20',
      status: 'success',
      details: { description: 'IP address blocked due to suspicious activity' }
    },
    {
      id: 15,
      timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
      action: 'role_changed',
      userId: { username: 'admin' },
      ipAddress: '192.168.1.100',
      status: 'success',
      details: { description: 'User role changed from user to admin' }
    }
  ];

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.limit]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        let filteredLogs = [...dummyLogs];
        
        // Apply filters
        if (filters.action) {
          filteredLogs = filteredLogs.filter(log => log.action === filters.action);
        }
        
        // Apply pagination
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
        
        setLogs(paginatedLogs);
        setPagination(prev => ({
          ...prev,
          total: filteredLogs.length,
          totalPages: Math.ceil(filteredLogs.length / pagination.limit)
        }));
        setLastUpdated(new Date());
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load logs');
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchLogs();
      setRefreshing(false);
    }, 1500);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      action: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'failed': return '#EF4444';
      case 'detected': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'success': return 'rgba(16, 185, 129, 0.1)';
      case 'failed': return 'rgba(239, 68, 68, 0.1)';
      case 'detected': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'security_event', label: 'Security Event' },
    { value: 'password_change', label: 'Password Change' },
    { value: 'profile_update', label: 'Profile Update' },
    { value: 'access_denied', label: 'Access Denied' },
    { value: 'system_error', label: 'System Error' },
    { value: 'session_created', label: 'Session Created' },
    { value: 'session_expired', label: 'Session Expired' },
    { value: 'token_refresh', label: 'Token Refresh' },
    { value: 'account_locked', label: 'Account Locked' },
    { value: 'account_unlocked', label: 'Account Unlocked' },
    { value: 'user_created', label: 'User Created' },
    { value: 'user_deleted', label: 'User Deleted' },
    { value: 'role_changed', label: 'Role Changed' },
    { value: 'settings_changed', label: 'Settings Changed' },
    { value: 'backup_created', label: 'Backup Created' },
    { value: 'backup_restored', label: 'Backup Restored' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'brute_force_detected', label: 'Brute Force Detected' },
    { value: 'sql_injection_attempt', label: 'SQL Injection Attempt' },
    { value: 'xss_attempt', label: 'XSS Attempt' },
    { value: 'csrf_attempt', label: 'CSRF Attempt' },
    { value: 'ip_blocked', label: 'IP Blocked' },
    { value: 'ip_unblocked', label: 'IP Unblocked' }
  ];

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
          <Text style={styles.title}>Security Logs</Text>
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

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <TouchableOpacity 
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterToggleText}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Text>
          </TouchableOpacity>
          
          {showFilters && (
            <View style={styles.filtersContainer}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Action</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterOptions}>
                    {actionOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.filterOption,
                          filters.action === option.value && styles.filterOptionActive
                        ]}
                        onPress={() => setFilters({...filters, action: option.value})}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          filters.action === option.value && styles.filterOptionTextActive
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
              
              <View style={styles.filterActions}>
                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Logs List */}
        <View style={styles.logsSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading logs...</Text>
            </View>
          ) : logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No logs found matching the current filters.</Text>
            </View>
          ) : (
            <>
              {logs.map((log) => {
                const statusColor = getStatusColor(log.status);
                const statusBgColor = getStatusBgColor(log.status);
                
                return (
                  <View key={log.id} style={[styles.logCard, { backgroundColor: statusBgColor }]}>
                    <View style={styles.logHeader}>
                      <View style={styles.logInfo}>
                        <Text style={styles.logTime}>{formatTimestamp(log.timestamp)}</Text>
                        <Text style={styles.logUser}>
                          {log.userId?.username || 'Unknown'}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{log.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.logDetails}>
                      <Text style={styles.logAction}>{log.action.replace(/_/g, ' ').toUpperCase()}</Text>
                      <Text style={styles.logIP}>IP: {log.ipAddress || 'Unknown'}</Text>
                    </View>
                    
                    <Text style={styles.logDescription}>
                      {log.details?.description || 'Security event detected'}
                    </Text>
                    
                    <TouchableOpacity 
                      style={styles.detailsButton}
                      onPress={() => Alert.alert('Log Details', JSON.stringify(log.details || {}, null, 2))}
                    >
                      <Text style={styles.detailsButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <View style={styles.paginationContainer}>
                  <View style={styles.paginationInfo}>
                    <Text style={styles.paginationText}>
                      Showing {logs.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </Text>
                  </View>
                  
                  <View style={styles.paginationButtons}>
                    <TouchableOpacity
                      style={[styles.paginationButton, pagination.page === 1 && styles.paginationButtonDisabled]}
                      onPress={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <Text style={styles.paginationButtonText}>Previous</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.paginationButton, pagination.page === pagination.totalPages && styles.paginationButtonDisabled]}
                      onPress={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <Text style={styles.paginationButtonText}>Next</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
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
  filterSection: {
    marginBottom: 24,
  },
  filterToggle: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    marginBottom: 12,
  },
  filterToggleText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  filterOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterOptionText: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  resetButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  logsSection: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
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
  logCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  logUser: {
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
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logIP: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  logDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsButton: {
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationContainer: {
    marginTop: 20,
  },
  paginationInfo: {
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paginationButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
});

export default LogsScreen;