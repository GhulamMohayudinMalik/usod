import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const BlockchainLedgerScreen = () => {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedThreat, setExpandedThreat] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch statistics
      const statsResult = await apiService.getBlockchainStatistics();
      if (statsResult.success !== false) {
        setStats(statsResult);
      }

      // Fetch threats
      const threatsResult = await apiService.getBlockchainThreats();
      if (threatsResult.success !== false && Array.isArray(threatsResult)) {
        setThreats(threatsResult);
      } else if (threatsResult.threats && Array.isArray(threatsResult.threats)) {
        setThreats(threatsResult.threats);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
      setError(err.message || 'Failed to load blockchain data');
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  };

  const verifyThreat = async (logId) => {
    setVerifying(true);
    setVerification(null);
    try {
      const result = await apiService.verifyBlockchainThreat(logId);
      setVerification(result);
    } catch (err) {
      setVerification({ error: err.message || 'Verification failed' });
    }
    setVerifying(false);
  };

  const getThreatHistory = async (logId) => {
    try {
      const history = await apiService.getBlockchainThreatHistory(logId);
      const threat = threats.find(t => t.logId === logId);
      setExpandedThreat({ ...threat, history });
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading blockchain data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
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
          <Text style={styles.title}>🔗 Blockchain Ledger</Text>
          <Text style={styles.subtitle}>Immutable threat logging with cryptographic verification</Text>
          <View style={styles.headerActions}>
            <View style={styles.connectedBadge}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          </View>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningEmoji}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Demo Mode</Text>
            <Text style={styles.warningText}>Using mock blockchain for demonstration. Production would use Hyperledger Fabric.</Text>
          </View>
        </View>

        {/* Statistics Cards */}
        {stats && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(30, 58, 138, 0.4)' }]}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Total Logs</Text>
                <Text style={styles.statEmoji}>📝</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalLogs || 0}</Text>
              <Text style={styles.statSubtext}>On blockchain</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: 'rgba(88, 28, 135, 0.4)' }]}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Transactions</Text>
                <Text style={styles.statEmoji}>⛓️</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalTransactions || 0}</Text>
              <Text style={styles.statSubtext}>Total count</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: 'rgba(6, 95, 70, 0.4)' }]}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Block Height</Text>
                <Text style={styles.statEmoji}>📊</Text>
              </View>
              <Text style={styles.statValue}>{stats.blockHeight || 0}</Text>
              <Text style={styles.statSubtext}>Current height</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: 'rgba(124, 45, 18, 0.4)' }]}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Ledger Size</Text>
                <Text style={styles.statEmoji}>💾</Text>
              </View>
              <Text style={styles.statValue}>{stats.ledgerSize || 0}</Text>
              <Text style={styles.statSubtext}>Active entries</Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>📋 Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'threats' && styles.tabActive]}
              onPress={() => setActiveTab('threats')}
            >
              <Text style={[styles.tabText, activeTab === 'threats' && styles.tabTextActive]}>🔍 Threat Logs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'verify' && styles.tabActive]}
              onPress={() => setActiveTab('verify')}
            >
              <Text style={[styles.tabText, activeTab === 'verify' && styles.tabTextActive]}>✅ Verification</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <View>
                <Text style={styles.sectionTitle}>Threat Distribution</Text>
                <View style={styles.threatDistGrid}>
                  {Object.entries(stats.threatsByType || {}).map(([type, count]) => (
                    <View key={type} style={styles.threatDistCard}>
                      <Text style={styles.threatDistLabel}>{type.replace('_', ' ').toUpperCase()}</Text>
                      <Text style={styles.threatDistValue}>{count}</Text>
                    </View>
                  ))}
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Activity</Text>
                {stats.recentActivity && stats.recentActivity.slice(0, 10).map((activity, idx) => (
                  <View key={idx} style={styles.activityItem}>
                    <View style={styles.activityLeft}>
                      <Text style={styles.activityEmoji}>
                        {activity.type === 'CREATE' ? '➕' : activity.type === 'UPDATE' ? '✏️' : '🗑️'}
                      </Text>
                      <View>
                        <Text style={styles.activityType}>{activity.type}</Text>
                        <Text style={styles.activityBlock}>Block #{activity.blockNumber}</Text>
                      </View>
                    </View>
                    <View style={styles.activityRight}>
                      <Text style={styles.activityLogId} numberOfLines={1}>{activity.logId}</Text>
                      <Text style={styles.activityTimestamp}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Threats Tab */}
            {activeTab === 'threats' && (
              <View>
                <View style={styles.threatsHeader}>
                  <Text style={styles.sectionTitle}>Blockchain Threat Logs ({threats.length})</Text>
                </View>

                {threats.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>📝</Text>
                    <Text style={styles.emptyText}>No threats logged to blockchain yet</Text>
                  </View>
                ) : (
                  threats.map((threat) => (
                    <View key={threat.logId} style={styles.threatCard}>
                      <View style={styles.threatHeader}>
                        <View style={styles.threatHeaderLeft}>
                          <Text style={styles.threatEmoji}>
                            {threat.logType === 'security_event' ? '🔐' : '⚠️'}
                          </Text>
                          <View style={styles.threatInfo}>
                            <Text style={styles.threatId} numberOfLines={1}>{threat.logId}</Text>
                            <Text style={styles.threatType}>{threat.logType}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.threatDetails}>
                        <View style={styles.threatDetail}>
                          <Text style={styles.threatDetailLabel}>Detection:</Text>
                          <Text style={styles.threatDetailValue}>{threat.detectionMethod}</Text>
                        </View>
                        <View style={styles.threatDetail}>
                          <Text style={styles.threatDetailLabel}>Hash:</Text>
                          <Text style={styles.threatHash} numberOfLines={1}>
                            {threat.hash ? threat.hash.substring(0, 24) + '...' : 'N/A'}
                          </Text>
                        </View>
                        <Text style={styles.threatTimestamp}>
                          {new Date(threat.timestamp).toLocaleString()}
                        </Text>
                      </View>

                      <View style={styles.threatActions}>
                        <TouchableOpacity
                          style={styles.historyButton}
                          onPress={() => getThreatHistory(threat.logId)}
                        >
                          <Text style={styles.historyButtonText}>📜 History</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.verifyButton}
                          onPress={() => {
                            setActiveTab('verify');
                            setSelectedThreat(threat);
                          }}
                        >
                          <Text style={styles.verifyButtonText}>✅ Verify</Text>
                        </TouchableOpacity>
                      </View>

                      {expandedThreat?.logId === threat.logId && expandedThreat.history && (
                        <View style={styles.historyContainer}>
                          <Text style={styles.historyTitle}>Transaction History</Text>
                          {expandedThreat.history.map((tx, idx) => (
                            <View key={idx} style={styles.historyItem}>
                              <View style={styles.historyItemHeader}>
                                <Text style={styles.historyItemType}>{tx.type}</Text>
                                <Text style={styles.historyItemBlock}>Block #{tx.blockNumber}</Text>
                              </View>
                              <Text style={styles.historyItemTxId} numberOfLines={1}>{tx.txId}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Verification Tab */}
            {activeTab === 'verify' && (
              <View>
                <Text style={styles.sectionTitle}>Verify Threat Log Integrity</Text>
                <Text style={styles.verifyDescription}>
                  Select a threat log to verify its cryptographic hash and ensure data integrity.
                </Text>

                {threats.map((threat) => (
                  <TouchableOpacity
                    key={threat.logId}
                    style={[
                      styles.verifyThreatCard,
                      selectedThreat?.logId === threat.logId && styles.verifyThreatCardSelected
                    ]}
                    onPress={() => setSelectedThreat(threat)}
                  >
                    <View style={styles.verifyThreatInfo}>
                      <Text style={styles.verifyThreatId}>{threat.logId}</Text>
                      <Text style={styles.verifyThreatType}>{threat.logType}</Text>
                    </View>
                    {selectedThreat?.logId === threat.logId && (
                      <TouchableOpacity
                        style={[styles.verifyHashButton, verifying && styles.verifyHashButtonDisabled]}
                        onPress={() => verifyThreat(threat.logId)}
                        disabled={verifying}
                      >
                        <Text style={styles.verifyHashButtonText}>
                          {verifying ? '⏳ Verifying...' : '✅ Verify Hash'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}

                {verification && (
                  <View style={[
                    styles.verificationResult,
                    verification.isValid ? styles.verificationResultValid : styles.verificationResultInvalid
                  ]}>
                    <Text style={styles.verificationEmoji}>
                      {verification.isValid ? '✅' : '❌'}
                    </Text>
                    <View style={styles.verificationContent}>
                      <Text style={[
                        styles.verificationMessage,
                        verification.isValid ? styles.verificationMessageValid : styles.verificationMessageInvalid
                      ]}>
                        {verification.message || verification.error}
                      </Text>

                      {verification.isValid !== undefined && (
                        <View style={styles.verificationDetails}>
                          <View style={styles.verificationHash}>
                            <Text style={styles.verificationHashLabel}>Stored Hash:</Text>
                            <Text style={styles.verificationHashValue} numberOfLines={2}>
                              {verification.storedHash}
                            </Text>
                          </View>
                          <View style={styles.verificationHash}>
                            <Text style={styles.verificationHashLabel}>Calculated Hash:</Text>
                            <Text style={styles.verificationHashValue} numberOfLines={2}>
                              {verification.calculatedHash}
                            </Text>
                          </View>
                          <Text style={[
                            styles.verificationStatus,
                            verification.isValid ? styles.verificationStatusValid : styles.verificationStatusInvalid
                          ]}>
                            {verification.isValid
                              ? '✓ Hashes match - Data has not been tampered with'
                              : '✗ Hashes do not match - Data may have been altered'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#9ca3af',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#f87171',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  connectedDot: {
    width: 8,
    height: 8,
    backgroundColor: '#4ade80',
    borderRadius: 4,
    marginRight: 6,
  },
  connectedText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '500',
  },
  warningBanner: {
    backgroundColor: 'rgba(113, 63, 18, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  warningEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 4,
  },
  warningText: {
    color: 'rgba(251, 191, 36, 0.8)',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  tabsContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 20,
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#10b981',
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 12,
  },
  threatDistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  threatDistCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4b5563',
    width: (width - 80) / 2,
  },
  threatDistLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  threatDistValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4b5563',
    marginBottom: 8,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  activityType: {
    fontWeight: '500',
    color: '#f3f4f6',
    fontSize: 13,
  },
  activityBlock: {
    fontSize: 11,
    color: '#9ca3af',
  },
  activityRight: {
    alignItems: 'flex-end',
    maxWidth: '40%',
  },
  activityLogId: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#9ca3af',
  },
  activityTimestamp: {
    fontSize: 10,
    color: '#6b7280',
  },
  threatsHeader: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  threatCard: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    marginBottom: 12,
  },
  threatHeader: {
    marginBottom: 12,
  },
  threatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threatEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  threatInfo: {
    flex: 1,
  },
  threatId: {
    fontWeight: '600',
    color: '#f3f4f6',
    fontSize: 13,
  },
  threatType: {
    fontSize: 11,
    color: '#9ca3af',
  },
  threatDetails: {
    paddingLeft: 36,
    marginBottom: 12,
  },
  threatDetail: {
    marginBottom: 6,
  },
  threatDetailLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  threatDetailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#d1d5db',
  },
  threatHash: {
    fontSize: 10,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    padding: 4,
    borderRadius: 4,
    color: '#d1d5db',
    borderWidth: 1,
    borderColor: '#374151',
  },
  threatTimestamp: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  threatActions: {
    flexDirection: 'row',
    gap: 8,
  },
  historyButton: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
  },
  historyButtonText: {
    fontSize: 12,
    color: '#60a5fa',
  },
  verifyButton: {
    flex: 1,
    backgroundColor: 'rgba(6, 78, 59, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 12,
    color: '#4ade80',
  },
  historyContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  historyTitle: {
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 8,
    fontSize: 13,
  },
  historyItem: {
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4b5563',
    marginBottom: 6,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyItemType: {
    fontWeight: '500',
    color: '#d1d5db',
    fontSize: 12,
  },
  historyItemBlock: {
    color: '#9ca3af',
    fontSize: 11,
  },
  historyItemTxId: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  verifyDescription: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 16,
  },
  verifyThreatCard: {
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    marginBottom: 12,
  },
  verifyThreatCardSelected: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(6, 78, 59, 0.2)',
  },
  verifyThreatInfo: {
    marginBottom: 8,
  },
  verifyThreatId: {
    fontWeight: '600',
    color: '#f3f4f6',
    fontSize: 13,
  },
  verifyThreatType: {
    fontSize: 11,
    color: '#9ca3af',
  },
  verifyHashButton: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyHashButtonDisabled: {
    backgroundColor: '#6b7280',
    opacity: 0.5,
  },
  verifyHashButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  verificationResult: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    marginTop: 16,
  },
  verificationResultValid: {
    backgroundColor: 'rgba(6, 78, 59, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  verificationResultInvalid: {
    backgroundColor: 'rgba(127, 29, 29, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  verificationEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  verificationContent: {
    flex: 1,
  },
  verificationMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  verificationMessageValid: {
    color: '#4ade80',
  },
  verificationMessageInvalid: {
    color: '#f87171',
  },
  verificationDetails: {
    gap: 12,
  },
  verificationHash: {
    marginBottom: 8,
  },
  verificationHashLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 4,
  },
  verificationHashValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    padding: 8,
    borderRadius: 6,
    color: '#d1d5db',
    borderWidth: 1,
    borderColor: '#374151',
  },
  verificationStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  verificationStatusValid: {
    color: '#4ade80',
  },
  verificationStatusInvalid: {
    color: '#f87171',
  },
});

export default BlockchainLedgerScreen;

