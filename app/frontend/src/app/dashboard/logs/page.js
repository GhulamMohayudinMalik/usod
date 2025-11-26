'use client';

import { useState, useEffect, useRef } from 'react';
import { getData } from '@/services/api';
import Modal from '@/components/Modal';



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
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Modal state
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  
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
  
  
  // Initial fetch
  useEffect(() => {
    fetchLogs();
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
  
  // Handle modal
  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
    setShowAdditionalDetails(false);
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
          {lastUpdated && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
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
              <option value="session_created">Session Created</option>
              <option value="session_expired">Session Expired</option>
              <option value="token_refresh">Token Refresh</option>
              <option value="account_locked">Account Locked</option>
              <option value="account_unlocked">Account Unlocked</option>
              <option value="user_created">User Created</option>
              <option value="user_deleted">User Deleted</option>
              <option value="role_changed">Role Changed</option>
              <option value="settings_changed">Settings Changed</option>
              <option value="backup_created">Backup Created</option>
              <option value="backup_restored">Backup Restored</option>
              <option value="suspicious_activity">Suspicious Activity</option>
              <option value="brute_force_detected">Brute Force Detected</option>
              <option value="sql_injection_attempt">SQL Injection Attempt</option>
              <option value="xss_attempt">XSS Attempt</option>
              <option value="csrf_attempt">CSRF Attempt</option>
              <option value="ip_blocked">IP Blocked</option>
              <option value="ip_unblocked">IP Unblocked</option>
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
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No logs found matching the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr 
                    key={log.id || log._id || `log-${index}`} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.userId?.username || log.details?.username || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.ipAddress || log.ip_address || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.status ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          log.status === 'success' || log.status === 'started'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        }`}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.details?.platform === 'Mobile' || log.details?.platform === 'mobile'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                          : log.details?.platform === 'Desktop' || log.details?.platform === 'desktop'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                          : log.details?.platform === 'Web' || log.details?.platform === 'web'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
                      }`}>
                        {log.details?.platform.charAt(0).toUpperCase() + log.details?.platform.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <button 
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => handleViewDetails(log)}
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
      
      {/* Log Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timestamp
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {formatTimestamp(selectedLog.timestamp)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Action
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {selectedLog.action}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {selectedLog.userId?.username || selectedLog.details?.username || 'Unknown'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IP Address
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {selectedLog.ipAddress || selectedLog.ip_address || 'Unknown'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {selectedLog.status || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Log ID
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded font-mono">
                  {selectedLog.id || selectedLog._id || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Operating System
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {selectedLog.details?.os || selectedLog.metadata?.os || selectedLog.userAgent?.os || 'Unknown'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Browser
                </label>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {selectedLog.details?.browser || selectedLog.metadata?.browser || selectedLog.userAgent?.browser || 'Unknown'}
                </p>
              </div>
            </div>
            
            {/* Collapsible Additional Details */}
            {(selectedLog.details && Object.keys(selectedLog.details).length > 0) || 
             (selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0) || 
             (selectedLog.userAgent && Object.keys(selectedLog.userAgent).length > 0) ? (
              <div>
                <button
                  onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                  className="flex items-center justify-between w-full p-3 text-left bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Additional Details
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${showAdditionalDetails ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showAdditionalDetails && (
                  <div className="mt-2 space-y-3">
                    {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Details
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(selectedLog.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Metadata
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(selectedLog.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {selectedLog.userAgent && Object.keys(selectedLog.userAgent).length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          User Agent
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(selectedLog.userAgent, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
} 