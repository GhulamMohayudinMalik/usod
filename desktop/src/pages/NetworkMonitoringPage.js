import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';
import Modal from '../components/Modal';

const NetworkMonitoringPage = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [threats, setThreats] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [monitoringDuration, setMonitoringDuration] = useState(0);
  const [blockingIP, setBlockingIP] = useState(null);
  const durationIntervalRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    loadThreatHistory();
    
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const loadThreatHistory = async () => {
    try {
      const result = await apiService.getNetworkThreats(50);
      if (result.success && result.threats) {
        console.log(`Loaded ${result.threats.length} threats from history`);
        setThreats(result.threats);
        calculateStatistics(result.threats);
      }
    } catch (error) {
      console.error('Failed to load threat history:', error);
    }
  };

  const calculateStatistics = (threatsList) => {
    const stats = {
      total: threatsList.length,
      high: threatsList.filter(t => t.severity === 'high').length,
      medium: threatsList.filter(t => t.severity === 'medium').length,
      low: threatsList.filter(t => t.severity === 'low').length
    };
    setStatistics(stats);
  };

  const startMonitoring = async () => {
    try {
      setLoading(true);
      const result = await apiService.startNetworkMonitoring('auto', 300);

      if (result.success) {
        setIsMonitoring(true);
        setMonitoringDuration(0);
        startDurationTimer();
        startPolling();
        console.log('✅ Monitoring started');
      } else {
        alert(`Failed to start monitoring: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      alert(`Failed to start monitoring: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    try {
      setLoading(true);
      const result = await apiService.stopNetworkMonitoring();

      if (result.success) {
        setIsMonitoring(false);
        setMonitoringDuration(0);
        stopDurationTimer();
        stopPolling();
        console.log('✅ Monitoring stopped');
      } else {
        alert(`Failed to stop monitoring: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to stop monitoring:', error);
      alert(`Failed to stop monitoring: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startDurationTimer = () => {
    const startTime = Date.now();
    const updateDuration = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setMonitoringDuration(elapsed);
    };
    updateDuration();
    durationIntervalRef.current = setInterval(updateDuration, 1000);
  };

  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const startPolling = () => {
    // Poll for new threats every 5 seconds
    pollIntervalRef.current = setInterval(async () => {
      await loadThreatHistory();
    }, 5000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
      case 'medium': return { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' };
      case 'low': return { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' };
      default: return { color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const handleBlockIP = async (threat) => {
    if (!confirm(`Block IP ${threat.source_ip}?\n\nThis will prevent all traffic from this address.`)) {
      return;
    }

    try {
      setBlockingIP(threat.source_ip);
      const result = await apiService.blockIP(threat.source_ip, `network_threat_${threat.threat_type}`);

      if (result.success) {
        alert(`✅ IP ${threat.source_ip} has been blocked successfully!`);
      } else {
        alert(`❌ Failed to block IP: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error blocking IP:', error);
      alert(`❌ Failed to block IP: ${error.message}`);
    } finally {
      setBlockingIP(null);
    }
  };

  const handleInvestigate = (threat) => {
    setSelectedThreat(threat);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedThreat(null);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', margin: 0, marginBottom: '0.25rem' }}>
              AI Network Monitoring
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
              Real-time AI-powered network threat detection and analysis
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '0.75rem',
              height: '0.75rem',
              borderRadius: '50%',
              backgroundColor: connectionStatus === 'connected' ? '#10b981' : '#ef4444'
            }}></div>
            <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Monitoring Controls */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid rgba(55, 65, 81, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db', marginBottom: '0.5rem' }}>
                Network Interface
              </label>
              <select
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '0.375rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
                disabled={isMonitoring}
              >
                <option value="auto">Auto-detect</option>
                <option value="eth0">Ethernet (eth0)</option>
                <option value="wlan0">WiFi (wlan0)</option>
                <option value="lo">Loopback (lo)</option>
              </select>
            </div>

            {isMonitoring && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                <span>⏱️</span>
                <span>Duration: {formatDuration(monitoringDuration)}</span>
              </div>
            )}
          </div>

          <div>
            {!isMonitoring ? (
              <button
                onClick={startMonitoring}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem',
                  background: loading ? '#6b7280' : 'linear-gradient(to right, #10b981, #06b6d4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: loading ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Starting...' : '▶️ Start Monitoring'}
              </button>
            ) : (
              <button
                onClick={stopMonitoring}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem',
                  background: loading ? '#6b7280' : 'linear-gradient(to right, #ef4444, #ec4899)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: loading ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Stopping...' : '⏹️ Stop Monitoring'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          border: '1px solid rgba(55, 65, 81, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', marginRight: '1rem' }}>🛡️</div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Total Threats</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{statistics.total}</p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          border: '1px solid rgba(55, 65, 81, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', marginRight: '1rem' }}>⚠️</div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>High Severity</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>{statistics.high}</p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          border: '1px solid rgba(55, 65, 81, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', marginRight: '1rem' }}>⚡</div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Medium Severity</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>{statistics.medium}</p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.8)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          border: '1px solid rgba(55, 65, 81, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', marginRight: '1rem' }}>✅</div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9ca3af', margin: 0 }}>Low Severity</p>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{statistics.low}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Threat Feed */}
      <div style={{
        background: 'rgba(31, 41, 55, 0.8)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        border: '1px solid rgba(55, 65, 81, 0.3)'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Live Threat Feed
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
          Real-time threat detection updates
        </p>

        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem' }}>
          {threats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
              <p style={{ marginBottom: '0.5rem' }}>No threats detected yet</p>
              <p style={{ fontSize: '0.875rem' }}>Start monitoring to see real-time threats</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {threats.map((threat, index) => {
                const severityStyle = getSeverityColor(threat.severity);
                return (
                  <div key={threat.threat_id || index} style={{
                    background: severityStyle.bgColor,
                    border: `1px solid ${severityStyle.color}33`,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>
                            {threat.threat_type?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            background: severityStyle.color,
                            color: 'white'
                          }}>
                            {threat.severity?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#d1d5db', lineHeight: '1.5' }}>
                          <p style={{ margin: '0.25rem 0' }}><strong>Source:</strong> {threat.source_ip}</p>
                          <p style={{ margin: '0.25rem 0' }}><strong>Destination:</strong> {threat.destination_ip}</p>
                          <p style={{ margin: '0.25rem 0' }}><strong>Confidence:</strong> {Math.round((threat.confidence || 0) * 100)}%</p>
                          <p style={{ margin: '0.25rem 0' }}><strong>Time:</strong> {new Date(threat.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleBlockIP(threat)}
                          disabled={blockingIP === threat.source_ip}
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: blockingIP === threat.source_ip ? '#6b7280' : 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '0.375rem',
                            cursor: blockingIP === threat.source_ip ? 'not-allowed' : 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => !blockingIP && (e.target.style.background = 'rgba(239, 68, 68, 0.3)')}
                          onMouseLeave={(e) => !blockingIP && (e.target.style.background = 'rgba(239, 68, 68, 0.2)')}
                        >
                          {blockingIP === threat.source_ip ? 'Blocking...' : '🚫 Block IP'}
                        </button>
                        <button
                          onClick={() => handleInvestigate(threat)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#3b82f6',
                            border: '1px solid #3b82f6',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.3)'}
                          onMouseLeave={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.2)'}
                        >
                          🔍 Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Threat Details Modal */}
      <Modal
        isOpen={isModalOpen && selectedThreat}
        onClose={closeModal}
        title="Threat Details"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {
                handleBlockIP(selectedThreat);
                closeModal();
              }}
              disabled={blockingIP === selectedThreat?.source_ip}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                background: blockingIP === selectedThreat?.source_ip ? '#6b7280' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: blockingIP === selectedThreat?.source_ip ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !blockingIP && (e.target.style.background = '#dc2626')}
              onMouseLeave={(e) => !blockingIP && (e.target.style.background = '#ef4444')}
            >
              {blockingIP === selectedThreat?.source_ip ? 'Blocking IP...' : '🚫 Block Source IP'}
            </button>
          </div>
        }
      >
        {selectedThreat && (
          <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Threat Type
                  </label>
                  <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>{selectedThreat.threat_type?.toUpperCase()}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Severity
                  </label>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    background: getSeverityColor(selectedThreat.severity).color,
                    color: 'white'
                  }}>
                    {selectedThreat.severity?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Confidence
                  </label>
                  <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>
                    {Math.round((selectedThreat.confidence || 0) * 100)}%
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Timestamp
                  </label>
                  <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>
                    {new Date(selectedThreat.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(55, 65, 81, 0.3)', paddingTop: '1rem', marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#d1d5db', marginBottom: '0.75rem' }}>
                  Network Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Source IP
                    </label>
                    <p style={{ color: 'white', fontFamily: 'monospace', margin: 0 }}>{selectedThreat.source_ip}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Source Port
                    </label>
                    <p style={{ color: 'white', fontFamily: 'monospace', margin: 0 }}>
                      {selectedThreat.source_port || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Destination IP
                    </label>
                    <p style={{ color: 'white', fontFamily: 'monospace', margin: 0 }}>{selectedThreat.destination_ip}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Destination Port
                    </label>
                    <p style={{ color: 'white', fontFamily: 'monospace', margin: 0 }}>
                      {selectedThreat.destination_port || 'N/A'}
                    </p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Protocol
                    </label>
                    <p style={{ color: 'white', fontFamily: 'monospace', margin: 0 }}>
                      {selectedThreat.protocol || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default NetworkMonitoringPage;

