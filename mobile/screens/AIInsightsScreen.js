import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Dimensions,
  TextInput 
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

// Simple SVG Pie/Donut Chart Component for React Native
function PieChart({ data, size = 150, innerRadius = 0, centerLabel, subLabel }) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const radius = size / 2;
  const rOuter = radius - 2;
  const rInner = Math.max(0, Math.min(innerRadius, rOuter - 4));

  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians)
    };
  };

  const describeArcPath = (cx, cy, rOuter, rInner, startAngle, endAngle) => {
    const angleDiff = endAngle - startAngle;
    const isFullCircle = angleDiff >= 359.9;
    
    if (isFullCircle) {
      if (rInner <= 0) {
        return [
          `M ${cx} ${cy}`,
          `m 0 ${-rOuter}`,
          `a ${rOuter} ${rOuter} 0 1 1 0 ${2 * rOuter}`,
          `a ${rOuter} ${rOuter} 0 1 1 0 ${-2 * rOuter}`,
          'Z'
        ].join(' ');
      } else {
        return [
          `M ${cx} ${cy - rOuter}`,
          `a ${rOuter} ${rOuter} 0 1 1 0 ${2 * rOuter}`,
          `a ${rOuter} ${rOuter} 0 1 1 0 ${-2 * rOuter}`,
          `M ${cx} ${cy - rInner}`,
          `a ${rInner} ${rInner} 0 1 0 0 ${2 * rInner}`,
          `a ${rInner} ${rInner} 0 1 0 0 ${-2 * rInner}`,
          'Z'
        ].join(' ');
      }
    }

    const largeArcFlag = angleDiff <= 180 ? 0 : 1;

    if (rInner <= 0) {
      const start = polarToCartesian(cx, cy, rOuter, startAngle);
      const end = polarToCartesian(cx, cy, rOuter, endAngle);
      return [
        `M ${cx} ${cy}`,
        `L ${start.x} ${start.y}`,
        `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
        'Z'
      ].join(' ');
    }

    const outerStart = polarToCartesian(cx, cy, rOuter, startAngle);
    const outerEnd = polarToCartesian(cx, cy, rOuter, endAngle);
    const innerStart = polarToCartesian(cx, cy, rInner, startAngle);
    const innerEnd = polarToCartesian(cx, cy, rInner, endAngle);
    
    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
      'Z'
    ].join(' ');
  };

  const cx = radius;
  const cy = radius;

  const slices = [];
  let cumulative = 0;
  data.forEach((d, idx) => {
    const value = d.value || 0;
    if (value > 0) {
      const startAngle = (cumulative / (total || 1)) * 360;
      cumulative += value;
      const endAngle = (cumulative / (total || 1)) * 360;
      const path = describeArcPath(cx, cy, rOuter, rInner, startAngle, endAngle);
      slices.push({ path, color: d.color, key: idx });
    }
  });

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice) => (
          <Path 
            key={slice.key} 
            d={slice.path} 
            fill={slice.color}
          />
        ))}
      </Svg>

      {(centerLabel || subLabel) && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {centerLabel && (
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#f3f4f6' }}>{centerLabel}</Text>
          )}
          {subLabel && (
            <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{subLabel}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const AIInsightsScreen = () => {
  const [threats, setThreats] = useState([]);
  const [filteredThreats, setFilteredThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Analytics
  const [analytics, setAnalytics] = useState({
    totalThreats: 0,
    highSeverity: 0,
    mediumSeverity: 0,
    lowSeverity: 0,
    topSourceIPs: [],
    threatsByType: {},
    threatsOverTime: []
  });

  const chartColors = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchNetworkThreats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [threats, dateFilter, severityFilter, typeFilter, searchQuery]);
  
  useEffect(() => {
    calculateAnalytics();
  }, [filteredThreats]);

  const fetchNetworkThreats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getNetworkThreats(100);
      if (result.success && result.threats) {
        setThreats(result.threats);
      } else {
        throw new Error('Failed to fetch network threats');
      }
    } catch (err) {
      console.error('Error fetching network threats:', err);
      setError('Failed to load network threat data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNetworkThreats().finally(() => setRefreshing(false));
  };
    
  const applyFilters = () => {
    let filtered = [...threats];

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(threat => {
        const threatDate = new Date(threat.timestamp);
        switch (dateFilter) {
          case 'today':
            return threatDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return threatDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return threatDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(threat => threat.severity === severityFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(threat => threat.threat_type === typeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(threat => 
        threat.source_ip?.toLowerCase().includes(query) ||
        threat.destination_ip?.toLowerCase().includes(query) ||
        threat.threat_type?.toLowerCase().includes(query) ||
        threat.threat_id?.toLowerCase().includes(query)
      );
    }

    setFilteredThreats(filtered);
  };

  const calculateAnalytics = () => {
    const total = filteredThreats.length;
    const high = filteredThreats.filter(t => t.severity === 'high').length;
    const medium = filteredThreats.filter(t => t.severity === 'medium').length;
    const low = filteredThreats.filter(t => t.severity === 'low').length;

    // Top source IPs
    const ipCounts = {};
    filteredThreats.forEach(threat => {
      ipCounts[threat.source_ip] = (ipCounts[threat.source_ip] || 0) + 1;
    });
    const topIPs = Object.entries(ipCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ip, count]) => ({ ip, count }));

    // Threats by type
    const typeCounts = {};
    filteredThreats.forEach(threat => {
      typeCounts[threat.threat_type] = (typeCounts[threat.threat_type] || 0) + 1;
    });

    setAnalytics({
      totalThreats: total,
      highSeverity: high,
      mediumSeverity: medium,
      lowSeverity: low,
      topSourceIPs: topIPs,
      threatsByType: typeCounts,
    });
  };
  
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'low': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
      case 'high': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
      case 'critical': return { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7' };
      default: return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
    }
  };

  const getThreatTypes = () => {
    const types = new Set(threats.map(t => t.threat_type));
    return ['all', ...Array.from(types)];
  };

  const clearFilters = () => {
    setDateFilter('all');
    setSeverityFilter('all');
    setTypeFilter('all');
    setSearchQuery('');
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading threat analytics...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNetworkThreats}>
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
          <Text style={styles.title}>Network Threat Analytics</Text>
          <Text style={styles.subtitle}>AI-powered network threat analysis and visualization</Text>
        </View>
        
        {/* Filters */}
        <View style={styles.filtersCard}>
          {/* Search */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Search (IP, Type, ID)</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search..."
              placeholderTextColor="#9ca3af"
              style={styles.filterInput}
            />
          </View>

          {/* Date Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Time Period</Text>
            <View style={styles.filterButtonGroup}>
              {['all', 'today', 'week', 'month'].map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterButton, dateFilter === filter && styles.filterButtonActive]}
                  onPress={() => setDateFilter(filter)}
                >
                  <Text style={[styles.filterButtonText, dateFilter === filter && styles.filterButtonTextActive]}>
                    {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : filter === 'week' ? '7d' : '30d'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Severity Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Severity</Text>
            <View style={styles.filterButtonGroup}>
              {['all', 'low', 'medium', 'high'].map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterButton, severityFilter === filter && styles.filterButtonActive]}
                  onPress={() => setSeverityFilter(filter)}
                >
                  <Text style={[styles.filterButtonText, severityFilter === filter && styles.filterButtonTextActive]}>
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Type Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Threat Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterButtonGroup}>
                {getThreatTypes().map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filterButton, typeFilter === type && styles.filterButtonActive]}
                    onPress={() => setTypeFilter(type)}
                  >
                    <Text style={[styles.filterButtonText, typeFilter === type && styles.filterButtonTextActive]}>
                      {type === 'all' ? 'All' : type.toUpperCase().replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Clear Filters */}
          {(dateFilter !== 'all' || severityFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
              <Text style={styles.clearFiltersText}>✕ Clear all filters</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⚠️</Text>
            <View>
              <Text style={styles.statLabel}>Total Threats</Text>
              <Text style={styles.statValue}>{analytics.totalThreats}</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔴</Text>
            <View>
              <Text style={styles.statLabel}>High Severity</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{analytics.highSeverity}</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🟡</Text>
            <View>
              <Text style={styles.statLabel}>Medium Severity</Text>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>{analytics.mediumSeverity}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔵</Text>
            <View>
              <Text style={styles.statLabel}>Low Severity</Text>
              <Text style={[styles.statValue, { color: '#3b82f6' }]}>{analytics.lowSeverity}</Text>
            </View>
          </View>
        </View>
        
        {/* Charts */}
        {/* Threats by Type */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Threats by Type</Text>
          {Object.keys(analytics.threatsByType).length === 0 ? (
            <Text style={styles.noDataText}>No threat data available</Text>
          ) : (
            <View style={styles.chartContent}>
              <PieChart
                size={150}
                innerRadius={55}
                centerLabel={analytics.totalThreats.toString()}
                subLabel="total"
                data={Object.entries(analytics.threatsByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count], idx) => ({
                    label: (type || '').toUpperCase().replace(/_/g, ' '),
                    value: count,
                    color: chartColors[idx % chartColors.length]
                  }))}
              />
              <View style={styles.chartLegend}>
                {Object.entries(analytics.threatsByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count], idx) => {
                    const percentage = analytics.totalThreats > 0 ? (count / analytics.totalThreats * 100) : 0;
                    const color = chartColors[idx % chartColors.length];
                    return (
                      <View key={type} style={styles.legendItem}>
                        <View style={styles.legendLeft}>
                          <View style={[styles.legendColor, { backgroundColor: color }]} />
                          <Text style={styles.legendLabel} numberOfLines={1}>{(type || '').toUpperCase().replace(/_/g, ' ')}</Text>
                        </View>
                        <View style={styles.legendRight}>
                          <Text style={styles.legendValue}>{count}</Text>
                          <Text style={styles.legendPercentage}>{percentage.toFixed(1)}%</Text>
                        </View>
                      </View>
                    );
                  })}
              </View>
            </View>
          )}
        </View>

        {/* Severity Distribution */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Severity Distribution</Text>
          {analytics.totalThreats === 0 ? (
            <Text style={styles.noDataText}>No threat data available</Text>
          ) : (
            <View style={styles.chartContent}>
              <PieChart
                size={150}
                innerRadius={55}
                centerLabel={analytics.totalThreats.toString()}
                subLabel="threats"
                data={[
                  { label: 'HIGH', value: analytics.highSeverity, color: '#ef4444' },
                  { label: 'MEDIUM', value: analytics.mediumSeverity, color: '#f59e0b' },
                  { label: 'LOW', value: analytics.lowSeverity, color: '#3b82f6' }
                ]}
              />
              <View style={styles.chartLegend}>
                {[
                  { label: 'HIGH', value: analytics.highSeverity, color: '#ef4444' },
                  { label: 'MEDIUM', value: analytics.mediumSeverity, color: '#f59e0b' },
                  { label: 'LOW', value: analytics.lowSeverity, color: '#3b82f6' }
                ].map((item) => {
                  const pct = analytics.totalThreats > 0 ? (item.value / analytics.totalThreats * 100) : 0;
                  return (
                    <View key={item.label} style={styles.legendItem}>
                      <View style={styles.legendLeft}>
                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                        <Text style={styles.legendLabel}>{item.label}</Text>
                      </View>
                      <View style={styles.legendRight}>
                        <Text style={styles.legendValue}>{item.value}</Text>
                        <Text style={styles.legendPercentage}>{pct.toFixed(1)}%</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
        
        {/* Top Source IPs */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Source IPs</Text>
          {analytics.topSourceIPs.length === 0 ? (
            <Text style={styles.noDataText}>No source IP data available</Text>
          ) : (
            <View style={styles.ipList}>
              {analytics.topSourceIPs.map((item, index) => {
                const maxCount = analytics.topSourceIPs[0]?.count || 1;
                const percentage = (item.count / maxCount * 100);
                return (
                  <View key={item.ip} style={styles.ipItem}>
                    <View style={styles.ipHeader}>
                      <Text style={styles.ipAddress}>{item.ip}</Text>
                      <Text style={styles.ipCount}>{item.count} threats</Text>
                    </View>
                    <View style={styles.ipProgressBar}>
                      <View style={[styles.ipProgressFill, { width: `${percentage}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
        
        {/* Filtered Threats Table */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Filtered Threats ({filteredThreats.length})</Text>
          {filteredThreats.length === 0 ? (
            <View style={styles.noThreatsContainer}>
              <Text style={styles.noThreatsEmoji}>😊</Text>
              <Text style={styles.noThreatsText}>No threats match the current filters</Text>
            </View>
          ) : (
            <>
              {filteredThreats.slice(0, 20).map((threat) => (
                <View key={threat.threat_id} style={styles.threatRow}>
                  <View style={styles.threatRowHeader}>
                    <Text style={styles.threatId} numberOfLines={1}>{threat.threat_id}</Text>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(threat.severity).bg }]}>
                      <Text style={[styles.severityBadgeText, { color: getSeverityColor(threat.severity).text }]}>
                        {threat.severity?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.threatType}>{threat.threat_type?.toUpperCase()}</Text>
                  <View style={styles.threatIps}>
                    <Text style={styles.threatIp}>From: {threat.source_ip}</Text>
                    <Text style={styles.threatIp}>To: {threat.destination_ip}</Text>
                  </View>
                  <View style={styles.threatFooter}>
                    <Text style={styles.threatConfidence}>Confidence: {Math.round((threat.confidence || 0) * 100)}%</Text>
                    <Text style={styles.threatTimestamp}>{new Date(threat.timestamp).toLocaleString()}</Text>
                  </View>
                </View>
              ))}
              {filteredThreats.length > 20 && (
                <View style={styles.showingMore}>
                  <Text style={styles.showingMoreText}>Showing first 20 of {filteredThreats.length} threats</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    fontSize: 16,
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
    color: '#ef4444',
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
    fontSize: 14,
    color: '#9ca3af',
  },
  filtersCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  filterInput: {
    width: '100%',
    padding: 10,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
    borderRadius: 8,
    color: '#f3f4f6',
    fontSize: 14,
  },
  filterButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#d1d5db',
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  clearFiltersButton: {
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#06b6d4',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  chartCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f3f4f6',
    marginBottom: 16,
  },
  noDataText: {
    color: '#9ca3af',
    textAlign: 'center',
    padding: 20,
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  chartLegend: {
    flex: 1,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 12,
    color: '#d1d5db',
    flex: 1,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#f3f4f6',
  },
  legendPercentage: {
    fontSize: 10,
    color: '#9ca3af',
  },
  ipList: {
    gap: 12,
  },
  ipItem: {
    marginBottom: 8,
  },
  ipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ipAddress: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#d1d5db',
  },
  ipCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#f3f4f6',
  },
  ipProgressBar: {
    width: '100%',
    backgroundColor: '#374151',
    borderRadius: 4,
    height: 8,
  },
  ipProgressFill: {
    backgroundColor: '#ef4444',
    height: 8,
    borderRadius: 4,
  },
  tableCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f3f4f6',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  noThreatsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noThreatsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noThreatsText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  threatRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  threatRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  threatId: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#9ca3af',
    marginRight: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  threatType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  threatIps: {
    marginBottom: 8,
  },
  threatIp: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#d1d5db',
    marginBottom: 2,
  },
  threatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threatConfidence: {
    fontSize: 12,
    color: '#d1d5db',
  },
  threatTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  showingMore: {
    padding: 16,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    alignItems: 'center',
  },
  showingMoreText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default AIInsightsScreen;