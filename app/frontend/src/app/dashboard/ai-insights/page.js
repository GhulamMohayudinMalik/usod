'use client';

import { useState, useEffect } from 'react';
import { getData } from '@/services/api';

// Simple reusable SVG Pie/Donut Chart (no external deps)
function PieChart({ data, size = 220, innerRadius = 0, centerLabel, subLabel }) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const radius = size / 2;
  const rOuter = radius - 2; // small padding
  const rInner = Math.max(0, Math.min(innerRadius, rOuter - 4));

  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians)
    };
  };

  const describeArcPath = (cx, cy, rOuter, rInner, startAngle, endAngle) => {
    // Handle full circle (or very close to it)
    const angleDiff = endAngle - startAngle;
    const isFullCircle = angleDiff >= 359.9;
    
    if (isFullCircle) {
      // For full circle, draw two semicircles to avoid SVG rendering issues
      if (rInner <= 0) {
        // Full pie
        return [
          `M ${cx} ${cy}`,
          `m 0 ${-rOuter}`,
          `a ${rOuter} ${rOuter} 0 1 1 0 ${2 * rOuter}`,
          `a ${rOuter} ${rOuter} 0 1 1 0 ${-2 * rOuter}`,
          'Z'
        ].join(' ');
      } else {
        // Full donut
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
      // Simple pie slice
      const start = polarToCartesian(cx, cy, rOuter, startAngle);
      const end = polarToCartesian(cx, cy, rOuter, endAngle);
      return [
        `M ${cx} ${cy}`,
        `L ${start.x} ${start.y}`,
        `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
        'Z'
      ].join(' ');
    }

    // Donut slice (ring segment)
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

  // Calculate cumulative angles for each slice
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
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice) => (
          <path 
            key={slice.key} 
            d={slice.path} 
            fill={slice.color}
          />
        ))}
      </svg>

      {/* Center labels */}
      {(centerLabel || subLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          {centerLabel && (
            <div className="text-xl font-semibold text-gray-100">{centerLabel}</div>
          )}
          {subLabel && (
            <div className="text-xs text-gray-400 mt-1">{subLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}

function AIInsightsPage() {
  const [threats, setThreats] = useState([]);
  const [filteredThreats, setFilteredThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Analytics data
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
      const response = await fetch('http://localhost:5000/api/network/threats/history?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setThreats(data.threats || []);
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
    
    // Always use 2-hour intervals for the last 24 hours (12 intervals)
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
      case 'low': return 'bg-blue-400/10 text-blue-400';
      case 'medium': return 'bg-yellow-400/10 text-yellow-400';
      case 'high': return 'bg-red-400/10 text-red-400';
      case 'critical': return 'bg-purple-400/10 text-purple-400';
      default: return 'bg-gray-400/10 text-gray-400';
    }
  };

  const getThreatTypes = () => {
    const types = new Set(threats.map(t => t.threat_type));
    return ['all', ...Array.from(types)];
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading threat analytics...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-900/30 text-red-400 p-4 rounded-md mb-6">
        <p>{error}</p>
        <button 
          className="mt-2 bg-red-800 px-3 py-1 rounded-md text-sm hover:bg-red-700"
          onClick={fetchNetworkThreats}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">Network Threat Analytics</h1>
        <p className="mt-1 text-sm text-gray-400">AI-powered network threat analysis and visualization</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Search (IP, Type, ID)</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            />
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Time Period</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Threat Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
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
          <div className="mt-4">
            <button
              onClick={() => {
                setDateFilter('all');
                setSeverityFilter('all');
                setTypeFilter('all');
                setSearchQuery('');
              }}
              className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all filters
            </button>
          </div>
        )}
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Threats</p>
              <p className="text-2xl font-bold text-gray-100">{analytics.totalThreats}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
                <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">High Severity</p>
              <p className="text-2xl font-bold text-red-400">{analytics.highSeverity}</p>
            </div>
          </div>
                </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Medium Severity</p>
              <p className="text-2xl font-bold text-yellow-400">{analytics.mediumSeverity}</p>
            </div>
                </div>
              </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Low Severity</p>
              <p className="text-2xl font-bold text-blue-400">{analytics.lowSeverity}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        

        {/* Threats by Type - Donut + Legend */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-100 mb-4">Threats by Type</h3>
          {Object.keys(analytics.threatsByType).length === 0 ? (
            <p className="text-gray-400 text-center py-8">No threat data available</p>
          ) : (
            <div className="flex items-center gap-6">
              <PieChart
                size={240}
                innerRadius={90}
                centerLabel={analytics.totalThreats}
                subLabel={"total"}
                data={Object.entries(analytics.threatsByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count], idx) => ({
                    label: (type || '').toUpperCase().replace(/_/g, ' '),
                    value: count,
                    color: chartColors[idx % chartColors.length]
                  }))}
              />
              <div className="flex-1 space-y-3">
                {Object.entries(analytics.threatsByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count], idx) => {
                    const percentage = analytics.totalThreats > 0 ? (count / analytics.totalThreats * 100) : 0;
                    const color = chartColors[idx % chartColors.length];
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></span>
                          <span className="text-sm text-gray-300 truncate">{(type || '').toUpperCase().replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-100">{count}</span>
                          <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Severity Distribution - Pie */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-100 mb-4">Severity Distribution</h3>
          {analytics.totalThreats === 0 ? (
            <p className="text-gray-400 text-center py-8">No threat data available</p>
          ) : (
            <div className="flex items-center gap-6">
              <PieChart
                size={240}
                innerRadius={90}
                centerLabel={analytics.totalThreats}
                subLabel={"threats"}
                data={[
                  { label: 'HIGH', value: analytics.highSeverity, color: '#ef4444' },
                  { label: 'MEDIUM', value: analytics.mediumSeverity, color: '#f59e0b' },
                  { label: 'LOW', value: analytics.lowSeverity, color: '#3b82f6' }
                ]}
              />
              <div className="flex-1 space-y-3">
                {[{label:'HIGH', value: analytics.highSeverity, color:'#ef4444'}, {label:'MEDIUM', value: analytics.mediumSeverity, color:'#f59e0b'}, {label:'LOW', value: analytics.lowSeverity, color:'#3b82f6'}].map((item) => {
                  const pct = analytics.totalThreats > 0 ? (item.value / analytics.totalThreats * 100) : 0;
                  return (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-sm ring-1 ring-white/10" style={{ backgroundColor: item.color }}></span>
                        <span className="text-sm text-gray-300">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-100">{item.value}</span>
                        <span className="text-xs text-gray-400">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Threats Over Time - Simple Bar Chart */}
        <div className="bg-gray-800/50 lg:col-span-2 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-100 mb-4">
            Threats Over Time
            <span className="text-sm text-gray-400 ml-2 font-normal">
              (Last 24 Hours)
            </span>
          </h3>
          {analytics.totalThreats === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-400">No threat data to display</p>
            </div>
          ) : (
            <div className="relative h-64 flex flex-col">
              {/* Main chart area with Y-axis */}
              <div className="flex-1 flex">
                {/* Y-axis labels */}
                <div className="w-10 flex flex-col justify-between text-xs text-gray-400 text-right pr-2">
                  {(() => {
                    const actualMax = Math.max(...analytics.threatsOverTime.map(i => i.count), 0);
                    const chartMax = actualMax + Math.max(1, Math.ceil(actualMax * 0.2));
                    const numLabels = Math.min(6, chartMax + 1);
                    const step = chartMax / (numLabels - 1);
                    
                    return [...Array(numLabels)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 leading-none h-0 flex items-center">
                        {Math.round(chartMax - (i * step))}
                      </div>
                    ));
                  })()}
                </div>
                
                {/* Chart area with grid and bars */}
                <div className="flex-1 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {(() => {
                      const actualMax = Math.max(...analytics.threatsOverTime.map(i => i.count), 0);
                      const chartMax = actualMax + Math.max(1, Math.ceil(actualMax * 0.2));
                      const numLabels = Math.min(6, chartMax + 1);
                      
                      return [...Array(numLabels)].map((_, i) => (
                        <div key={i} className="border-b border-gray-700/30 h-0"></div>
                      ));
                    })()}
                  </div>
                  
                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-between gap-1 px-1">
                    {(() => {
                      const actualMax = Math.max(...analytics.threatsOverTime.map(i => i.count), 0);
                      const chartMax = actualMax + Math.max(1, Math.ceil(actualMax * 0.2));
                      
                      return analytics.threatsOverTime.map((interval, index) => {
                        const heightPercent = chartMax > 0 ? (interval.count / chartMax) * 100 : 0;
                      
                        return (
                          <div key={index} className="flex-1 h-full flex items-end">
                            {/* Bar */}
                            <div 
                              className="w-full bg-cyan-600 rounded-t hover:bg-cyan-500 transition-all relative group cursor-pointer" 
                              style={{ 
                                height: interval.count > 0 ? `${heightPercent}%` : '0',
                                minHeight: interval.count > 0 ? '4px' : '0'
                              }}
                            >
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-700 px-2 py-1 rounded text-xs text-gray-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                {interval.count} {interval.count === 1 ? 'threat' : 'threats'}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
              
              {/* X-axis labels */}
              <div className="flex mt-2 pl-10">
                <div className="flex-1 flex justify-between gap-1 px-1">
                  {analytics.threatsOverTime.map((interval, index) => (
                    <div key={index} className="flex-1 text-xs text-gray-400 text-center">
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{interval.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Top Source IPs - Bar Chart */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-100 mb-4">Top Source IPs</h3>
        <div className="space-y-3">
          {analytics.topSourceIPs.map((item, index) => {
            const maxCount = analytics.topSourceIPs[0]?.count || 1;
            const percentage = (item.count / maxCount * 100);
            return (
              <div key={item.ip}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono text-gray-300">{item.ip}</span>
                  <span className="text-sm font-medium text-gray-100">{item.count} threats</span>
                  </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
            );
          })}
          {analytics.topSourceIPs.length === 0 && (
            <p className="text-gray-400 text-center py-8">No source IP data available</p>
          )}
        </div>
      </div>
      
      {/* Recent Threats Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-gray-100">Filtered Threats ({filteredThreats.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Threat ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Source IP</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Destination IP</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Severity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Confidence</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/30 divide-y divide-gray-700">
              {filteredThreats.slice(0, 20).map((threat) => (
                <tr key={threat.threat_id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">{threat.threat_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{threat.threat_type?.toUpperCase()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">{threat.source_ip}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">{threat.destination_ip}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(threat.severity)}`}>
                      {threat.severity?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {Math.round((threat.confidence || 0) * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(threat.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredThreats.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400">No threats match the current filters</p>
            </div>
          )}
          {filteredThreats.length > 20 && (
            <div className="px-6 py-4 bg-gray-700/30 text-center text-sm text-gray-400">
              Showing first 20 of {filteredThreats.length} threats
        </div>
          )}
        </div>
      </div>
    </div>
  );
} 

export default AIInsightsPage;
