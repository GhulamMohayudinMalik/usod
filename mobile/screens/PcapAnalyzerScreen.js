import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const PcapAnalyzerScreen = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async () => {
    // For now, show a message that file picker needs to be implemented
    Alert.alert(
      'File Upload',
      'PCAP file upload is not yet available on mobile. Please use the web or desktop app for PCAP analysis.',
      [{ text: 'OK' }]
    );
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setResults(null);
  };

  const handleAnalyze = async () => {
    Alert.alert('Feature Not Available', 'PCAP analysis on mobile is coming soon. Please use the web or desktop app.');
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return { color: '#A855F7', bgColor: 'rgba(168, 85, 247, 0.1)' };
      case 'high': return { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
      case 'medium': return { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
      case 'low': return { color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' };
      default: return { color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PCAP Analyzer</Text>
          <Text style={styles.subtitle}>Upload and analyze packet capture files for threat detection</Text>
        </View>

        {/* Upload Section */}
        <View style={styles.uploadCard}>
          <Text style={styles.sectionTitle}>Upload PCAP File</Text>
          
          {!file ? (
            <View>
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={handleFileSelect}
              >
                <Text style={styles.uploadIcon}>☁️</Text>
                <Text style={styles.uploadText}>
                  <Text style={styles.uploadLink}>Tap to upload</Text>
                </Text>
                <Text style={styles.uploadSubtext}>PCAP or PCAPNG files up to 100MB</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fileInfo}>
              <View style={styles.fileDetails}>
                <Text style={styles.fileIcon}>📄</Text>
                <View style={styles.fileText}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  <Text style={styles.fileSize}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleRemoveFile}>
                <Text style={styles.removeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {file && !results && (
            <TouchableOpacity
              style={[styles.button, styles.analyzeButton, analyzing && styles.buttonDisabled]}
              onPress={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={[styles.buttonText, { marginLeft: 8 }]}>Analyzing PCAP File...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Analyze File</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Results Section */}
        {results && (
          <>
            {/* Summary Statistics */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🛡️</Text>
                <Text style={styles.statLabel}>Total Threats</Text>
                <Text style={styles.statValue}>{results.threats?.length || 0}</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>⚠️</Text>
                <Text style={[styles.statLabel, { color: '#EF4444' }]}>High Severity</Text>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>
                  {results.threats?.filter(t => t.severity === 'high').length || 0}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statLabel}>Flows Analyzed</Text>
                <Text style={styles.statValue}>{results.flowsAnalyzed || 0}</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>✅</Text>
                <Text style={[styles.statLabel, { color: '#10B981' }]}>Status</Text>
                <Text style={[styles.statValue, { color: '#10B981', fontSize: 16 }]}>Complete</Text>
              </View>
            </View>

            {/* Detected Threats */}
            {results.threats && results.threats.length > 0 ? (
              <View style={styles.threatsSection}>
                <Text style={styles.sectionTitle}>Detected Threats</Text>
                
                {results.threats.map((threat, index) => {
                  const severityStyle = getSeverityColor(threat.severity);
                  return (
                    <View 
                      key={index} 
                      style={[
                        styles.threatCard,
                        { backgroundColor: severityStyle.bgColor }
                      ]}
                    >
                      <View style={styles.threatHeader}>
                        <View style={styles.threatTitleRow}>
                          <Text style={styles.threatIcon}>🛡️</Text>
                          <View style={styles.threatTitleText}>
                            <Text style={styles.threatTitle}>
                              {threat.threat_type?.toUpperCase() || 'Unknown Threat'}
                            </Text>
                            <Text style={styles.threatId}>{threat.threat_id}</Text>
                          </View>
                        </View>
                        <View style={[
                          styles.severityBadge, 
                          { backgroundColor: severityStyle.color }
                        ]}>
                          <Text style={styles.severityText}>
                            {threat.severity?.toUpperCase() || 'UNKNOWN'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.threatDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Source IP</Text>
                          <Text style={styles.detailValue}>{threat.source_ip}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Destination IP</Text>
                          <Text style={styles.detailValue}>{threat.destination_ip}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Confidence</Text>
                          <Text style={styles.detailValue}>
                            {Math.round((threat.confidence || 0) * 100)}%
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Timestamp</Text>
                          <Text style={styles.detailValue}>
                            {new Date(threat.timestamp).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noThreatsCard}>
                <Text style={styles.noThreatsIcon}>✅</Text>
                <Text style={styles.noThreatsTitle}>No Threats Detected</Text>
                <Text style={styles.noThreatsText}>
                  The PCAP file was analyzed successfully. No malicious activity was found.
                </Text>
              </View>
            )}

            {/* New Analysis Button */}
            <TouchableOpacity
              style={[styles.button, styles.newAnalysisButton]}
              onPress={handleRemoveFile}
            >
              <Text style={styles.buttonText}>Analyze Another File</Text>
            </TouchableOpacity>
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
  uploadCard: {
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
    marginBottom: 16,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4B5563',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  uploadLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  fileText: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  removeButton: {
    fontSize: 24,
    color: '#EF4444',
    paddingHorizontal: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#EF4444',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  analyzeButton: {
    backgroundColor: '#3B82F6',
  },
  newAnalysisButton: {
    backgroundColor: '#4B5563',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  threatsSection: {
    marginBottom: 24,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  threatTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  threatIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  threatTitleText: {
    flex: 1,
  },
  threatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  threatId: {
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
  threatDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  noThreatsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  noThreatsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noThreatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noThreatsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default PcapAnalyzerScreen;

