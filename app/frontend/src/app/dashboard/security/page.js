'use client';

import { useState, useEffect } from 'react';
import { getData, postData } from '@/services/api';

export default function SecurityPage() {
  const [securityStats, setSecurityStats] = useState({
    blockedIPs: 0,
    suspiciousIPs: 0,
    totalAttempts: 0,
    activeThreats: 0
  });
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // IP management
  const [newIP, setNewIP] = useState('');
  const [blockReason, setBlockReason] = useState('manual_block');
  const [unblockReason, setUnblockReason] = useState('manual_unblock');

  // State to track permission denied
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Fetch security statistics
  const fetchSecurityStats = async () => {
    try {
      const response = await getData('/api/auth/security/stats');
      if (response.status === 403 || response.message === 'Insufficient permissions') {
        setPermissionDenied(true);
        return;
      }
      setSecurityStats(response.stats);
    } catch (error) {
      console.error('Error fetching security stats:', error);
      if (error.message?.includes('403') || error.message?.includes('Insufficient permissions') || error.message?.includes('permission')) {
        setPermissionDenied(true);
      } else {
        setError('Failed to fetch security statistics');
      }
    }
  };

  // Fetch blocked IPs
  const fetchBlockedIPs = async () => {
    try {
      const response = await getData('/api/auth/security/blocked-ips');
      if (response.status === 403 || response.message === 'Insufficient permissions') {
        setPermissionDenied(true);
        return;
      }
      setBlockedIPs(response.blockedIPs);
    } catch (error) {
      console.error('Error fetching blocked IPs:', error);
      if (error.message?.includes('403') || error.message?.includes('Insufficient permissions') || error.message?.includes('permission')) {
        setPermissionDenied(true);
      } else {
        setError('Failed to fetch blocked IPs');
      }
    }
  };

  // Block an IP address
  const handleBlockIP = async (e) => {
    e.preventDefault();
    if (!newIP.trim()) return;

    try {
      await postData('/api/auth/security/block-ip', {
        ip: newIP.trim(),
        reason: blockReason
      });

      setSuccessMessage(`IP ${newIP} has been blocked successfully`);
      setNewIP('');
      fetchBlockedIPs();
      fetchSecurityStats();
    } catch (error) {
      console.error('Error blocking IP:', error);
      setError('Failed to block IP address');
    }
  };

  // Unblock an IP address
  const handleUnblockIP = async (ip) => {
    try {
      await postData('/api/auth/security/unblock-ip', {
        ip,
        reason: unblockReason
      });

      setSuccessMessage(`IP ${ip} has been unblocked successfully`);
      fetchBlockedIPs();
      fetchSecurityStats();
    } catch (error) {
      console.error('Error unblocking IP:', error);
      setError('Failed to unblock IP address');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSecurityStats(),
        fetchBlockedIPs()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Security Management</h1>
          <p className="text-gray-400 mt-2">
            {permissionDenied
              ? 'Access restricted to administrators only'
              : 'Manage security settings and blocked IPs'
            }
          </p>
        </div>
        {!permissionDenied && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => {
              fetchSecurityStats();
              fetchBlockedIPs();
            }}
          >
            Refresh
          </button>
        )}
      </div>

      {/* Permission Denied Message */}
      {permissionDenied && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-red-300">
          You do not have permission to view security management. This feature is restricted to administrators.
        </div>
      )}

      {/* Messages - Only show if has permission */}
      {!permissionDenied && successMessage && (
        <div className="mb-4 p-4 bg-green-900/30 border border-green-500/30 text-green-400 rounded">
          {successMessage}
        </div>
      )}

      {!permissionDenied && error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-500/30 text-red-400 rounded">
          {error}
        </div>
      )}

      {/* Security Statistics - Only show if has permission */}
      {!permissionDenied && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked IPs</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{securityStats.blockedIPs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspicious IPs</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{securityStats.suspiciousIPs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Attempts</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{securityStats.totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Threats</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{securityStats.activeThreats}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IP Management - Only show if has permission */}
      {!permissionDenied && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Block IP Form */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Block IP Address</h3>
            <form onSubmit={handleBlockIP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IP Address
                </label>
                <input
                  type="text"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  placeholder="192.168.1.100"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="manual_block">Manual Block</option>
                  <option value="brute_force_attack">Brute Force Attack</option>
                  <option value="suspicious_activity">Suspicious Activity</option>
                  <option value="malicious_behavior">Malicious Behavior</option>
                  <option value="policy_violation">Policy Violation</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Block IP Address
              </button>
            </form>
          </div>

          {/* Blocked IPs List */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Blocked IP Addresses</h3>
            {blockedIPs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No IPs are currently blocked</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {blockedIPs.map((blocked, index) => {
                  // Handle both old format (string) and new format (object)
                  const ipAddress = typeof blocked === 'string' ? blocked : blocked.ip;
                  const reason = typeof blocked === 'object' ? blocked.reason : 'unknown';
                  const expiresAt = typeof blocked === 'object' && blocked.expiresAt ? new Date(blocked.expiresAt) : null;

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-md">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                          <span className="font-mono text-sm text-white">{ipAddress}</span>
                        </div>
                        <div className="ml-5 text-xs text-gray-400 mt-1">
                          <span className="capitalize">{reason.replace(/_/g, ' ')}</span>
                          {expiresAt && (
                            <span className="ml-2">• Expires: {expiresAt.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblockIP(ipAddress)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Unblock
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Information - Only show if has permission */}
      {!permissionDenied && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Security Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-semibold mb-2">Automatic Detection:</h4>
              <ul className="space-y-1">
                <li>• SQL Injection attempts</li>
                <li>• XSS attack patterns</li>
                <li>• CSRF token violations</li>
                <li>• Brute force attacks</li>
                <li>• Suspicious activity patterns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Protection Measures:</h4>
              <ul className="space-y-1">
                <li>• Automatic IP blocking</li>
                <li>• Account lockout after failed attempts</li>
                <li>• Real-time threat monitoring</li>
                <li>• Comprehensive security logging</li>
                <li>• Manual IP management</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
