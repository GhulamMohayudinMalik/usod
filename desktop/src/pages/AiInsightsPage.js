import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

// Simple SVG Pie/Donut Chart Component
function PieChart({ data, size = 200, innerRadius = 0, centerLabel, subLabel }) {
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
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice) => (
          <path 
            key={slice.key} 
            d={slice.path} 
            fill={slice.color}
          />
        ))}
      </svg>

      {(centerLabel || subLabel) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          {centerLabel && (
            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f3f4f6' }}>{centerLabel}</div>
          )}
          {subLabel && (
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{subLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}

const AIInsightsPage = () => {
  const [threats, setThreats] = useState([]);
  const [filteredThreats, setFilteredThreats] = useState([]);
  const [loading, setLoading] = useState(true);
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

    // Threats over time - Last 24 hours in 2-hour intervals
    const timeIntervals = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const intervalEnd = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
      const intervalStart = new Date(now.getTime() - (i + 1) * 2 * 60 * 60 * 1000);
      
      const count = filteredThreats.filter(t => {
        const tDate = new Date(t.timestamp);
        return tDate >= intervalStart && tDate < intervalEnd;
      }).length;
      
      timeIntervals.unshift({
        label: `${String(intervalStart.getHours()).padStart(2, '0')}:00`,
        count
      });
    }

    setAnalytics({
      totalThreats: total,
      highSeverity: high,
      mediumSeverity: medium,
      lowSeverity: low,
      topSourceIPs: topIPs,
      threatsByType: typeCounts,
      threatsOverTime: timeIntervals
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
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '24rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#9ca3af' }}>Loading threat analytics...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ background: 'rgba(127, 29, 29, 0.3)', color: '#f87171', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
        <p>{error}</p>
        <button 
          style={{ marginTop: '0.5rem', background: '#991b1b', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', border: 'none', color: 'white', cursor: 'pointer' }}
          onClick={fetchNetworkThreats}
          onMouseEnter={(e) => e.target.style.background = '#7f1d1d'}
          onMouseLeave={(e) => e.target.style.background = '#991b1b'}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '2rem', background: '#111827', minHeight: '100vh', color: 'white' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f3f4f6', marginBottom: '0.25rem' }}>Network Threat Analytics</h1>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>AI-powered network threat analysis and visualization</p>
      </div>
      
      {/* Filters */}
      <div style={{ background: 'rgba(31, 41, 55, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #374151', padding: '1rem', marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Search (IP, Type, ID)</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#374151', border: '1px solid #4b5563', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }}
            />
          </div>

          {/* Date Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Time Period</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#374151', border: '1px solid #4b5563', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#374151', border: '1px solid #4b5563', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }}
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Threat Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#374151', border: '1px solid #4b5563', borderRadius: '0.5rem', color: '#f3f4f6', fontSize: '0.875rem' }}
            >
              {getThreatTypes().map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.toUpperCase().replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(dateFilter !== 'all' || severityFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() => {
                setDateFilter('all');
                setSeverityFilter('all');
                setTypeFilter('all');
                setSearchQuery('');
              }}
              style={{ fontSize: '0.875rem', color: '#06b6d4', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onMouseEnter={(e) => e.target.style.color = '#22d3ee'}
              onMouseLeave={(e) => e.target.style.color = '#06b6d4'}
            >
              ✕ Clear all filters
            </button>
          </div>
        )}
      </div>
      
      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
        <div style={{ background: 'rgba(31, 41, 55, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #374151', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem' }}>⚠️</div>
            <div style={{ marginLeft: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Total Threats</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f3f4f6', margin: 0 }}>{analytics.totalThreats}</p>
            </div>
          </div>
        </div>
        
        <div style={{ background: 'rgba(31, 41, 55, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #374151', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem' }}>🔴</div>
            <div style={{ marginLeft: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>High Severity</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>{analytics.highSeverity}</p>
            </div>
          </div>
        </div>
        
        <div style={{ background: 'rgba(31, 41, 55, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #374151', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem' }}>🟡</div>
            <div style={{ marginLeft: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Medium Severity</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>{analytics.mediumSeverity}</p>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(31, 41, 55, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #374151', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem' }}>🔵</div>
            <div style={{ marginLeft: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Low Severity</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{analytics.lowSeverity}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
        
        {/* Threats by Type */}
        <div style={{ background: 'rgba(31, 41, 55, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #374151', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#f3f4f6', marginBottom: '1rem', marginTop: 0 }}>Threats by Type</h3>
          {Object.keys(analytics.threatsByType).length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No threat data available</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <PieChart
                size={200}
                innerRadius={75}
                centerLabel={analytics.totalThreats.toString()}
                subLabel={"total"}
                data={Object.entries(analytics.threatsByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count], idx) => ({
                    label: (type || '').toUpperCase().replace(/_/g, ' '),
                    value: count,
                    color: chartColors[idx % chartColors.length]
                  }))}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(analytics.threatsByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count], idx) => {
                    const percentage = analytics.totalThreats > 0 ? (count / analytics.totalThreats * 100) : 0;
                    const color = chartColors[idx % chartColors.length];
                    return (
                      <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                          <span style={{ display: 'inline-block', width: '0.75rem', height: '0.75rem', borderRadius: '0.125rem', backgroundColor: color }}></span>
                          <span style={{ fontSize: '0.875rem', color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(type || '').toUpperCase().replace(/_/g, ' ')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f3f4f6' }}>{count}</span>
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Severity Distribution */}
        <div style={{ background: 'rgba(31, 41, 55, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #374151', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#f3f4f6', marginBottom: '1rem', marginTop: 0 }}>Severity Distribution</h3>
          {analytics.totalThreats === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No threat data available</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <PieChart
                size={200}
                innerRadius={75}
                centerLabel={analytics.totalThreats.toString()}
                subLabel={"threats"}
                data={[
                  { label: 'HIGH', value: analytics.highSeverity, color: '#ef4444' },
                  { label: 'MEDIUM', value: analytics.mediumSeverity, color: '#f59e0b' },
                  { label: 'LOW', value: analytics.lowSeverity, color: '#3b82f6' }
                ]}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[{label:'HIGH', value: analytics.highSeverity, color:'#ef4444'}, {label:'MEDIUM', value: analytics.mediumSeverity, color:'#f59e0b'}, {label:'LOW', value: analytics.lowSeverity, color:'#3b82f6'}].map((item) => {
                  const pct = analytics.totalThreats > 0 ? (item.value / analytics.totalThreats * 100) : 0;
                  return (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ display: 'inline-block', width: '0.75rem', height: '0.75rem', borderRadius: '0.125rem', backgroundColor: item.color, border: '1px solid rgba(255, 255, 255, 0.1)' }}></span>
                        <span style={{ fontSize: '0.875rem', color: '#d1d5db' }}>{item.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f3f4f6' }}>{item.value}</span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Threats Over Time */}
        <div style={{ background: 'rgba(31, 41, 55, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #374151', padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#f3f4f6', marginTop: 0 }}>
            Threats Over Time
            <span style={{ fontSize: '0.875rem', color: '#9ca3af', marginLeft: '0.5rem', fontWeight: 'normal' }}>
              (Last 24 Hours)
            </span>
          </h3>
          {analytics.totalThreats === 0 ? (
            <div style={{ height: '16rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#9ca3af' }}>No threat data to display</p>
            </div>
          ) : (
            <div style={{ position: 'relative', height: '16rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, display: 'flex' }}>
                {/* Y-axis */}
                <div style={{ width: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'right', paddingRight: '0.5rem' }}>
                  {(() => {
                    const actualMax = Math.max(...analytics.threatsOverTime.map(i => i.count), 0);
                    const chartMax = actualMax + Math.max(1, Math.ceil(actualMax * 0.2));
                    const numLabels = Math.min(6, chartMax + 1);
                    const step = chartMax / (numLabels - 1);
                    
                    return [...Array(numLabels)].map((_, i) => (
                      <div key={i} style={{ flexShrink: 0, lineHeight: 1, height: 0, display: 'flex', alignItems: 'center' }}>
                        {Math.round(chartMax - (i * step))}
                      </div>
                    ));
                  })()}
                </div>
                
                {/* Chart area */}
                <div style={{ flex: 1, position: 'relative' }}>
                  {/* Grid lines */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                    {(() => {
                      const actualMax = Math.max(...analytics.threatsOverTime.map(i => i.count), 0);
                      const chartMax = actualMax + Math.max(1, Math.ceil(actualMax * 0.2));
                      const numLabels = Math.min(6, chartMax + 1);
                      
                      return [...Array(numLabels)].map((_, i) => (
                        <div key={i} style={{ borderBottom: '1px solid rgba(55, 65, 81, 0.3)', height: 0 }}></div>
                      ));
                    })()}
                  </div>
                  
                  {/* Bars */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.25rem', padding: '0 0.25rem' }}>
                    {(() => {
                      const actualMax = Math.max(...analytics.threatsOverTime.map(i => i.count), 0);
                      const chartMax = actualMax + Math.max(1, Math.ceil(actualMax * 0.2));
                      
                      return analytics.threatsOverTime.map((interval, index) => {
                        const heightPercent = chartMax > 0 ? (interval.count / chartMax) * 100 : 0;
                      
                        return (
                          <div key={index} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                            <div 
                              style={{ 
                                width: '100%', 
                                background: '#0891b2', 
                                borderTopLeftRadius: '0.25rem',
                                borderTopRightRadius: '0.25rem',
                                height: interval.count > 0 ? `${heightPercent}%` : '0',
                                minHeight: interval.count > 0 ? '4px' : '0',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              title={`${interval.count} ${interval.count === 1 ? 'threat' : 'threats'}`}
                              onMouseEnter={(e) => e.target.style.background = '#06b6d4'}
                              onMouseLeave={(e) => e.target.style.background = '#0891b2'}
                            />
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
              
              {/* X-axis */}
              <div style={{ display: 'flex', marginTop: '0.5rem', paddingLeft: '2.5rem' }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: '0.25rem', padding: '0 0.25rem' }}>
                  {analytics.threatsOverTime.map((interval, index) => (
                    <div key={index} style={{ flex: 1, fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{interval.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Top Source IPs */}
      <div style={{ background: 'rgba(31, 41, 55, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #374151', padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#f3f4f6', marginBottom: '1rem', marginTop: 0 }}>Top Source IPs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {analytics.topSourceIPs.map((item, index) => {
            const maxCount = analytics.topSourceIPs[0]?.count || 1;
            const percentage = (item.count / maxCount * 100);
            return (
              <div key={item.ip}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#d1d5db' }}>{item.ip}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f3f4f6' }}>{item.count} threats</span>
                </div>
                <div style={{ width: '100%', background: '#374151', borderRadius: '9999px', height: '0.5rem' }}>
                  <div style={{ background: '#ef4444', height: '0.5rem', borderRadius: '9999px', transition: 'width 0.3s', width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
          {analytics.topSourceIPs.length === 0 && (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No source IP data available</p>
          )}
        </div>
      </div>
      
      {/* Filtered Threats Table */}
      <div style={{ background: 'rgba(31, 41, 55, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #374151', marginTop: '2rem' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #374151' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#f3f4f6', margin: 0 }}>Filtered Threats ({filteredThreats.length})</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(55, 65, 81, 0.5)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Threat ID</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source IP</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination IP</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Severity</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</th>
              </tr>
            </thead>
            <tbody style={{ background: 'rgba(31, 41, 55, 0.3)' }}>
              {filteredThreats.slice(0, 20).map((threat) => (
                <tr key={threat.threat_id} style={{ borderBottom: '1px solid #374151' }}>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontFamily: 'monospace', color: '#9ca3af' }}>{threat.threat_id}</td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: '500', color: '#f3f4f6' }}>{threat.threat_type?.toUpperCase()}</td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontFamily: 'monospace', color: '#d1d5db' }}>{threat.source_ip}</td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontFamily: 'monospace', color: '#d1d5db' }}>{threat.destination_ip}</td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      display: 'inline-flex', 
                      fontSize: '0.75rem', 
                      lineHeight: '1.25rem', 
                      fontWeight: '600', 
                      borderRadius: '9999px',
                      background: getSeverityColor(threat.severity).bg,
                      color: getSeverityColor(threat.severity).text
                    }}>
                      {threat.severity?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#d1d5db' }}>
                    {Math.round((threat.confidence || 0) * 100)}%
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#9ca3af' }}>
                    {new Date(threat.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredThreats.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😊</div>
              <p style={{ color: '#9ca3af' }}>No threats match the current filters</p>
            </div>
          )}
          {filteredThreats.length > 20 && (
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(55, 65, 81, 0.3)', textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
              Showing first 20 of {filteredThreats.length} threats
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPage;
