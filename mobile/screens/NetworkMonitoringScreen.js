import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import apiService from '../services/api';
import Modal from '../components/Modal';

const { width } = Dimensions.get('window');

const NetworkMonitoringScreen = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [threats, setThreats] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [monitoringDuration, setMonitoringDuration] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const durationIntervalRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    loadThreatHistory();
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const loadThreatHistory = async () => {
    try {
      const result = await apiService.getNetworkThreats(50);
      if (result.success && result.threats) {
        setThreats(result.threats);
        calculateStatistics(result.threats);
      }
    } catch (error) {
      console.error('Error loading threat history:', error);
    }
  };

  const calculateStatistics = (threatsList) => {
    const stats = {
      total: threatsList.length,
      high: threatsList.filter(t => t.severity === 'high').length,
      medium: threatsList.filter(t => t.severity === 'medium').length,
      low: threatsList.filter(t => t.severity === 'low').length
    };
    setStatistics(stats);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadThreatHistory();
    setRefreshing(false);
  };

  const startMonitoring = async () => {
    try {
      setLoading(true);
      const result = await apiService.startNetworkMonitoring('auto', 300);
      
      if (result.success) {
        setIsMonitoring(true);
        setMonitoringDuration(0);
        startDurationTimer();
        startPolling();
        Alert.alert('Success', 'Network monitoring started successfully');
      } else {
        Alert.alert('Error', result.message || 'Failed to start monitoring');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to start monitoring');
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    try {
      setLoading(true);
      const result = await apiService.stopNetworkMonitoring();
      
      if (result.success) {
        setIsMonitoring(false);
        setMonitoringDuration(0);
        stopDurationTimer();
        stopPolling();
        Alert.alert('Success', 'Network monitoring stopped successfully');
      } else {
        Alert.alert('Error', result.message || 'Failed to stop monitoring');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to stop monitoring');
    } finally {
      setLoading(false);
    }
  };

  const startDurationTimer = () => {
    const startTime = Date.now();
    durationIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setMonitoringDuration(elapsed);
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const startPolling = () => {
    // Poll for new threats every 5 seconds
    pollIntervalRef.current = setInterval(async () => {
      await loadThreatHistory();
    }, 5000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
      case 'medium': return { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
      case 'low': return { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' };
      default: return { color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const handleBlockIP = async (threat) => {
    Alert.alert(
      'Block IP Address',
      `Block IP ${threat.source_ip}?\n\nThis will prevent all traffic from this address.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await apiService.blockIP(threat.source_ip, `network_threat_${threat.threat_type}`);
              if (result.success) {
                Alert.alert('Success', `IP ${threat.source_ip} has been blocked successfully!`);
              } else {
                Alert.alert('Error', result.message || 'Failed to block IP');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to block IP');
            }
          }
        }
      ]
    );
  };

  const handleViewDetails = (threat) => {
    setSelectedThreat(threat);
  };

  return (
    <>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Network Monitoring</Text>
          <Text style={styles.subtitle}>Real-time AI-powered network threat detection</Text>
        </View>

        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: connectionStatus === 'connected' ? '#10B981' : '#EF4444' }
            ]} />
            <Text style={styles.statusText}>
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>

        {/* Monitoring Controls */}
        <View style={styles.controlsCard}>
          <Text style={styles.sectionTitle}>Monitoring Controls</Text>
          
          {isMonitoring && (
            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>Duration:</Text>
              <Text style={styles.durationValue}>{formatDuration(monitoringDuration)}</Text>
            </View>
          )}

          {!isMonitoring ? (
            <TouchableOpacity
              style={[styles.button, styles.startButton, loading && styles.buttonDisabled]}
              onPress={startMonitoring}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Start Monitoring</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.stopButton, loading && styles.buttonDisabled]}
              onPress={stopMonitoring}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Stop Monitoring</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Threats</Text>
            <Text style={styles.statValue}>{statistics.total}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: '#EF4444' }]}>High Severity</Text>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{statistics.high}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: '#F59E0B' }]}>Medium Severity</Text>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{statistics.medium}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: '#10B981' }]}>Low Severity</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{statistics.low}</Text>
          </View>
        </View>

        {/* Live Threat Feed */}
        <View style={styles.threatsSection}>
          <Text style={styles.sectionTitle}>Live Threat Feed</Text>
          
          {threats.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🛡️</Text>
              <Text style={styles.emptyStateText}>No threats detected yet</Text>
              <Text style={styles.emptyStateSubtext}>Start monitoring to see real-time threats</Text>
            </View>
          ) : (
            threats.map((threat, index) => (
              <View key={threat.threat_id || index} style={[
                styles.threatCard,
                { backgroundColor: getSeverityColor(threat.severity).bgColor }
              ]}>
                <View style={styles.threatHeader}>
                  <View style={styles.threatInfo}>
                    <Text style={styles.threatType}>
                      {threat.threat_type?.toUpperCase() || 'UNKNOWN'}
                    </Text>
                    <View style={[
                      styles.severityBadge, 
                      { backgroundColor: getSeverityColor(threat.severity).color }
                    ]}>
                      <Text style={styles.severityText}>
                        {threat.severity?.toUpperCase() || 'UNKNOWN'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.threatDetails}>
                  <Text style={styles.threatDetailText}>
                    <Text style={styles.threatDetailLabel}>Source: </Text>
                    {threat.source_ip}
                  </Text>
                  <Text style={styles.threatDetailText}>
                    <Text style={styles.threatDetailLabel}>Destination: </Text>
                    {threat.destination_ip}
                  </Text>
                  <Text style={styles.threatDetailText}>
                    <Text style={styles.threatDetailLabel}>Confidence: </Text>
                    {Math.round((threat.confidence || 0) * 100)}%
                  </Text>
                  <Text style={styles.threatDetailText}>
                    <Text style={styles.threatDetailLabel}>Time: </Text>
                    {new Date(threat.timestamp).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.threatActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.blockButton]}
                    onPress={() => handleBlockIP(threat)}
                  >
                    <Text style={styles.actionButtonText}>Block IP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.detailsButton]}
                    onPress={() => handleViewDetails(threat)}
                  >
                    <Text style={styles.actionButtonText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
      </ScrollView>

      {/* Modal positioned outside ScrollView for proper centering */}
      <Modal
      visible={!!selectedThreat}
      onClose={() => setSelectedThreat(null)}
      title="Threat Details"
      size="md"
      footer={
        selectedThreat && (
          <TouchableOpacity
            style={[styles.button, styles.blockButton]}
            onPress={() => {
              handleBlockIP(selectedThreat);
              setSelectedThreat(null);
            }}
          >
            <Text style={styles.buttonText}>🚫 Block Source IP</Text>
          </TouchableOpacity>
        )
      }
    >
      {selectedThreat && (
        <View style={styles.modalBody}>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Threat Type</Text>
            <Text style={styles.modalValue}>
              {selectedThreat.threat_type?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Severity</Text>
            <View style={[
              styles.severityBadge, 
              { backgroundColor: getSeverityColor(selectedThreat.severity).color }
            ]}>
              <Text style={styles.severityText}>
                {selectedThreat.severity?.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Confidence</Text>
            <Text style={styles.modalValue}>
              {Math.round((selectedThreat.confidence || 0) * 100)}%
            </Text>
          </View>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Source IP</Text>
            <Text style={[styles.modalValue, styles.monoFont]}>
              {selectedThreat.source_ip}
            </Text>
          </View>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Destination IP</Text>
            <Text style={[styles.modalValue, styles.monoFont]}>
              {selectedThreat.destination_ip}
            </Text>
          </View>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Protocol</Text>
            <Text style={[styles.modalValue, styles.monoFont]}>
              {selectedThreat.protocol || 'N/A'}
            </Text>
          </View>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Timestamp</Text>
            <Text style={styles.modalValue}>
              {new Date(selectedThreat.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>
      )}
      </Modal>
    </>
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
    fontSize: 14,
    color: '#9CA3AF',
  },
  statusCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  controlsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  durationLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  blockButton: {
    backgroundColor: '#EF4444',
  },
  detailsButton: {
    backgroundColor: '#3B82F6',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: (width - 44) / 2,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  threatsSection: {
    marginBottom: 24,
  },
  emptyState: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  threatCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  threatHeader: {
    marginBottom: 12,
  },
  threatInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threatType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  threatDetails: {
    marginBottom: 12,
  },
  threatDetailText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 4,
  },
  threatDetailLabel: {
    fontWeight: '600',
    color: '#9CA3AF',
  },
  threatActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalBody: {
    gap: 12,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  modalLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  monoFont: {
    fontFamily: 'monospace',
  },
});

export default NetworkMonitoringScreen;

