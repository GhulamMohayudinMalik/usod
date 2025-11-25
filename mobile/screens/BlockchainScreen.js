import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

export default function BlockchainScreen() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [networkHealth, setNetworkHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [verifyLogId, setVerifyLogId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [healthRes, statsRes, threatsRes] = await Promise.all([
        apiService.get('/api/blockchain/health'),
        apiService.get('/api/blockchain/statistics'),
        apiService.get('/api/blockchain/threats'),
      ]);

      setNetworkHealth(healthRes);
      setStats(statsRes);
      setThreats(threatsRes || []);
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const verifyThreat = async (logId) => {
    setVerifying(true);
    setVerification(null);

    try {
      const threat = threats.find((t) => t.logId === logId);
      if (!threat || !threat.threatDetails) {
        setVerification({ success: false, error: 'Threat data not found' });
        setVerifying(false);
        return;
      }

      const res = await apiService.post(`/api/blockchain/threats/${logId}/verify`, {
        currentData: threat.threatDetails,
      });

      setVerification(res);
      setShowVerificationModal(true);
    } catch (error) {
      setVerification({ success: false, error: error.message });
    } finally {
      setVerifying(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#eab308',
      low: '#3b82f6',
    };
    return colors[severity?.toLowerCase()] || '#6b7280';
  };

  const getThreatIcon = (type) => {
    const icons = {
      brute_force_attack: '🔨',
      ddos: '💥',
      port_scan: '🔍',
      malware: '🦠',
      ransomware: '🔒',
      phishing: '🎣',
      sql_injection: '💉',
      xss: '⚠️',
      unauthorized_access: '🚫',
      data_breach: '📂',
    };
    return icons[type?.toLowerCase()] || '⚡';
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Network Health */}
      {networkHealth && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Network Status</Text>
          <View style={styles.networkInfo}>
            <View style={[styles.statusBadge, { backgroundColor: networkHealth.status === 'connected' ? '#10b981' : '#ef4444' }]}>
              <Text style={styles.statusText}>
                {networkHealth.status === 'connected' ? '● Connected' : '● Offline'}
              </Text>
            </View>
            <View style={styles.networkDetail}>
              <Text style={styles.networkLabel}>Channel:</Text>
              <Text style={styles.networkValue}>{networkHealth.channel}</Text>
            </View>
            <View style={styles.networkDetail}>
              <Text style={styles.networkLabel}>Chaincode:</Text>
              <Text style={styles.networkValue}>{networkHealth.chaincode}</Text>
            </View>
            <View style={styles.networkDetail}>
              <Text style={styles.networkLabel}>Network:</Text>
              <Text style={styles.networkValue}>{networkHealth.network}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Statistics */}
      {stats && (
        <>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#1e3a8a' }]}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Records</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#7c2d12' }]}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{stats.bySeverity?.critical || 0}</Text>
              <Text style={styles.statLabel}>Critical</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#065f46' }]}>
              <Text style={styles.statIcon}>⚠️</Text>
              <Text style={styles.statValue}>{stats.bySeverity?.high || 0}</Text>
              <Text style={styles.statLabel}>High Priority</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#713f12' }]}>
              <Text style={styles.statIcon}>🔐</Text>
              <Text style={styles.statValue}>SHA-256</Text>
              <Text style={styles.statLabel}>Hash Algorithm</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );

  const renderThreatsTab = () => (
    <View style={styles.tabContent}>
      {threats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No threat logs found</Text>
        </View>
      ) : (
        threats.slice(0, 10).map((threat, index) => (
          <TouchableOpacity
            key={threat.logId || index}
            style={styles.threatCard}
            onPress={() => setSelectedThreat(selectedThreat?.logId === threat.logId ? null : threat)}
          >
            <View style={styles.threatHeader}>
              <Text style={styles.threatId}>{threat.logId}</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(threat.threatDetails?.severity) }]}>
                <Text style={styles.severityText}>{threat.threatDetails?.severity?.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.threatType}>{threat.threatDetails?.type?.replace(/_/g, ' ') || 'Unknown'}</Text>
            <View style={styles.threatMeta}>
              <Text style={styles.metaText}>🕒 {new Date(threat.timestamp).toLocaleString()}</Text>
              <Text style={styles.metaText}>🔍 {threat.detector || 'N/A'}</Text>
            </View>
            {selectedThreat?.logId === threat.logId && (
              <View style={styles.threatDetails}>
                <Text style={styles.detailsTitle}>Hash (SHA-256)</Text>
                <Text style={styles.hashText}>{threat.hash}</Text>
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={() => verifyThreat(threat.logId)}
                >
                  <Text style={styles.verifyButtonText}>🔐 Verify Integrity</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderVerifyTab = () => (
    <View style={styles.verifyTab}>
  <View style={styles.card}>
    <Text style={styles.cardTitle}>🔐 Cryptographic Verification</Text>
    <Text style={styles.description}>
      Verify the integrity of threat logs using SHA-256 hash comparison
    </Text>

    {threats.length === 0 ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🔐</Text>
        <Text style={styles.emptyTitle}>No Threats to Verify</Text>
        <Text style={styles.emptyText}>
          Threat logs must be created before they can be verified
        </Text>
      </View>
    ) : (
      <ScrollView style={styles.threatsSelectionList}>
        {threats.map((threat) => (
          <View key={threat.logId} style={styles.threatSelectionWrapper}>
            <TouchableOpacity
              onPress={() => setSelectedThreat(selectedThreat?.logId === threat.logId ? null : threat)}
              style={[
                styles.threatSelectionCard,
                selectedThreat?.logId === threat.logId && styles.selectedCard
              ]}
            >
              <View style={styles.threatSelectionInfo}>
                <Text style={styles.threatSelectionIcon}>
                  {getThreatIcon(threat.threatDetails?.type)}
                </Text>
                <View>
                  <Text style={styles.threatSelectionId}>{threat.logId}</Text>
                  <Text style={styles.threatSelectionType}>
                    {(threat.threatDetails?.type || 'unknown').replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            
            {selectedThreat?.logId === threat.logId && (
              <TouchableOpacity
                onPress={() => verifyThreat(threat.logId)}
                disabled={verifying}
                style={[
                  styles.verifySelectedBtn,
                  verifying && styles.verifySelectedBtnDisabled
                ]}
              >
                {verifying ? (
                  <View style={styles.verifyingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.verifyBtnText}>Verifying...</Text>
                  </View>
                ) : (
                  <Text style={styles.verifyBtnText}>🔐 Verify Integrity</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    )}
  </View>
</View>
  );

  const renderAnalyticsTab = () => (
    <View style={styles.tabContent}>
      {stats && (
        <>
          {/* Key Stats */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📚 Total Records</Text>
            <Text style={styles.analyticValue}>{threats.length}</Text>
            <Text style={styles.analyticSubtext}>Immutable entries on blockchain</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔐 Hash Algorithm</Text>
            <Text style={styles.analyticValue}>SHA-256</Text>
            <Text style={styles.analyticSubtext}>Cryptographic security standard</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚡ Consensus</Text>
            <Text style={styles.analyticValue}>Solo</Text>
            <Text style={styles.analyticSubtext}>Ordering service (Single-node)</Text>
          </View>

          {/* Threat Distribution */}
          {stats.byType && Object.keys(stats.byType).length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎯 Threat Type Distribution</Text>
              {Object.entries(stats.byType).map(([type, count]) => (
                <View key={type} style={styles.distributionRow}>
                  <Text style={styles.distributionLabel}>{type.replace(/_/g, ' ')}</Text>
                  <Text style={styles.distributionValue}>{count}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading blockchain data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blockchain Ledger</Text>
        <Text style={styles.headerSubtitle}>Immutable threat logging with Hyperledger Fabric</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'threats' && styles.tabActive]}
          onPress={() => setActiveTab('threats')}
        >
          <Text style={[styles.tabText, activeTab === 'threats' && styles.tabTextActive]}>Threats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'verify' && styles.tabActive]}
          onPress={() => setActiveTab('verify')}
        >
          <Text style={[styles.tabText, activeTab === 'verify' && styles.tabTextActive]}>Verify</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'threats' && renderThreatsTab()}
        {activeTab === 'verify' && renderVerifyTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </ScrollView>

      {/* Verification Modal */}
      <Modal visible={showVerificationModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔐 Verification Result</Text>
            {verification && (
              <>
                {verification.error ? (
                  <Text style={styles.errorText}>{verification.error}</Text>
                ) : (
                  <>
                    <View style={[styles.resultBadge, { backgroundColor: verification.valid ? '#10b981' : '#ef4444' }]}>
                      <Text style={styles.resultText}>
                        {verification.valid ? '✓ MATCH - Data is authentic' : '✗ MISMATCH - Data tampered'}
                      </Text>
                    </View>

                    <View style={styles.hashComparison}>
                      <Text style={styles.hashLabel}>BLOCKCHAIN HASH</Text>
                      <Text style={styles.hashValue}>{verification.originalHash}</Text>

                      <Text style={styles.hashLabel}>CURRENT HASH</Text>
                      <Text style={styles.hashValue}>{verification.currentHash}</Text>
                    </View>
                  </>
                )}
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowVerificationModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0f172a',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#0f172a',
//   },
//   loadingText: {
//     color: '#94a3b8',
//     marginTop: 10,
//     fontSize: 14,
//   },
//   header: {
//     padding: 20,
//     backgroundColor: '#1e293b',
//     borderBottomWidth: 1,
//     borderBottomColor: '#334155',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#f1f5f9',
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#94a3b8',
//     marginTop: 4,
//   },
//   tabs: {
//     flexDirection: 'row',
//     backgroundColor: '#1e293b',
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#334155',
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   tabActive: {
//     backgroundColor: '#10b981',
//   },
//   tabText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#94a3b8',
//     textAlign: 'center',
//   },
//   tabTextActive: {
//     color: '#ffffff',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   tabContent: {
//     padding: 16,
//   },
//   card: {
//     backgroundColor: '#1e293b',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#334155',
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#f1f5f9',
//     marginBottom: 12,
//   },
//   networkInfo: {
//     gap: 12,
//   },
//   statusBadge: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//   },
//   statusText: {
//     color: '#ffffff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   networkDetail: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#334155',
//   },
//   networkLabel: {
//     color: '#94a3b8',
//     fontSize: 14,
//   },
//   networkValue: {
//     color: '#10b981',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   statsGrid: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 12,
//   },
//   statCard: {
//     flex: 1,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//   },
//   statIcon: {
//     fontSize: 32,
//     marginBottom: 8,
//   },
//   statValue: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#ffffff',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#d1d5db',
//     textAlign: 'center',
//   },
//   threatCard: {
//     backgroundColor: '#1e293b',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#334155',
//   },
//   threatHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   threatId: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#f1f5f9',
//     flex: 1,
//   },
//   severityBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   severityText: {
//     color: '#ffffff',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   threatType: {
//     fontSize: 14,
//     color: '#94a3b8',
//     textTransform: 'capitalize',
//     marginBottom: 8,
//   },
//   threatMeta: {
//     gap: 4,
//   },
//   metaText: {
//     fontSize: 12,
//     color: '#64748b',
//   },
//   threatDetails: {
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#334155',
//   },
//   detailsTitle: {
//     fontSize: 12,
//     color: '#94a3b8',
//     marginBottom: 4,
//   },
//   hashText: {
//     fontSize: 10,
//     color: '#10b981',
//     fontFamily: 'monospace',
//     marginBottom: 12,
//   },
//   verifyButton: {
//     backgroundColor: '#10b981',
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   verifyButtonText: {
//     color: '#ffffff',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   emptyState: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   emptyIcon: {
//     fontSize: 64,
//     marginBottom: 16,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#64748b',
//   },
//   input: {
//     backgroundColor: '#0f172a',
//     borderWidth: 1,
//     borderColor: '#334155',
//     borderRadius: 8,
//     padding: 12,
//     color: '#f1f5f9',
//     fontSize: 14,
//     marginBottom: 16,
//   },
//   button: {
//     backgroundColor: '#10b981',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   analyticValue: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#ffffff',
//     marginBottom: 4,
//   },
//   analyticSubtext: {
//     fontSize: 12,
//     color: '#94a3b8',
//   },
//   distributionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#334155',
//   },
//   distributionLabel: {
//     fontSize: 14,
//     color: '#94a3b8',
//     textTransform: 'capitalize',
//   },
//   distributionValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#10b981',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#1e293b',
//     borderRadius: 16,
//     padding: 24,
//     width: '100%',
//     maxWidth: 400,
//     borderWidth: 1,
//     borderColor: '#334155',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#f1f5f9',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   resultBadge: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   resultText: {
//     color: '#ffffff',
//     fontSize: 14,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   hashComparison: {
//     marginBottom: 16,
//   },
//   hashLabel: {
//     fontSize: 10,
//     color: '#94a3b8',
//     marginBottom: 4,
//     marginTop: 8,
//     fontWeight: 'bold',
//   },
//   hashValue: {
//     fontSize: 10,
//     color: '#10b981',
//     fontFamily: 'monospace',
//     backgroundColor: '#0f172a',
//     padding: 8,
//     borderRadius: 4,
//   },
//   errorText: {
//     color: '#ef4444',
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   closeButton: {
//     backgroundColor: '#64748b',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   closeButtonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 10,
    fontSize: 14,
  },
  header: {
    padding: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: '#10b981',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  
  // Verify Tab Styles
  verifyTab: {
    flex: 1,
  },
  
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
    marginTop: -8,
  },
  
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  
  // Threats Selection List
  threatsSelectionList: {
    marginTop: 16,
  },
  
  // Threat Selection Wrapper (for mobile layout)
  threatSelectionWrapper: {
    marginBottom: 12,
  },
  
  // Threat Selection Card
  threatSelectionCard: {
    padding: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
  },
  selectedCard: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  threatSelectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  threatSelectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  threatSelectionIcon: {
    fontSize: 32,
  },
  threatSelectionId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  threatSelectionType: {
    fontSize: 13,
    color: '#94a3b8',
    textTransform: 'capitalize',
  },
  
  // Verify Button (now full width below card)
  verifySelectedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#10b981',
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifySelectedBtnDisabled: {
    opacity: 0.6,
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Network Info
  networkInfo: {
    gap: 12,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  networkDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  networkLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  networkValue: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#d1d5db',
    textAlign: 'center',
  },
  
  // Threat Card
  threatCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  threatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  threatId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f1f5f9',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  threatType: {
    fontSize: 14,
    color: '#94a3b8',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  threatMeta: {
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  threatDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  detailsTitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  hashText: {
    fontSize: 10,
    color: '#10b981',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 12,
  },
  
  // Verify Button (in threat details)
  verifyButton: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Input
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#f1f5f9',
    fontSize: 14,
    marginBottom: 16,
  },
  
  // Generic Button
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Analytics
  analyticValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  analyticSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  distributionLabel: {
    fontSize: 14,
    color: '#94a3b8',
    textTransform: 'capitalize',
  },
  distributionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  // Verification Result Badge
  resultBadge: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultBadgeValid: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  resultBadgeInvalid: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultTextValid: {
    color: '#10b981',
  },
  resultTextInvalid: {
    color: '#ef4444',
  },
  
  // Hash Comparison
  hashComparison: {
    marginBottom: 16,
  },
  hashLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 4,
    marginTop: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  hashValue: {
    fontSize: 10,
    color: '#10b981',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 4,
  },
  hashValueBlockchain: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  hashValueCurrent: {
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    color: '#06b6d4',
  },
  
  // Error Text
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  
  // Close Button
  closeButton: {
    backgroundColor: '#64748b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});