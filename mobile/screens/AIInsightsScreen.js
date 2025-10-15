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

const AIInsightsScreen = () => {
  const [threatData, setThreatData] = useState([]);
  const [insightResult, setInsightResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Dummy threat data
  const dummyThreatData = [
    { id: 1, type: 'sql_injection', severity: 'high', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), source: '192.168.1.100', description: 'SQL injection attempt detected' },
    { id: 2, type: 'brute_force', severity: 'medium', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), source: '10.0.0.50', description: 'Brute force attack detected' },
    { id: 3, type: 'xss_attempt', severity: 'high', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), source: '172.16.0.25', description: 'XSS payload detected' },
    { id: 4, type: 'suspicious_activity', severity: 'medium', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), source: '203.0.113.1', description: 'Suspicious file upload' },
    { id: 5, type: 'csrf_attempt', severity: 'low', timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(), source: '198.51.100.5', description: 'CSRF token validation failed' }
  ];

  useEffect(() => {
    fetchThreatData();
  }, []);

  const fetchThreatData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      setTimeout(() => {
        setThreatData(dummyThreatData);
        // Generate insights automatically when data is loaded
        generateInsights(dummyThreatData);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load threat intelligence data');
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchThreatData();
      setRefreshing(false);
    }, 1500);
  };

  const generateInsights = async (threats) => {
    setInsightLoading(true);
    
    try {
      // Simulate AI insights generation
      setTimeout(() => {
        const mockInsights = {
          summary: "Security posture shows moderate risk with several emerging threats detected. Recent malware activity suggests increased targeting of financial services sector. Suspicious login patterns indicate potential credential compromise attempts.",
          recommendations: [
            "Update intrusion detection signatures for emerging threats",
            "Implement additional authentication factors for critical systems",
            "Review and update firewall rules for known malicious IP ranges",
            "Conduct targeted phishing awareness training"
          ],
          risk_score: 65,
          trends: [
            { label: "Malware Detections", value: 23, change: 15 },
            { label: "Phishing Attempts", value: 42, change: -8 },
            { label: "Unauthorized Access", value: 12, change: 5 },
            { label: "Data Exfiltration", value: 4, change: -2 }
          ],
          top_threats: [
            { name: "Emotet Variant", count: 12, severity: "high" },
            { name: "Credential Stuffing", count: 18, severity: "medium" },
            { name: "SQL Injection", count: 7, severity: "high" },
            { name: "Zero-day Vulnerability", count: 3, severity: "critical" },
            { name: "Ransomware", count: 5, severity: "critical" }
          ]
        };
        
        setInsightResult(mockInsights);
        setInsightLoading(false);
      }, 2000);
    } catch (error) {
      setInsightLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  const getSeverityBgColor = (severity) => {
    switch(severity) {
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
        <Text style={styles.loadingText}>Loading AI insights...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchThreatData}>
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
          <Text style={styles.title}>AI Security Insights</Text>
          <Text style={styles.subtitle}>Advanced threat analysis and recommendations powered by AI</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
        
        {/* Main Insights Dashboard */}
        <View style={styles.insightsGrid}>
          {/* Risk Score */}
          <View style={styles.riskScoreCard}>
            <Text style={styles.cardTitle}>Security Risk Score</Text>
            <View style={styles.riskScoreContainer}>
              <View style={styles.riskScoreCircle}>
                <Text style={styles.riskScoreText}>
                  {insightResult?.risk_score || 0}%
                </Text>
              </View>
              <Text style={styles.riskScoreLabel}>
                {insightResult?.risk_score > 75 ? 'High Risk' : 
                 insightResult?.risk_score > 50 ? 'Moderate Risk' : 'Low Risk'}
              </Text>
            </View>
          </View>
          
          {/* Security Trends */}
          <View style={styles.trendsCard}>
            <Text style={styles.cardTitle}>Security Trends</Text>
            <View style={styles.trendsContent}>
              {insightResult?.trends.map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <View style={styles.trendHeader}>
                    <Text style={styles.trendLabel}>{trend.label}</Text>
                    <Text style={styles.trendValue}>{trend.value}</Text>
                  </View>
                  <View style={styles.trendChange}>
                    <Text style={[
                      styles.trendChangeText,
                      { color: trend.change > 0 ? '#EF4444' : '#10B981' }
                    ]}>
                      {trend.change > 0 ? '↗' : '↘'} {Math.abs(trend.change)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        {/* Summary and Recommendations */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>AI Analysis Summary</Text>
            <Text style={styles.summaryText}>
              {insightResult?.summary || 'No summary available'}
            </Text>
          </View>
          
          <View style={styles.recommendationsCard}>
            <Text style={styles.cardTitle}>AI Recommendations</Text>
            <View style={styles.recommendationsList}>
              {insightResult?.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationNumber}>{index + 1}</Text>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        {/* Top Threats */}
        <View style={styles.threatsSection}>
          <Text style={styles.sectionTitle}>Top Threats Analysis</Text>
          <View style={styles.threatsList}>
            {insightResult?.top_threats.map((threat, index) => (
              <View key={index} style={[styles.threatCard, { backgroundColor: getSeverityBgColor(threat.severity) }]}>
                <View style={styles.threatHeader}>
                  <View style={styles.threatInfo}>
                    <Text style={styles.threatName}>{threat.name}</Text>
                    <Text style={styles.threatCount}>{threat.count} occurrences</Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(threat.severity) }]}>
                    <Text style={styles.severityText}>{threat.severity.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.threatIndicator}>
                  <View 
                    style={[
                      styles.threatIndicatorFill,
                      { 
                        width: `${(threat.count / Math.max(...insightResult.top_threats.map(t => t.count))) * 100}%`,
                        backgroundColor: getSeverityColor(threat.severity)
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Recent Threat Intelligence */}
        <View style={styles.recentThreatsSection}>
          <Text style={styles.sectionTitle}>Recent Security Events</Text>
          <View style={styles.eventsList}>
            {threatData.slice(0, 5).map((event) => (
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
                  {new Date(event.timestamp).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.refreshInsightsButton, insightLoading && styles.refreshInsightsButtonDisabled]}
            onPress={() => generateInsights(threatData)}
            disabled={insightLoading}
          >
            <Text style={styles.refreshInsightsButtonText}>
              {insightLoading ? 'Generating insights...' : '🔄 Refresh Insights'}
            </Text>
          </TouchableOpacity>
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
  refreshButton: {
    alignSelf: 'flex-start',
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
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  riskScoreCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  trendsCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  riskScoreContainer: {
    alignItems: 'center',
  },
  riskScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskScoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  riskScoreLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  trendsContent: {
    gap: 12,
  },
  trendItem: {
    marginBottom: 8,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  trendChange: {
    alignItems: 'flex-end',
  },
  trendChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  summaryText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  recommendationsCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  threatsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  threatsList: {
    gap: 12,
  },
  threatCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  threatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  threatInfo: {
    flex: 1,
  },
  threatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  threatCount: {
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
  threatIndicator: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  threatIndicatorFill: {
    height: '100%',
    borderRadius: 2,
  },
  recentThreatsSection: {
    marginBottom: 24,
  },
  eventsList: {
    gap: 12,
    marginBottom: 20,
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
  refreshInsightsButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshInsightsButtonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.5,
  },
  refreshInsightsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AIInsightsScreen;