import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const BlockchainLedgerPage = () => {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch statistics
      const statsResult = await apiService.getBlockchainStatistics();
      if (statsResult.success !== false) {
        setStats(statsResult);
      }

      // Fetch threats
      const threatsResult = await apiService.getBlockchainThreats();
      if (threatsResult.success !== false && Array.isArray(threatsResult)) {
        setThreats(threatsResult);
      } else if (threatsResult.threats && Array.isArray(threatsResult.threats)) {
        setThreats(threatsResult.threats);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
      setError(err.message || 'Failed to load blockchain data');
      setLoading(false);
    }
  };

  const verifyThreat = async (logId) => {
    setVerifying(true);
    setVerification(null);
    try {
      const result = await apiService.verifyBlockchainThreat(logId);
      setVerification(result);
    } catch (err) {
      setVerification({ error: err.message || 'Verification failed' });
    }
    setVerifying(false);
  };

  const getThreatHistory = async (logId) => {
    try {
      const history = await apiService.getBlockchainThreatHistory(logId);
      setSelectedThreat({ ...threats.find(t => t.logId === logId), history });
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', background: '#111827', minHeight: '100vh', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ color: '#9ca3af' }}>Loading blockchain data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', background: '#111827', minHeight: '100vh', color: 'white' }}>
        <div style={{ background: 'rgba(127, 29, 29, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', padding: '1.5rem', backdropFilter: 'blur(4px)' }}>
          <h2 style={{ color: '#f87171', fontWeight: '600', marginBottom: '0.5rem', marginTop: 0 }}>Error</h2>
          <p style={{ color: '#fca5a5', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: '#111827', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f3f4f6', marginBottom: '0.25rem', marginTop: 0 }}>🔗 Blockchain Ledger</h1>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>Immutable threat logging with cryptographic verification</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.3)', backdropFilter: 'blur(4px)' }}>
            <div style={{ width: '0.5rem', height: '0.5rem', background: '#4ade80', borderRadius: '9999px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
            <span style={{ color: '#4ade80', fontWeight: '500', fontSize: '0.875rem' }}>Connected</span>
          </div>
          <button
            onClick={fetchData}
            style={{ padding: '0.5rem 1rem', background: 'linear-gradient(to right, #059669, #0891b2)', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}
            onMouseEnter={(e) => e.target.style.background = 'linear-gradient(to right, #047857, #0e7490)'}
            onMouseLeave={(e) => e.target.style.background = 'linear-gradient(to right, #059669, #0891b2)'}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      <div style={{ background: 'rgba(113, 63, 18, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.5rem', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', backdropFilter: 'blur(4px)', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
        <div>
          <h3 style={{ fontWeight: '600', color: '#fbbf24', marginTop: 0, marginBottom: '0.25rem' }}>Demo Mode</h3>
          <p style={{ color: 'rgba(251, 191, 36, 0.8)', fontSize: '0.875rem', margin: 0 }}>Using mock blockchain for demonstration. Production would use Hyperledger Fabric.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(to bottom right, rgba(30, 58, 138, 0.4), rgba(30, 64, 175, 0.4))', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(4px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#93c5fd', fontSize: '0.875rem', fontWeight: '500' }}>Total Logs</span>
              <span style={{ fontSize: '1.875rem' }}>📝</span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#f3f4f6' }}>{stats.totalLogs || 0}</div>
            <div style={{ color: 'rgba(147, 197, 253, 0.7)', fontSize: '0.875rem', marginTop: '0.5rem' }}>On blockchain</div>
          </div>

          <div style={{ background: 'linear-gradient(to bottom right, rgba(88, 28, 135, 0.4), rgba(107, 33, 168, 0.4))', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid rgba(168, 85, 247, 0.3)', backdropFilter: 'blur(4px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#d8b4fe', fontSize: '0.875rem', fontWeight: '500' }}>Transactions</span>
              <span style={{ fontSize: '1.875rem' }}>⛓️</span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#f3f4f6' }}>{stats.totalTransactions || 0}</div>
            <div style={{ color: 'rgba(216, 180, 254, 0.7)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Total count</div>
          </div>

          <div style={{ background: 'linear-gradient(to bottom right, rgba(6, 95, 70, 0.4), rgba(5, 150, 105, 0.4))', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)', backdropFilter: 'blur(4px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#6ee7b7', fontSize: '0.875rem', fontWeight: '500' }}>Block Height</span>
              <span style={{ fontSize: '1.875rem' }}>📊</span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#f3f4f6' }}>{stats.blockHeight || 0}</div>
            <div style={{ color: 'rgba(110, 231, 183, 0.7)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Current height</div>
          </div>

          <div style={{ background: 'linear-gradient(to bottom right, rgba(124, 45, 18, 0.4), rgba(154, 52, 18, 0.4))', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(4px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#fdba74', fontSize: '0.875rem', fontWeight: '500' }}>Ledger Size</span>
              <span style={{ fontSize: '1.875rem' }}>💾</span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#f3f4f6' }}>{stats.ledgerSize || 0}</div>
            <div style={{ color: 'rgba(253, 186, 116, 0.7)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Active entries</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: 'rgba(31, 41, 55, 0.5)', borderRadius: '0.5rem', border: '1px solid #374151', backdropFilter: 'blur(4px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ borderBottom: '1px solid #374151' }}>
          <nav style={{ display: 'flex', gap: '1rem', padding: '0 1.5rem' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{ padding: '1rem 0.5rem', borderBottom: activeTab === 'overview' ? '2px solid #10b981' : '2px solid transparent', fontWeight: '500', fontSize: '0.875rem', background: 'none', border: 'none', color: activeTab === 'overview' ? '#10b981' : '#9ca3af', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { if (activeTab !== 'overview') e.target.style.color = '#d1d5db' }}
              onMouseLeave={(e) => { if (activeTab !== 'overview') e.target.style.color = '#9ca3af' }}
            >
              📋 Overview
            </button>
            <button
              onClick={() => setActiveTab('threats')}
              style={{ padding: '1rem 0.5rem', borderBottom: activeTab === 'threats' ? '2px solid #10b981' : '2px solid transparent', fontWeight: '500', fontSize: '0.875rem', background: 'none', border: 'none', color: activeTab === 'threats' ? '#10b981' : '#9ca3af', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { if (activeTab !== 'threats') e.target.style.color = '#d1d5db' }}
              onMouseLeave={(e) => { if (activeTab !== 'threats') e.target.style.color = '#9ca3af' }}
            >
              🔍 Threat Logs
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              style={{ padding: '1rem 0.5rem', borderBottom: activeTab === 'verify' ? '2px solid #10b981' : '2px solid transparent', fontWeight: '500', fontSize: '0.875rem', background: 'none', border: 'none', color: activeTab === 'verify' ? '#10b981' : '#9ca3af', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { if (activeTab !== 'verify') e.target.style.color = '#d1d5db' }}
              onMouseLeave={(e) => { if (activeTab !== 'verify') e.target.style.color = '#9ca3af' }}
            >
              ✅ Verification
            </button>
          </nav>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f3f4f6', marginBottom: '1rem', marginTop: 0 }}>Threat Distribution</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {Object.entries(stats.threatsByType || {}).map(([type, count]) => (
                    <div key={type} style={{ background: 'rgba(55, 65, 81, 0.3)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid #4b5563', backdropFilter: 'blur(4px)' }}>
                      <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{type.replace('_', ' ').toUpperCase()}</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f3f4f6' }}>{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f3f4f6', marginBottom: '1rem', marginTop: 0 }}>Recent Activity</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {stats.recentActivity && stats.recentActivity.slice(0, 10).map((activity, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(55, 65, 81, 0.3)', borderRadius: '0.5rem', border: '1px solid #4b5563', backdropFilter: 'blur(4px)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {activity.type === 'CREATE' ? '➕' : activity.type === 'UPDATE' ? '✏️' : '🗑️'}
                        </span>
                        <div>
                          <div style={{ fontWeight: '500', color: '#f3f4f6' }}>{activity.type}</div>
                          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Block #{activity.blockNumber}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#9ca3af' }}>{activity.logId}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Threats Tab */}
          {activeTab === 'threats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f3f4f6', margin: 0 }}>Blockchain Threat Logs ({threats.length})</h2>
              </div>

              {threats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <span style={{ fontSize: '3.75rem', display: 'block', marginBottom: '1rem' }}>📝</span>
                  <p style={{ color: '#9ca3af', margin: 0 }}>No threats logged to blockchain yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {threats.map((threat) => (
                    <div
                      key={threat.logId}
                      style={{ border: '1px solid #374151', borderRadius: '0.5rem', padding: '1rem', background: 'rgba(31, 41, 55, 0.3)', backdropFilter: 'blur(4px)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>
                              {threat.logType === 'security_event' ? '🔐' : '⚠️'}
                            </span>
                            <div>
                              <h3 style={{ fontWeight: '600', color: '#f3f4f6', margin: 0 }}>{threat.logId}</h3>
                              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>{threat.logType}</p>
                            </div>
                          </div>

                          <div style={{ marginLeft: '2.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.875rem' }}>
                              <span style={{ color: '#9ca3af' }}>Detection:</span>{' '}
                              <span style={{ fontWeight: '500', color: '#d1d5db' }}>{threat.detectionMethod}</span>
                            </div>
                            <div style={{ fontSize: '0.875rem' }}>
                              <span style={{ color: '#9ca3af' }}>Hash:</span>{' '}
                              <code style={{ fontSize: '0.75rem', background: 'rgba(17, 24, 39, 0.5)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'monospace', color: '#d1d5db', border: '1px solid #374151' }}>
                                {threat.hash ? threat.hash.substring(0, 32) + '...' : 'N/A'}
                              </code>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {new Date(threat.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => getThreatHistory(threat.logId)}
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', background: 'rgba(30, 58, 138, 0.3)', color: '#60a5fa', borderRadius: '0.25rem', border: '1px solid rgba(59, 130, 246, 0.3)', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(30, 58, 138, 0.5)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(30, 58, 138, 0.3)'}
                          >
                            📜 History
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab('verify');
                              setSelectedThreat(threat);
                            }}
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', background: 'rgba(6, 78, 59, 0.3)', color: '#4ade80', borderRadius: '0.25rem', border: '1px solid rgba(34, 197, 94, 0.3)', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(6, 78, 59, 0.5)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(6, 78, 59, 0.3)'}
                          >
                            ✅ Verify
                          </button>
                        </div>
                      </div>

                      {selectedThreat?.logId === threat.logId && selectedThreat.history && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #374151' }}>
                          <h4 style={{ fontWeight: '600', color: '#f3f4f6', marginBottom: '0.5rem', marginTop: 0 }}>Transaction History</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selectedThreat.history.map((tx, idx) => (
                              <div key={idx} style={{ fontSize: '0.875rem', background: 'rgba(55, 65, 81, 0.3)', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #4b5563' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: '500', color: '#d1d5db' }}>{tx.type}</span>
                                  <span style={{ color: '#9ca3af' }}>Block #{tx.blockNumber}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{tx.txId}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verify' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f3f4f6', marginBottom: '1rem', marginTop: 0 }}>Verify Threat Log Integrity</h2>
                <p style={{ color: '#9ca3af', marginBottom: '1rem', margin: 0 }}>
                  Select a threat log to verify its cryptographic hash and ensure data integrity.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {threats.map((threat) => (
                  <div
                    key={threat.logId}
                    style={{ 
                      border: selectedThreat?.logId === threat.logId ? '2px solid #10b981' : '2px solid #374151', 
                      borderRadius: '0.5rem', 
                      padding: '1rem', 
                      cursor: 'pointer', 
                      backdropFilter: 'blur(4px)',
                      background: selectedThreat?.logId === threat.logId ? 'rgba(6, 78, 59, 0.2)' : 'rgba(31, 41, 55, 0.3)'
                    }}
                    onClick={() => setSelectedThreat(threat)}
                    onMouseEnter={(e) => { if (selectedThreat?.logId !== threat.logId) e.currentTarget.style.borderColor = '#4b5563' }}
                    onMouseLeave={(e) => { if (selectedThreat?.logId !== threat.logId) e.currentTarget.style.borderColor = '#374151' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#f3f4f6' }}>{threat.logId}</div>
                        <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{threat.logType}</div>
                      </div>
                      {selectedThreat?.logId === threat.logId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            verifyThreat(threat.logId);
                          }}
                          disabled={verifying}
                          style={{ 
                            padding: '0.5rem 1rem', 
                            background: verifying ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(to right, #059669, #0891b2)', 
                            color: 'white', 
                            borderRadius: '0.5rem', 
                            border: 'none', 
                            cursor: verifying ? 'not-allowed' : 'pointer',
                            opacity: verifying ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => { if (!verifying) e.target.style.background = 'linear-gradient(to right, #047857, #0e7490)' }}
                          onMouseLeave={(e) => { if (!verifying) e.target.style.background = 'linear-gradient(to right, #059669, #0891b2)' }}
                        >
                          {verifying ? '⏳ Verifying...' : '✅ Verify Hash'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {verification && (
                <div
                  style={{ 
                    borderRadius: '0.5rem', 
                    padding: '1.5rem', 
                    border: verification.isValid ? '2px solid rgba(34, 197, 94, 0.5)' : '2px solid rgba(239, 68, 68, 0.5)',
                    background: verification.isValid ? 'rgba(6, 78, 59, 0.2)' : 'rgba(127, 29, 29, 0.2)',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <span style={{ fontSize: '2.25rem' }}>
                      {verification.isValid ? '✅' : '❌'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 'bold', 
                        marginBottom: '0.5rem', 
                        marginTop: 0,
                        color: verification.isValid ? '#4ade80' : '#f87171'
                      }}>
                        {verification.message || verification.error}
                      </h3>

                      {verification.isValid !== undefined && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#d1d5db', marginBottom: '0.25rem' }}>Stored Hash:</div>
                            <code style={{ fontSize: '0.75rem', background: 'rgba(17, 24, 39, 0.5)', padding: '0.5rem', borderRadius: '0.25rem', display: 'block', fontFamily: 'monospace', wordBreak: 'break-all', color: '#d1d5db', border: '1px solid #374151' }}>
                              {verification.storedHash}
                            </code>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#d1d5db', marginBottom: '0.25rem' }}>Calculated Hash:</div>
                            <code style={{ fontSize: '0.75rem', background: 'rgba(17, 24, 39, 0.5)', padding: '0.5rem', borderRadius: '0.25rem', display: 'block', fontFamily: 'monospace', wordBreak: 'break-all', color: '#d1d5db', border: '1px solid #374151' }}>
                              {verification.calculatedHash}
                            </code>
                          </div>
                          <div style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '600',
                            color: verification.isValid ? '#4ade80' : '#f87171'
                          }}>
                            {verification.isValid
                              ? '✓ Hashes match - Data has not been tampered with'
                              : '✗ Hashes do not match - Data may have been altered'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainLedgerPage;

