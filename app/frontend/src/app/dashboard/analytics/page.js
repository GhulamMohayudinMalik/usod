'use client';

import { useState, useEffect } from 'react';
import { getData } from '@/services/api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    securityEvents: [],
    loginAttempts: [],
    logs: [],
    stats: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [stats, securityEvents, loginAttempts, logsResponse] = await Promise.all([
        getData('/api/data/dashboard-stats'),
        getData('/api/data/security-events?count=50'),
        getData('/api/data/login-attempts?count=50'),
        getData('/api/logs?limit=20')
      ]);
      
      setAnalytics({
        securityEvents,
        loginAttempts,
        logs: logsResponse.logs || [],
        stats
      });
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  // Calculate analytics metrics
  const calculateMetrics = () => {
    const { securityEvents = [], loginAttempts = [] } = analytics;
    
    // Security events by type
    const eventsByType = securityEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});
    
    // Security events by severity
    const eventsBySeverity = securityEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {});
    
    // Login attempts success rate
    const successfulLogins = loginAttempts.filter(attempt => attempt.successful).length;
    const loginSuccessRate = loginAttempts.length > 0 ? (successfulLogins / loginAttempts.length) * 100 : 0;
    
    // Recent activity (last 24 hours)
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = securityEvents.filter(event => 
      new Date(event.timestamp) > last24Hours
    ).length;
    
    const recentLogins = loginAttempts.filter(attempt => 
      new Date(attempt.timestamp) > last24Hours
    ).length;
    
    return {
      eventsByType,
      eventsBySeverity,
      loginSuccessRate,
      recentEvents,
      recentLogins,
      totalEvents: securityEvents.length,
      totalLogins: loginAttempts.length
    };
  };
  
  const metrics = calculateMetrics();
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Security insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={fetchAnalytics}
          >
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Total Security Events</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{metrics.totalEvents}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 24h: {metrics.recentEvents}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Login Attempts</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{metrics.totalLogins}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 24h: {metrics.recentLogins}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Login Success Rate</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {metrics.loginSuccessRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Successful logins</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Security Score</h3>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {analytics.stats?.securityScore || 0}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall security posture</p>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Events by Type */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Events by Type</h3>
              <div className="space-y-3">
                {Object.entries(metrics.eventsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / metrics.totalEvents) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Security Events by Severity */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Events by Severity</h3>
              <div className="space-y-3">
                {Object.entries(metrics.eventsBySeverity).map(([severity, count]) => {
                  const colors = {
                    low: 'bg-green-500',
                    medium: 'bg-yellow-500',
                    high: 'bg-orange-500',
                    critical: 'bg-red-500'
                  };
                  
                  return (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {severity}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`${colors[severity] || 'bg-gray-500'} h-2 rounded-full`}
                            style={{ width: `${(count / metrics.totalEvents) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action/Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {(() => {
                    // Combine security events and logs, sort by timestamp
                    const combinedActivity = [
                      ...(analytics.securityEvents || []).slice(0, 5).map(event => ({
                        ...event,
                        activityType: 'security_event',
                        displayType: 'Security Event',
                        displayAction: event.type?.replace('_', ' ') || 'Security Event',
                        displaySource: event.source,
                        displayDetails: event.description,
                        severity: event.severity
                      })),
                      ...(analytics.logs || []).slice(0, 5).map(log => ({
                        ...log,
                        activityType: 'log',
                        displayType: 'System Log',
                        displayAction: log.action || 'System Action',
                        displaySource: log.ipAddress || 'Unknown',
                        displayDetails: log.details?.description || log.action || 'System activity',
                        severity: log.status === 'failure' ? 'medium' : 'low'
                      }))
                    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10);

                    return combinedActivity.map((item, index) => (
                      <tr key={`${item.activityType}-${item.id || item._id || index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.activityType === 'security_event' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {item.displayType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                          {item.displayAction}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.displaySource}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {item.displayDetails}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}