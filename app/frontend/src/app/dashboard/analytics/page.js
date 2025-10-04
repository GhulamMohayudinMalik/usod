'use client';

import { useState, useEffect, useRef } from 'react';
// import { getData } from '@/services/api';



export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [realtime, setRealtime] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const pollingInterval = useRef(null);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: ''
  });
  
  // Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (filters.action) {
        params.append('action', filters.action);
      }
      
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
  const response = await getData(`/api/logs?${params.toString()}`);
      
      setLogs(response.logs);
      setPagination(response.pagination);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs. Please try again later.');
      setLoading(false);
    }
  };
  
  // Check for new logs
  const checkForNewLogs = async () => {
    try {
      // Build query for most recent logs
      const params = new URLSearchParams({
        page: "1",
        limit: "5"
      });
      
  const response = await getData(`/api/logs?${params.toString()}`);
      
      // Compare the most recent log with our current most recent log
      if (logs.length > 0 && response.logs.length > 0) {
        const mostRecentFetchedLogTime = new Date(response.logs[0].timestamp).getTime();
        const mostRecentCurrentLogTime = new Date(logs[0].timestamp).getTime();
        
        if (mostRecentFetchedLogTime > mostRecentCurrentLogTime) {
          // We have new logs, get the full updated list
          fetchLogs();
          
          // Play a notification sound if available
          const notificationSound = document.getElementById('notification-sound');
          if (notificationSound) {
            notificationSound.play().catch(e => console.log('Could not play notification sound', e));
          }
        }
      } else if (logs.length === 0 && response.logs.length > 0) {
        // Initial load
        fetchLogs();
      }
    } catch (err) {
      console.error('Error checking for new logs:', err);
    }
  };
  
  // Toggle real-time updates
  const toggleRealtime = () => {
    const newRealtimeState = !realtime;
    setRealtime(newRealtimeState);
    
    if (newRealtimeState) {
      // Start polling every 5 seconds
      pollingInterval.current = setInterval(checkForNewLogs, 5000);
    } else if (pollingInterval.current) {
      // Stop polling
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchLogs();
    
    // Cleanup polling interval on component unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [pagination.page, pagination.limit]);
  
  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      action: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
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
    <div className="p-6">
      {/* Hidden audio element for notification sound */}
      <audio id="notification-sound" preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Security Logs</h1>
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${
              realtime 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={toggleRealtime}
          >
            {realtime ? 'Real-time: ON' : 'Real-time: OFF'}
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={fetchLogs}
          >
            Refresh
          </button>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
            <select 
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="security_event">Security Event</option>
              <option value="password_change">Password Change</option>
              <option value="profile_update">Profile Update</option>
              <option value="access_denied">Access Denied</option>
              <option value="system_error">System Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input 
              type="date" 
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input 
              type="date" 
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button 
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={resetFilters}
          >
            Reset
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={applyFilters}
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {/* Activity Indicator */}
      {realtime && (
        <div className="mb-4 flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            realtime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {realtime ? 'Listening for new logs...' : 'Real-time updates disabled'}
          </span>
        </div>
      )}
      
      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No logs found matching the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr 
                    key={log.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      index === 0 && realtime ? 'animate-highlight' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.username || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.ipAddress || log.ip_address || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.status ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          log.status === 'success' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        }`}>
                          {log.status}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <button 
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => {
                          alert(JSON.stringify(log.details || {}, null, 2));
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && pagination.totalPages > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        @keyframes highlight {
          0% {
            background-color: rgba(59, 130, 246, 0.2);
          }
          100% {
            background-color: transparent;
          }
        }
        
        .animate-highlight {
          animation: highlight 3s ease-out;
        }
      `}</style>
    </div>
  );
} 