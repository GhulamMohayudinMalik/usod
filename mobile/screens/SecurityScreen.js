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
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const SecurityScreen = () => {
  const [securityStats, setSecurityStats] = useState({
    blockedIPs: 0,
    suspiciousIPs: 0,
    totalAttempts: 0,
    activeThreats: 0
  });
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newIP, setNewIP] = useState('');
  const [blockReason, setBlockReason] = useState('manual_block');
  const [permissionDenied, setPermissionDenied] = useState(false);


  useEffect(() => {
    loadData();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, blockedIPsResponse] = await Promise.all([
        apiService.getSecurityStats(),
        apiService.getBlockedIPs()
      ]);

      setSecurityStats(statsResponse.stats);
      setBlockedIPs(blockedIPsResponse.blockedIPs || []);
    } catch (error) {
      console.error('Error loading security data:', error);
      // Check for 403/permission denied
      if (error.message?.includes('403') || error.message?.includes('Insufficient permissions') || error.message?.includes('permission')) {
        setPermissionDenied(true);
      } else {
        setError('Failed to load security data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleBlockIP = async () => {
    if (!newIP.trim()) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiService.blockIP(newIP.trim(), blockReason);

      setSuccessMessage(`IP ${newIP} has been blocked successfully`);
      setNewIP('');

      // Refresh data to get updated stats and blocked IPs
      await loadData();
    } catch (error) {
      console.error('Error blocking IP:', error);
      setError(error.message || 'Failed to block IP address');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockIP = async (ip) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiService.unblockIP(ip);

      setSuccessMessage(`IP ${ip} has been unblocked successfully`);

      // Refresh data to get updated stats and blocked IPs
      await loadData();
    } catch (error) {
      console.error('Error unblocking IP:', error);
      setError(error.message || 'Failed to unblock IP address');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading security data...</Text>
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
          <View style={styles.headerContent}>
            <Text style={styles.title}>🛡️ Security Management</Text>
            <Text style={styles.subtitle}>
              {permissionDenied ? 'Access restricted to administrators only' : 'Monitor and manage security threats'}
            </Text>
          </View>
          {!permissionDenied && (
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Permission Denied Message */}
        {permissionDenied ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              You do not have permission to view security management. This feature is restricted to administrators.
            </Text>
          </View>
        ) : (
          <>
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

            {/* Security Statistics */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>🚫</Text>
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Blocked IPs</Text>
                  <Text style={styles.statNumber}>{securityStats.blockedIPs}</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>⚠️</Text>
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Suspicious IPs</Text>
                  <Text style={styles.statNumber}>{securityStats.suspiciousIPs}</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>📊</Text>
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Total Attempts</Text>
                  <Text style={styles.statNumber}>{securityStats.totalAttempts}</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>🛡️</Text>
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Active Threats</Text>
                  <Text style={styles.statNumber}>{securityStats.activeThreats}</Text>
                </View>
              </View>
            </View>

            {/* IP Management */}
            <View style={styles.ipManagementSection}>
              {/* Block IP Form */}
              <View style={styles.blockIPCard}>
                <Text style={styles.cardTitle}>Block IP Address</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>IP Address</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newIP}
                    onChangeText={setNewIP}
                    placeholder="192.168.1.100"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Reason</Text>
                  <View style={styles.reasonSelector}>
                    {[
                      { value: 'manual_block', label: 'Manual Block' },
                      { value: 'brute_force_attack', label: 'Brute Force Attack' },
                      { value: 'suspicious_activity', label: 'Suspicious Activity' },
                      { value: 'malicious_behavior', label: 'Malicious Behavior' },
                      { value: 'policy_violation', label: 'Policy Violation' }
                    ].map((reason) => (
                      <TouchableOpacity
                        key={reason.value}
                        style={[
                          styles.reasonOption,
                          blockReason === reason.value && styles.reasonOptionActive
                        ]}
                        onPress={() => setBlockReason(reason.value)}
                      >
                        <Text style={[
                          styles.reasonOptionText,
                          blockReason === reason.value && styles.reasonOptionTextActive
                        ]}>
                          {reason.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={styles.blockButton} onPress={handleBlockIP}>
                  <Text style={styles.blockButtonText}>Block IP Address</Text>
                </TouchableOpacity>
              </View>

              {/* Blocked IPs List */}
              <View style={styles.blockedIPsCard}>
                <Text style={styles.cardTitle}>Blocked IP Addresses</Text>
                {blockedIPs.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No IPs are currently blocked</Text>
                  </View>
                ) : (
                  <View style={styles.blockedIPsList}>
                    {blockedIPs.map((ip, index) => (
                      <View key={index} style={styles.blockedIPItem}>
                        <View style={styles.blockedIPHeader}>
                          <View style={styles.blockedIPInfo}>
                            <View style={styles.ipIndicator} />
                            <Text style={styles.blockedIPAddress}>{ip}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.unblockButton}
                            onPress={() => handleUnblockIP(ip)}
                          >
                            <Text style={styles.unblockButtonText}>Unblock</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Security Information */}
            <View style={styles.securityInfoSection}>
              <Text style={styles.sectionTitle}>Security Features</Text>
              <View style={styles.securityInfoGrid}>
                <View style={styles.securityInfoCard}>
                  <Text style={styles.securityInfoTitle}>Automatic Detection:</Text>
                  <View style={styles.securityInfoList}>
                    <Text style={styles.securityInfoItem}>• SQL Injection attempts</Text>
                    <Text style={styles.securityInfoItem}>• XSS attack patterns</Text>
                    <Text style={styles.securityInfoItem}>• CSRF token violations</Text>
                    <Text style={styles.securityInfoItem}>• Brute force attacks</Text>
                    <Text style={styles.securityInfoItem}>• Suspicious activity patterns</Text>
                  </View>
                </View>

                <View style={styles.securityInfoCard}>
                  <Text style={styles.securityInfoTitle}>Protection Measures:</Text>
                  <View style={styles.securityInfoList}>
                    <Text style={styles.securityInfoItem}>• Automatic IP blocking</Text>
                    <Text style={styles.securityInfoItem}>• Account lockout after failed attempts</Text>
                    <Text style={styles.securityInfoItem}>• Real-time threat monitoring</Text>
                    <Text style={styles.securityInfoItem}>• Comprehensive security logging</Text>
                    <Text style={styles.securityInfoItem}>• Manual IP management</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Security Status */}
            <View style={styles.securityStatusSection}>
              <Text style={styles.sectionTitle}>Security Status</Text>
              <View style={styles.statusList}>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.statusText}>Firewall Active</Text>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.statusText}>Intrusion Detection Enabled</Text>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.statusText}>Real-time Monitoring Active</Text>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusIndicator, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.statusText}>Security Updates Pending</Text>
                </View>
              </View>
            </View>
          </>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIconText: {
    fontSize: 20,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ipManagementSection: {
    marginBottom: 24,
  },
  blockIPCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  reasonSelector: {
    gap: 8,
  },
  reasonOption: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  reasonOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  reasonOptionText: {
    color: '#D1D5DB',
    fontSize: 14,
    textAlign: 'center',
  },
  reasonOptionTextActive: {
    color: '#FFFFFF',
  },
  blockButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  blockButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  blockedIPsCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
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
  blockedIPsList: {
    gap: 12,
  },
  blockedIPItem: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  blockedIPHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockedIPInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ipIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 12,
  },
  blockedIPAddress: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  unblockButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unblockButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  securityInfoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  securityInfoGrid: {
    gap: 16,
  },
  securityInfoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  securityInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 12,
  },
  securityInfoList: {
    gap: 8,
  },
  securityInfoItem: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  securityStatusSection: {
    marginBottom: 24,
  },
  statusList: {
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
});

export default SecurityScreen;