import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './BlockchainPage.css';

export default function BlockchainPage() {
  const [activeTab, setActiveTab] = useState('ledger');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkHealth, setNetworkHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [verifyLogId, setVerifyLogId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds like web version
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔗 Fetching blockchain data...');

      const [healthRes, statsRes, threatsRes] = await Promise.all([
        api.get('/api/blockchain/health'),
        api.get('/api/blockchain/statistics'),
        api.get('/api/blockchain/threats'),
      ]);

      console.log('✅ Data fetched successfully');
      console.log('Health:', healthRes.data);
      console.log('Stats:', statsRes.data);
      console.log('Threats:', threatsRes.data);

      setNetworkHealth(healthRes.data);
      setStats(statsRes.data);
      setThreats(Array.isArray(threatsRes.data) ? threatsRes.data : []);
      setError(null);
    } catch (error) {
      console.error('❌ Failed to fetch blockchain data:', error);
      setError(error.message || 'Failed to fetch blockchain data');
    } finally {
      setLoading(false);
    }
  };

  const verifyThreat = async (logId) => {
    setVerifying(true);
    setVerification(null);
    setShowVerificationModal(true); // Open modal immediately

    try {
      const threat = threats.find((t) => t.logId === logId);
      if (!threat || !threat.threatDetails) {
        setVerification({ success: false, error: 'Threat data not found' });
        setVerifying(false);
        return;
      }

      console.log('🔐 Verifying threat:', logId);
      const res = await api.post(`/api/blockchain/threats/${logId}/verify`, {
        currentData: threat.threatDetails,
      });

      console.log('✅ Verification response:', res.data);
      setVerification(res.data);
    } catch (error) {
      console.error('❌ Verification error:', error);
      setVerification({ success: false, error: error.message || 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#ca8a04',
      low: '#2563eb',
    };
    return colors[severity?.toLowerCase()] || '#6b7280';
  };

  const getThreatIcon = (type) => {
    const icons = {
      brute_force_attack: '🔨',
      ddos: '💥',
      port_scan: '🔍',
      malware: '🦠',
      ransomware: '🔒',
      phishing: '🎣',
      sql_injection: '💉',
      xss: '⚠️',
      unauthorized_access: '🚫',
      data_breach: '📂',
    };
    return icons[type?.toLowerCase()] || '⚡';
  };

  if (loading && !stats && !error) {
    return (
      <div className="blockchain-page loading">
        <div className="loading-spinner"></div>
        <p>Loading blockchain data...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="blockchain-page error">
        <div className="error-container">
          <h2>⚠️ Error Loading Blockchain Data</h2>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={fetchData}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blockchain-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Blockchain Ledger</h1>
          <p>Immutable threat logging with Hyperledger Fabric</p>
        </div>
        <button className="refresh-btn" onClick={fetchData}>
          🔄 Refresh
        </button>
      </div>

      {/* Network Status */}
      {networkHealth && (
        <div className="network-status-bar">
          <div className={`status-badge ${networkHealth.status}`}>
            <span className="status-dot"></span>
            {networkHealth.status === 'connected' ? 'Connected' : 'Offline'}
          </div>
          <div className="network-info">
            <span>Channel: <strong>{networkHealth.channel}</strong></span>
            <span>Chaincode: <strong>{networkHealth.chaincode}</strong></span>
            <span>Network: <strong>{networkHealth.network}</strong></span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          📊 Threat Ledger
        </button>
        <button
          className={`tab ${activeTab === 'verify' ? 'active' : ''}`}
          onClick={() => setActiveTab('verify')}
        >
          🔐 Verification
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Ledger Tab (Threat Logs + Stats) */}
        {activeTab === 'ledger' && (
          <div className="ledger-tab">
            {/* Statistics Cards */}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Records</div>
                </div>
                <div className="stat-card danger">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-value">{stats.bySeverity?.critical || 0}</div>
                  <div className="stat-label">Critical Threats</div>
                </div>
                <div className="stat-card warning">
                  <div className="stat-icon">⚠️</div>
                  <div className="stat-value">{stats.bySeverity?.high || 0}</div>
                  <div className="stat-label">High Priority</div>
                </div>
                <div className="stat-card success">
                  <div className="stat-icon">🔐</div>
                  <div className="stat-value">SHA-256</div>
                  <div className="stat-label">Hash Algorithm</div>
                </div>
              </div>
            )}

            {/* Threat Logs List */}
            <div className="card">
              <h3>🛡️ Blockchain Threat Logs</h3>
              {threats.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>No threat logs found in the blockchain</p>
                </div>
              ) : (
                <div className="threats-list">
                  {threats.slice(0, 20).map((threat, index) => (
                  <div
                    key={threat.logId || index}
                    className={`threat-card ${selectedThreat?.logId === threat.logId ? 'expanded' : ''}`}
                  >
                    <div
                      className="threat-header"
                      onClick={() =>
                        setSelectedThreat(
                          selectedThreat?.logId === threat.logId ? null : threat
                        )
                      }
                    >
                      <div className="threat-info">
                        <span className="threat-id">{threat.logId}</span>
                        <span
                          className="severity-badge"
                          style={{
                            backgroundColor: getSeverityColor(threat.threatDetails?.severity),
                          }}
                        >
                          {threat.threatDetails?.severity?.toUpperCase()}
                        </span>
                      </div>
                      <div className="threat-meta">
                        <span className="threat-type">
                          {threat.threatDetails?.type?.replace(/_/g, ' ') || 'Unknown'}
                        </span>
                        <span className="threat-time">
                          {new Date(threat.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {selectedThreat?.logId === threat.logId && (
                      <div className="threat-details">
                        <div className="detail-section">
                          <label>Detector:</label>
                          <span>{threat.detector || 'N/A'}</span>
                        </div>
                        <div className="detail-section">
                          <label>Block Timestamp:</label>
                          <span>
                            {threat.blockTimestamp
                              ? new Date(threat.blockTimestamp).toLocaleString()
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="detail-section hash-section">
                          <label>SHA-256 Hash:</label>
                          <code className="hash">{threat.hash}</code>
                        </div>
                        <button
                          className="verify-btn"
                          onClick={() => verifyThreat(threat.logId)}
                        >
                          🔐 Verify Integrity
                        </button>
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <div className="verify-tab">
            <div className="card">
              <h3>🔐 Cryptographic Verification</h3>
              <p className="description">
                Verify the integrity of threat logs using SHA-256 hash comparison
              </p>

              {threats.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔐</div>
                  <h4>No Threats to Verify</h4>
                  <p>Threat logs must be created before they can be verified</p>
                </div>
              ) : (
                <div className="threats-selection-list">
                  {threats.map((threat) => (
                    <div
                      key={threat.logId}
                      onClick={() => setSelectedThreat(selectedThreat?.logId === threat.logId ? null : threat)}
                      className={`threat-selection-card ${
                        selectedThreat?.logId === threat.logId ? 'selected' : ''
                      }`}
                    >
                      <div className="threat-selection-content">
                        <div className="threat-selection-info">
                          <span className="threat-selection-icon">
                            {getThreatIcon(threat.threatDetails?.type)}
                          </span>
                          <div>
                            <div className="threat-selection-id">{threat.logId}</div>
                            <div className="threat-selection-type">
                              {(threat.threatDetails?.type || 'unknown').replace(/_/g, ' ')}
                            </div>
                          </div>
                        </div>
                        {selectedThreat?.logId === threat.logId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              verifyThreat(threat.logId);
                            }}
                            disabled={verifying}
                            className="verify-selected-btn"
                          >
                            {verifying ? (
                              <>
                                <div className="spinner-small"></div>
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <span>🔐 Verify Integrity</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && stats && (
          <div className="analytics-tab">
            <div className="analytics-grid">
              <div className="card stat-card-large">
                <h3>📚 Total Records</h3>
                <div className="large-value">{threats.length}</div>
                <p className="subtext">Immutable entries on blockchain</p>
              </div>
              <div className="card stat-card-large">
                <h3>🔐 Hash Algorithm</h3>
                <div className="large-value">SHA-256</div>
                <p className="subtext">Cryptographic security standard</p>
              </div>
              <div className="card stat-card-large">
                <h3>⚡ Consensus</h3>
                <div className="large-value">Solo</div>
                <p className="subtext">Ordering service (Single-node)</p>
              </div>
            </div>

            {stats.byDetector && Object.keys(stats.byDetector).length > 0 && (
              <div className="card">
                <h3>🤖 Detection Sources</h3>
                <div className="detector-grid">
                  {Object.entries(stats.byDetector).map(([detector, count]) => (
                    <div key={detector} className="detector-item">
                      <div className="detector-icon">🔍</div>
                      <div className="detector-info">
                        <span className="detector-name">
                          {detector.replace(/_/g, ' ')}
                        </span>
                        <span className="detector-count">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h3>⏱️ Recent Blockchain Activity</h3>
              <div className="activity-list">
                {threats.slice(0, 5).map((threat, index) => (
                  <div key={threat.logId || index} className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <span className="activity-id">{threat.logId}</span>
                      <span className="activity-time">
                        {new Date(threat.blockTimestamp || threat.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span
                      className="activity-badge"
                      style={{
                        backgroundColor: getSeverityColor(threat.threatDetails?.severity),
                      }}
                    >
                      {threat.threatDetails?.severity || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="modal-overlay" onClick={() => setShowVerificationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔐 Cryptographic Verification</h2>
              <button
                className="modal-close"
                onClick={() => setShowVerificationModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {verifying ? (
                <div className="verifying-state">
                  <div className="loading-spinner"></div>
                  <p>Verifying threat integrity...</p>
                </div>
              ) : verification ? (
                <>
                  {verification.error ? (
                    <div className="error-message">{verification.error}</div>
                  ) : (
                    <>
                      <div
                        className={`verification-result ${verification.valid ? 'valid' : 'invalid'}`}
                      >
                        {verification.valid
                          ? '✓ MATCH - Data is authentic and unmodified'
                          : '✗ MISMATCH - Data has been tampered with'}
                      </div>

                      <div className="hash-comparison">
                        <div className="hash-block">
                          <label>BLOCKCHAIN HASH (Original from Ledger)</label>
                          <code className="hash blockchain-hash">
                            {verification.originalHash}
                          </code>
                        </div>
                        <div className="hash-block">
                          <label>CURRENT HASH (Recalculated from Data)</label>
                          <code className="hash current-hash">
                            {verification.currentHash}
                          </code>
                        </div>
                      </div>

                      <div className="verification-meta">
                        <div>
                          <strong>Algorithm:</strong> SHA-256
                        </div>
                        <div>
                          <strong>Network:</strong> Hyperledger Fabric
                        </div>
                        <div>
                          <strong>Verified At:</strong>{' '}
                          {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

