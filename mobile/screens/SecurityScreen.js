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
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [newIP, setNewIP] = useState('');
  const [blockReason, setBlockReason] = useState('manual_block');

  // Dummy security data
  const dummyBlockedIPs = [
    { ip: '203.0.113.1', reason: 'brute_force_attack', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { ip: '198.51.100.5', reason: 'sql_injection_attempt', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { ip: '192.0.2.10', reason: 'suspicious_activity', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    { ip: '172.16.0.25', reason: 'xss_attempt', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    { ip: '10.0.0.50', reason: 'malicious_behavior', timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString() }
  ];

  const dummyStats = {
    blockedIPs: 5,
    suspiciousIPs: 12,
    totalAttempts: 247,
    activeThreats: 3
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      setTimeout(() => {
        setSecurityStats(dummyStats);
        setBlockedIPs(dummyBlockedIPs);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError('Failed to load security data');
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
      setRefreshing(false);
    }, 1500);
  };

  const handleBlockIP = async () => {
    if (!newIP.trim()) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }

    try {
      // Simulate API call
      setTimeout(() => {
        const newBlockedIP = {
          ip: newIP.trim(),
          reason: blockReason,
          timestamp: new Date().toISOString()
        };
        
        setBlockedIPs([newBlockedIP, ...blockedIPs]);
        setSecurityStats(prev => ({
          ...prev,
          blockedIPs: prev.blockedIPs + 1
        }));
        setSuccessMessage(`IP ${newIP} has been blocked successfully`);
        setNewIP('');
        setError(null);
      }, 1000);
    } catch (error) {
      setError('Failed to block IP address');
    }
  };

  const handleUnblockIP = async (ip) => {
    try {
      // Simulate API call
      setTimeout(() => {
        setBlockedIPs(blockedIPs.filter(blockedIP => blockedIP.ip !== ip));
        setSecurityStats(prev => ({
          ...prev,
          blockedIPs: prev.blockedIPs - 1
        }));
        setSuccessMessage(`IP ${ip} has been unblocked successfully`);
        setError(null);
      }, 1000);
    } catch (error) {
      setError('Failed to unblock IP address');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getReasonColor = (reason) => {
    switch (reason) {
      case 'brute_force_attack': return '#EF4444';
      case 'sql_injection_attempt': return '#F59E0B';
      case 'xss_attempt': return '#8B5CF6';
      case 'suspicious_activity': return '#3B82F6';
      case 'malicious_behavior': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getReasonBgColor = (reason) => {
    switch (reason) {
      case 'brute_force_attack': return 'rgba(239, 68, 68, 0.1)';
      case 'sql_injection_attempt': return 'rgba(245, 158, 11, 0.1)';
      case 'xss_attempt': return 'rgba(139, 92, 246, 0.1)';
      case 'suspicious_activity': return 'rgba(59, 130, 246, 0.1)';
      case 'malicious_behavior': return 'rgba(220, 38, 38, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
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
            <Text style={styles.subtitle}>Monitor and manage security threats</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
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
                {blockedIPs.map((blockedIP, index) => (
                  <View key={index} style={[styles.blockedIPItem, { backgroundColor: getReasonBgColor(blockedIP.reason) }]}>
                    <View style={styles.blockedIPHeader}>
                      <View style={styles.blockedIPInfo}>
                        <Text style={styles.blockedIPAddress}>{blockedIP.ip}</Text>
                        <Text style={styles.blockedIPReason}>
                          {blockedIP.reason.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                      </View>
                      <View style={[styles.reasonBadge, { backgroundColor: getReasonColor(blockedIP.reason) }]}>
                        <Text style={styles.reasonBadgeText}>
                          {blockedIP.reason.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.blockedIPTimestamp}>
                      Blocked: {formatTimestamp(blockedIP.timestamp)}
                    </Text>
                    <TouchableOpacity
                      style={styles.unblockButton}
                      onPress={() => handleUnblockIP(blockedIP.ip)}
                    >
                      <Text style={styles.unblockButtonText}>Unblock</Text>
                    </TouchableOpacity>
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
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  blockedIPHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  blockedIPInfo: {
    flex: 1,
  },
  blockedIPAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  blockedIPReason: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reasonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reasonBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  blockedIPTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  unblockButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
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