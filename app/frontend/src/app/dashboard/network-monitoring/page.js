'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { postData } from '@/services/api';
import Modal from '@/components/Modal';
import { 
  PlayIcon, 
  StopIcon, 
  ShieldExclamationIcon, 
  ChartBarIcon,
  CpuChipIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function NetworkMonitoringPage() {
  const router = useRouter();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedInterface, setSelectedInterface] = useState('auto');
  const [threats, setThreats] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    byType: {}
  });
  const [selectedThreat, setSelectedThreat] = useState(null); // For detail modal
  const [blockingIP, setBlockingIP] = useState(null); // Track which IP is being blocked
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [monitoringDuration, setMonitoringDuration] = useState(0);
  const eventSourceRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Network interfaces (mock data - in real implementation, fetch from backend)
  const networkInterfaces = [
    { value: 'auto', label: 'Auto-detect' },
    { value: 'eth0', label: 'Ethernet (eth0)' },
    { value: 'wlan0', label: 'WiFi (wlan0)' },
    { value: 'lo', label: 'Loopback (lo)' }
  ];

  // Check authentication and connect to SSE stream for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return;
    }
    
    setAuthLoading(false);

    // Load threat history from MongoDB
    const loadThreatHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/network/threats/history?limit=50', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.threats) {
            console.log(`📚 Loaded ${data.threats.length} threats from history`);
            setThreats(data.threats);
            
            // Recalculate statistics
            const stats = {
              total: data.threats.length,
              high: data.threats.filter(t => t.severity === 'high').length,
              medium: data.threats.filter(t => t.severity === 'medium').length,
              low: data.threats.filter(t => t.severity === 'low').length,
              byType: {}
            };
            
            data.threats.forEach(t => {
              stats.byType[t.threat_type] = (stats.byType[t.threat_type] || 0) + 1;
            });
            
            setStatistics(stats);
          }
        }
      } catch (error) {
        console.error('❌ Failed to load threat history:', error);
      }
    };

    loadThreatHistory();

    // Check if monitoring was already active (persisted in localStorage)
    const wasMonitoring = localStorage.getItem('isMonitoring') === 'true';
    if (wasMonitoring) {
      setIsMonitoring(true);
      startDurationTimer(); // Restart the duration timer
      console.log('📡 Monitoring was active, reconnecting...');
    }

    const connectToSSE = () => {

      try {
        // Create SSE connection with token in URL (EventSource doesn't support headers)
        const eventSource = new EventSource(
          `http://localhost:5000/api/network/stream?token=${encodeURIComponent(token)}`
        );

        eventSource.onopen = () => {
          console.log('✅ SSE connection established');
          setConnectionStatus('connected');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📡 SSE message received:', data);
            console.log('📊 Message type:', data.type);
            console.log('📊 Type comparison: data.type === "threat_detected" ?', data.type === 'threat_detected');
            console.log('📦 Message data:', data.data);

            if (data.type === 'threat_detected') {
              console.log('🚨 THREAT DETECTED! Adding to list:', data.data);
              setThreats(prev => {
                const updated = [data.data, ...prev.slice(0, 49)];
                console.log('📋 Updated threats list length:', updated.length);
                console.log('📋 First threat in list:', updated[0]);
                return updated;
              });
              updateStatistics(data.data);
              console.log('✅ Threat added and statistics updated');
            } else if (data.type === 'monitoring_event') {
              console.log('📊 Monitoring event received:', data.data.type);
              if (data.data.type === 'network_monitoring_started') {
                setIsMonitoring(true);
                startDurationTimer();
              } else if (data.data.type === 'network_monitoring_stopped') {
                setIsMonitoring(false);
                stopDurationTimer();
              }
            } else if (data.type === 'heartbeat') {
              // Ignore heartbeat messages (don't log to reduce noise)
            } else if (data.type === 'connection') {
              console.log('✅ SSE connection confirmed:', data.message);
            } else {
              console.warn('⚠️ Unknown SSE message type:', data.type);
            }
          } catch (error) {
            console.error('❌ Error parsing SSE message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('❌ SSE connection error:', error);
          setConnectionStatus('disconnected');
          
          // Close the connection and try to reconnect after 5 seconds
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
          }
          
          // Retry connection after 5 seconds
          setTimeout(() => {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
              connectToSSE();
            }
          }, 5000);
        };

        eventSourceRef.current = eventSource;
      } catch (error) {
        console.error('❌ Failed to connect to SSE:', error);
        setConnectionStatus('disconnected');
      }
    };

    connectToSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [router]);

  // Start monitoring
  const startMonitoring = async () => {
    try {
      setLoading(true);
      const result = await postData('/api/network/start-monitoring', {
        interface: selectedInterface,
        duration: 300 // 5 minutes default
      });

      const startTime = Date.now();
      setIsMonitoring(true);
      setMonitoringDuration(0);
      localStorage.setItem('isMonitoring', 'true'); // Persist state
      localStorage.setItem('monitoringStartTime', startTime.toString()); // Persist start time
      startDurationTimer();
      console.log('✅ Monitoring started:', result);
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      alert('Failed to start monitoring: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Stop monitoring
  const stopMonitoring = async () => {
    try {
      setLoading(true);
      const result = await postData('/api/network/stop-monitoring', {});

      setIsMonitoring(false);
      setMonitoringDuration(0);
      stopDurationTimer();
      localStorage.removeItem('isMonitoring'); // Clear persisted state
      localStorage.removeItem('monitoringStartTime'); // Clear start time
      console.log('✅ Monitoring stopped:', result);
    } catch (error) {
      console.error('❌ Failed to stop monitoring:', error);
      alert('Failed to stop monitoring: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update statistics when new threat is detected
  const updateStatistics = (threat) => {
    setStatistics(prev => ({
      total: prev.total + 1,
      high: threat.severity === 'high' ? prev.high + 1 : prev.high,
      medium: threat.severity === 'medium' ? prev.medium + 1 : prev.medium,
      low: threat.severity === 'low' ? prev.low + 1 : prev.low,
      byType: {
        ...prev.byType,
        [threat.threat_type]: (prev.byType[threat.threat_type] || 0) + 1
      }
    }));
  };

  // Block IP address
  const handleBlockIP = async (threat) => {
    if (!confirm(`Block IP ${threat.source_ip}?\n\nThis will prevent all traffic from this address.`)) {
      return;
    }

    try {
      setBlockingIP(threat.source_ip);
      const response = await fetch('http://localhost:5000/api/auth/security/block-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ip: threat.source_ip,
          reason: `network_threat_${threat.threat_type}`,
          threatId: threat.threat_id,
          severity: threat.severity
        })
      });

      if (response.ok) {
        alert(`✅ IP ${threat.source_ip} has been blocked successfully!`);
      } else {
        const error = await response.json();
        alert(`❌ Failed to block IP: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error blocking IP:', error);
      alert(`❌ Failed to block IP: ${error.message}`);
    } finally {
      setBlockingIP(null);
    }
  };

  // Open threat details
  const handleInvestigate = (threat) => {
    setSelectedThreat(threat);
  };

  // Duration timer
  const startDurationTimer = () => {
    const startTime = parseInt(localStorage.getItem('monitoringStartTime') || Date.now());
    
    // Update duration immediately
    const updateDuration = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setMonitoringDuration(elapsed);
    };
    
    updateDuration(); // Initial update
    durationIntervalRef.current = setInterval(updateDuration, 1000);
  };

  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'low': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-700/30';
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">AI Network Monitoring</h1>
          <p className="text-sm text-gray-400">Real-time AI-powered network threat detection and analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-400">
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
      {/* Monitoring Controls */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Network Interface
              </label>
              <select
                value={selectedInterface}
                onChange={(e) => setSelectedInterface(e.target.value)}
                className="block w-48 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isMonitoring}
              >
                {networkInterfaces.map(iface => (
                  <option key={iface.value} value={iface.value}>
                    {iface.label}
                  </option>
                ))}
              </select>
            </div>
            
            {isMonitoring && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <ClockIcon className="w-4 h-4" />
                <span>Duration: {formatDuration(monitoringDuration)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!isMonitoring ? (
              <button
                onClick={startMonitoring}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Start Monitoring
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={stopMonitoring}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Stopping...
                  </>
                ) : (
                  <>
                    <StopIcon className="w-4 h-4 mr-2" />
                    Stop Monitoring
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldExclamationIcon className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Threats</p>
              <p className="text-2xl font-bold text-gray-100">{statistics.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">High Severity</p>
              <p className="text-2xl font-bold text-red-400">{statistics.high}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Medium Severity</p>
              <p className="text-2xl font-bold text-yellow-400">{statistics.medium}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Low Severity</p>
              <p className="text-2xl font-bold text-green-400">{statistics.low}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Threat Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Threats List */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-gray-100">Live Threat Feed</h3>
            <p className="text-sm text-gray-400">Real-time threat detection updates</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {threats.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <ShieldExclamationIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No threats detected yet</p>
                <p className="text-sm">Start monitoring to see real-time threats</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {threats.map((threat, index) => (
                  <div key={threat.threat_id || index} className="p-4 hover:bg-gray-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-100">
                            {threat.threat_type?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                            {threat.severity?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p><span className="font-medium">Source:</span> {threat.source_ip}</p>
                          <p><span className="font-medium">Destination:</span> {threat.destination_ip}</p>
                          <p><span className="font-medium">Confidence:</span> {Math.round((threat.confidence || 0) * 100)}%</p>
                          <p><span className="font-medium">Time:</span> {new Date(threat.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => handleBlockIP(threat)}
                          disabled={blockingIP === threat.source_ip}
                          className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {blockingIP === threat.source_ip ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400 mr-1"></div>
                              Blocking...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              Block IP
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => handleInvestigate(threat)}
                          className="px-3 py-1 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 rounded text-xs font-medium transition-colors flex items-center justify-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Network Flow Visualization */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-gray-100">Network Flow</h3>
            <p className="text-sm text-gray-400">Real-time network traffic visualization</p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-64 bg-gray-700/50 rounded-lg">
              <div className="text-center text-gray-400">
                <CpuChipIcon className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p>Network flow visualization</p>
                <p className="text-sm">Coming soon in next iteration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Details Modal */}
      <Modal
        isOpen={!!selectedThreat}
        onClose={() => setSelectedThreat(null)}
        title={
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">Threat Details</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedThreat?.threat_id}</div>
          </div>
        }
        size="lg"
      >
        {selectedThreat && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Threat Type</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">{selectedThreat.threat_type?.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Severity</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedThreat.severity)}`}>
                    {selectedThreat.severity?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Confidence</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">{Math.round((selectedThreat.confidence || 0) * 100)}%</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timestamp</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">{new Date(selectedThreat.timestamp).toLocaleString()}</p>
              </div>
            </div>

            {/* Network Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Network Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Source IP</label>
                  <p className="text-gray-900 dark:text-gray-100 font-mono mt-1">{selectedThreat.source_ip}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Source Port</label>
                  <p className="text-gray-900 dark:text-gray-100 font-mono mt-1">{selectedThreat.source_port || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Destination IP</label>
                  <p className="text-gray-900 dark:text-gray-100 font-mono mt-1">{selectedThreat.destination_ip}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Destination Port</label>
                  <p className="text-gray-900 dark:text-gray-100 font-mono mt-1">{selectedThreat.destination_port || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Protocol</label>
                  <p className="text-gray-900 dark:text-gray-100 font-mono mt-1">{selectedThreat.protocol || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* ML Model Details */}
            {selectedThreat.details && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ML Model Analysis</h4>
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Random Forest</label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">
                        Prediction: {selectedThreat.details.rf_prediction === 1 ? 'Attack' : 'Normal'}
                        <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({Math.round((selectedThreat.details.rf_confidence || 0) * 100)}%)</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Isolation Forest</label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">
                        Prediction: {selectedThreat.details.iso_prediction === -1 ? 'Anomaly' : 'Normal'}
                        <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">(Score: {selectedThreat.details.iso_score?.toFixed(4)})</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Flow Duration</label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedThreat.details.flow_duration?.toFixed(2)}s</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Packet Count</label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedThreat.details.packet_count || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Byte Count</label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedThreat.details.byte_count || 'N/A'} bytes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex space-x-3">
              <button
                onClick={() => {
                  handleBlockIP(selectedThreat);
                  setSelectedThreat(null);
                }}
                disabled={blockingIP === selectedThreat.source_ip}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {blockingIP === selectedThreat.source_ip ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Blocking IP...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Block Source IP
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
