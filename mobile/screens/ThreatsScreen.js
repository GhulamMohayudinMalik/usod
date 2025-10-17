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

const ThreatsScreen = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


  useEffect(() => {
    loadThreatHistory();
  }, [page, itemsPerPage]);

  const loadThreatHistory = async () => {
    setLoading(true);
    try {
      // Fetch security events from the API
      const events = await apiService.getSecurityEvents();
      
      // Sort by timestamp, newest first
      const sortedEvents = events.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setTotalEvents(sortedEvents);
      
      // Paginate the results
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedEvents = sortedEvents.slice(startIndex, endIndex);
      
      setHistoryEvents(paginatedEvents);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadThreatHistory();
      setRefreshing(false);
    }, 1500);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter text to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      setTimeout(() => {
        const mockResponse = {
          threat_level: inputText.toLowerCase().includes('hack') || inputText.toLowerCase().includes('attack') ? 'high' : 
                        inputText.toLowerCase().includes('suspicious') ? 'medium' : 'low',
          confidence: Math.random() * 0.5 + 0.5,
          categories: ['sentiment', 'behavioral'],
          explanation: `Analysis complete for text: "${inputText.substring(0, 50)}${inputText.length > 50 ? '...' : ''}".`,
          recommendations: [
            'Monitor user activity',
            'Review content regularly',
            inputText.toLowerCase().includes('hack') ? 'Escalate to security team' : null,
            inputText.toLowerCase().includes('attack') ? 'Block source IP address' : null,
          ].filter(Boolean),
        };
        
        setAnalysisResult(mockResponse);
        setIsAnalyzing(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze text');
      setIsAnalyzing(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getSeverityClass = (severity) => {
    switch(severity) {
      case 'low': return { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' };
      case 'medium': return { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
      case 'high': return { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
      case 'critical': return { color: '#7C3AED', bgColor: 'rgba(124, 58, 237, 0.1)' };
      default: return { color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const totalPages = Math.ceil(totalEvents.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

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
          <Text style={styles.title}>Threat Analysis</Text>
          <Text style={styles.subtitle}>Analyze text for potential security threats</Text>
        </View>
        
        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>AI-Powered Threat Detection</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={6}
            placeholder="Enter text to analyze for potential threats..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            style={[styles.analyzeButton, (!inputText.trim() || isAnalyzing) && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={!inputText.trim() || isAnalyzing}
          >
            <Text style={styles.analyzeButtonText}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Analysis Result */}
        {analysisResult && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Analysis Result</Text>
            <View style={[styles.threatCard, { backgroundColor: getSeverityClass(analysisResult.threat_level).bgColor }]}>
              <View style={styles.threatHeader}>
                <View style={styles.threatInfo}>
                  <Text style={styles.threatType}>Text Analysis</Text>
                  <Text style={styles.threatSource}>AI Detection</Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityClass(analysisResult.threat_level).color }]}>
                  <Text style={styles.severityText}>{analysisResult.threat_level.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.threatDescription}>{analysisResult.explanation}</Text>
              <Text style={styles.confidenceText}>
                Confidence: {(analysisResult.confidence * 100).toFixed(1)}%
              </Text>
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                {analysisResult.recommendations.map((rec, index) => (
                  <Text key={index} style={styles.recommendationItem}>• {rec}</Text>
                ))}
              </View>
            </View>
          </View>
        )}
        
        {/* Analysis History */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Analysis History</Text>
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Showing {historyEvents.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {Math.min(page * itemsPerPage, totalEvents.length)} of {totalEvents.length} entries
              </Text>
            </View>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading threat history...</Text>
            </View>
          ) : (
            <>
              {historyEvents.map((event) => {
                const severityStyle = getSeverityClass(event.severity);
                return (
                  <View key={event.id} style={[styles.historyCard, { backgroundColor: severityStyle.bgColor }]}>
                    <View style={styles.historyHeader}>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyTime}>{formatTimestamp(event.timestamp)}</Text>
                        <Text style={styles.historySource}>{event.source}</Text>
                      </View>
                      <View style={[styles.severityBadge, { backgroundColor: severityStyle.color }]}>
                        <Text style={styles.severityText}>{event.severity.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.historyDescription}>{event.description}</Text>
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
                    onPress={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    <Text style={styles.paginationButtonText}>Previous</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.pageNumbers}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <TouchableOpacity
                          key={pageNum}
                          style={[styles.pageButton, page === pageNum && styles.pageButtonActive]}
                          onPress={() => handlePageChange(pageNum)}
                        >
                          <Text style={[styles.pageButtonText, page === pageNum && styles.pageButtonTextActive]}>
                            {pageNum}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.paginationButton, page === totalPages && styles.paginationButtonDisabled]}
                    onPress={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    <Text style={styles.paginationButtonText}>Next</Text>
                  </TouchableOpacity>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 120,
  },
  analyzeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    marginBottom: 24,
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
  confidenceText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 13,
    color: '#D1D5DB',
    marginBottom: 4,
    lineHeight: 18,
  },
  historySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  paginationInfo: {
    marginTop: 8,
  },
  paginationText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  historyCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyTime: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  historySource: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  historyDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 12,
    lineHeight: 20,
  },
  viewButton: {
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
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
  pageNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  pageButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  pageButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pageButtonText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  pageButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default ThreatsScreen;