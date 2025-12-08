'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

export default function BlockchainPage() {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ledger');
  const [networkHealth, setNetworkHealth] = useState(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view blockchain data');
        setLoading(false);
        return;
      }

      // Fetch network health
      const healthRes = await fetch('http://localhost:5000/api/blockchain/health');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setNetworkHealth(healthData);
      }

      // Fetch statistics
      const statsRes = await fetch('http://localhost:5000/api/blockchain/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch threats
      const threatsRes = await fetch('http://localhost:5000/api/blockchain/threats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (threatsRes.ok) {
        const threatsData = await threatsRes.json();
        setThreats(Array.isArray(threatsData) ? threatsData : []);
      }

      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const verifyThreat = async (logId) => {
    setVerifying(true);
    setVerification(null);
    setIsVerificationModalOpen(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Only send logId - backend fetches from MongoDB and compares with blockchain
      const res = await fetch(`http://localhost:5000/api/blockchain/threats/${logId}/verify`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // No data needed - backend fetches from MongoDB
      });
      
      if (res.ok) {
        const data = await res.json();
        const mappedData = {
          ...data,
          // Map backend field names to what the modal expects
          originalHash: data.originalHash || data.blockchainHash || null,
          currentHash: data.currentHash || data.mongoHash || null,
        };
        setVerification(mappedData);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setVerification({ 
          success: false, 
          error: errorData.error || 'Verification failed',
          tamperStatus: errorData.tamperStatus || 'error'
        });
      }
    } catch (err) {
      setVerification({ success: false, error: err.message, tamperStatus: 'error' });
    }
    setVerifying(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-900/30 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-900/30 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/30';
    }
  };

  const getThreatIcon = (type) => {
    const typeStr = type?.toLowerCase() || '';
    if (typeStr.includes('ddos')) return '💥';
    if (typeStr.includes('brute')) return '🔨';
    if (typeStr.includes('sql')) return '💉';
    if (typeStr.includes('malware') || typeStr.includes('ransomware')) return '🦠';
    if (typeStr.includes('port') || typeStr.includes('scan')) return '🔍';
    if (typeStr.includes('network')) return '🌐';
    return '⚠️';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
          </div>
          <p className="text-gray-400 text-lg">Connecting to Hyperledger Fabric...</p>
          <p className="text-gray-500 text-sm mt-2">Loading blockchain ledger</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl p-8 backdrop-blur-sm shadow-2xl">
          <div className="flex items-start gap-4">
            <span className="text-5xl">🚨</span>
            <div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">Blockchain Connection Error</h2>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={fetchData}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Blockchain Ledger</h1>
          <p className="text-sm text-gray-400 mt-1">Immutable threat logging with Hyperledger Fabric</p>
        </div>
        <div className="flex items-center gap-3">
          {networkHealth && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
              networkHealth.status === 'connected'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                networkHealth.status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}></div>
              <span>{networkHealth.status === 'connected' ? 'Connected' : 'Offline'}</span>
            </div>
          )}
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-lg transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Network Info */}
      {networkHealth && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Channel</div>
            <div className="text-sm font-semibold text-emerald-400">{networkHealth.channel}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Chaincode</div>
            <div className="text-sm font-semibold text-cyan-400">{networkHealth.chaincode}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Network</div>
            <div className="text-sm font-semibold text-blue-400">{networkHealth.network}</div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-5 border border-blue-500/30 backdrop-blur-sm shadow-lg hover:shadow-blue-500/20 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 text-xs font-semibold uppercase tracking-wide">Total Threats</span>
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.total || threats.length}</div>
              <div className="text-blue-300/70 text-xs">Immutable records</div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-xl p-5 border border-red-500/30 backdrop-blur-sm shadow-lg hover:shadow-red-500/20 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-300 text-xs font-semibold uppercase tracking-wide">Critical</span>
                <span className="text-2xl">🚨</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.bySeverity?.critical || 0}</div>
              <div className="text-red-300/70 text-xs">High priority</div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-xl p-5 border border-orange-500/30 backdrop-blur-sm shadow-lg hover:shadow-orange-500/20 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-300 text-xs font-semibold uppercase tracking-wide">High</span>
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.bySeverity?.high || 0}</div>
              <div className="text-orange-300/70 text-xs">Elevated threats</div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 rounded-xl p-5 border border-emerald-500/30 backdrop-blur-sm shadow-lg hover:shadow-emerald-500/20 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wide">Verified</span>
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{threats.length}</div>
              <div className="text-emerald-300/70 text-xs">Secured</div>
            </div>
          </div>
        </div>
      )}

      {/* Threat Type Distribution */}
      {stats && stats.byType && Object.keys(stats.byType).length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <span>📈</span>
            <span>Threat Type Distribution</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600 hover:border-gray-500 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{getThreatIcon(type)}</span>
                  <div className="text-xs text-gray-400 font-medium capitalize truncate">
                    {type.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <nav className="flex gap-0">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
                activeTab === 'ledger'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              {activeTab === 'ledger' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
              )}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">📚</span>
                <span>Blockchain Ledger</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
                activeTab === 'verify'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              {activeTab === 'verify' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
              )}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🔐</span>
                <span>Cryptographic Verification</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
                activeTab === 'analytics'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
              )}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">📊</span>
                <span>Analytics</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Ledger Tab */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-100">Immutable Threat Logs</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {threats.length} {threats.length === 1 ? 'record' : 'records'} stored on blockchain
                  </p>
                </div>
              </div>

              {threats.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-block p-8 bg-gray-700/30 rounded-full mb-6">
                    <span className="text-7xl">🔗</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Threat Logs Yet</h3>
                  <p className="text-gray-400">
                    Threat logs will appear here as they are detected and logged to the blockchain
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {threats.map((threat, index) => {
                    const severity = threat.threatDetails?.severity || 'unknown';
                    const type = threat.logType || threat.threatDetails?.type || 'unknown';
                    
                    return (
                      <div
                        key={threat.logId || index}
                        className="group bg-gray-700/20 hover:bg-gray-700/40 border border-gray-600 hover:border-emerald-500/50 rounded-lg p-5 transition-all cursor-pointer"
                        onClick={() => setSelectedThreat(selectedThreat?.logId === threat.logId ? null : threat)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 group-hover:border-emerald-500/50 transition-all">
                              <span className="text-3xl">{getThreatIcon(type)}</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header Row */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <h3 className="text-lg font-bold text-gray-100 mb-1">
                                  {threat.logId}
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(severity)}`}>
                                    {severity.toUpperCase()}
                                  </span>
                                  <span className="text-gray-400 text-sm capitalize">
                                    {type.replace(/_/g, ' ')}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTab('verify');
                                  setSelectedThreat(threat);
                                }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                              >
                                <span>🔐</span>
                                <span>Verify</span>
                              </button>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <div className="text-gray-500 text-xs mb-1">Detector</div>
                                <div className="text-gray-300 font-medium">{threat.detector || 'N/A'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500 text-xs mb-1">Timestamp</div>
                                <div className="text-gray-300 font-medium">
                                  {new Date(threat.timestamp).toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500 text-xs mb-1">Block Time</div>
                                <div className="text-gray-300 font-medium">
                                  {threat.blockTimestamp ? new Date(threat.blockTimestamp).toLocaleString() : 'N/A'}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500 text-xs mb-1">Hash</div>
                                <div className="text-gray-300 font-mono text-xs truncate">
                                  {threat.hash?.substring(0, 16)}...
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {selectedThreat?.logId === threat.logId && threat.threatDetails && (
                              <div className="mt-4 pt-4 border-t border-gray-600">
                                <h4 className="text-sm font-semibold text-gray-300 mb-3">Threat Details</h4>
                                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                                  <pre className="text-xs text-gray-300 overflow-x-auto">
                                    {JSON.stringify(threat.threatDetails, null, 2)}
                                  </pre>
                                </div>
                                <div className="mt-3">
                                  <div className="text-xs text-gray-500 mb-1">SHA-256 Hash</div>
                                  <code className="block bg-gray-900/50 p-3 rounded border border-gray-700 text-xs font-mono text-emerald-400 break-all">
                                    {threat.hash}
                                  </code>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verify' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-100 mb-2">Cryptographic Verification</h2>
                <p className="text-sm text-gray-400">
                  Verify the integrity of threat logs using SHA-256 hash comparison
                </p>
              </div>

              {threats.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-block p-8 bg-gray-700/30 rounded-full mb-6">
                    <span className="text-7xl">🔐</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Threats to Verify</h3>
                  <p className="text-gray-400">
                    Threat logs must be created before they can be verified
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Threat Selection */}
                  <div className="grid gap-3">
                    {threats.map((threat) => (
                      <div
                        key={threat.logId}
                        onClick={() => setSelectedThreat(threat)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedThreat?.logId === threat.logId
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-gray-600 bg-gray-700/20 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getThreatIcon(threat.logType)}</span>
                            <div>
                              <div className="font-semibold text-gray-100">{threat.logId}</div>
                              <div className="text-sm text-gray-400 capitalize">
                                {(threat.logType || '').replace(/_/g, ' ')}
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
                              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium shadow-lg"
                            >
                              {verifying ? (
                                <span className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                  <span>Verifying...</span>
                                </span>
                              ) : (
                                <span>🔐 Verify Integrity</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && stats && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-100 mb-2">Blockchain Analytics</h2>
                <p className="text-sm text-gray-400">
                  Real-time insights from the immutable ledger
                </p>
              </div>

              {/* Stats Summary - AT TOP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/20 rounded-xl p-5 border border-indigo-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">📚</span>
                    <div className="text-sm text-indigo-300 font-semibold">Total Records</div>
                  </div>
                  <div className="text-3xl font-bold text-white">{threats.length}</div>
                  <div className="text-indigo-300/70 text-xs mt-2">Immutable entries on blockchain</div>
                </div>

                <div className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 rounded-xl p-5 border border-violet-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🔐</span>
                    <div className="text-sm text-violet-300 font-semibold">Hash Algorithm</div>
                  </div>
                  <div className="text-2xl font-bold text-white">SHA-256</div>
                  <div className="text-violet-300/70 text-xs mt-2">Cryptographic security standard</div>
                </div>

                <div className="bg-gradient-to-br from-fuchsia-900/40 to-fuchsia-800/20 rounded-xl p-5 border border-fuchsia-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">⚡</span>
                    <div className="text-sm text-fuchsia-300 font-semibold">Consensus</div>
                  </div>
                  <div className="text-2xl font-bold text-white">Solo</div>
                  <div className="text-fuchsia-300/70 text-xs mt-2">Ordering service (Single-node)</div>
                </div>
              </div>

              {/* Detector Distribution */}
              {stats.byDetector && Object.keys(stats.byDetector).length > 0 && (
                <div className="bg-gray-700/20 rounded-xl p-5 border border-gray-600">
                  <h3 className="text-sm font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <span>🤖</span>
                    <span>Detection Sources</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(stats.byDetector).map(([detector, count]) => (
                      <div key={detector} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🔍</span>
                          </div>
                          <span className="font-medium text-gray-200 capitalize">
                            {detector.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-purple-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-gray-700/20 rounded-xl p-5 border border-gray-600">
                <h3 className="text-sm font-semibold text-gray-100 mb-4 flex items-center gap-2">
                  <span>⏱️</span>
                  <span>Recent Blockchain Activity</span>
                </h3>
                <div className="space-y-3">
                  {threats.slice(0, 5).map((threat, index) => (
                    <div key={threat.logId || index} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-200">{threat.logId}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(threat.blockTimestamp || threat.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(threat.threatDetails?.severity)}`}>
                          {threat.threatDetails?.severity || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500">Added to ledger</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setVerification(null);
        }}
        title="🔐 Cryptographic Verification"
        size="lg"
      >
        {verifying ? (
          <div className="text-center py-8">
            <div className="inline-block relative mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🔐</span>
              </div>
            </div>
            <p className="text-gray-400 text-lg">Verifying hash integrity...</p>
            <p className="text-gray-500 text-sm mt-2">Computing SHA-256 hash</p>
          </div>
        ) : verification ? (
          <div className="space-y-6">
            {/* Result Banner */}
            <div className={`rounded-xl p-6 border-2 ${
              verification.valid
                ? 'bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/50'
                : 'bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/50'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${
                  verification.valid ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <span className="text-5xl">
                    {verification.valid ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold mb-2 ${
                    verification.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {verification.valid ? 'Integrity Verified' : 'Verification Failed'}
                  </h3>
                  <p className={verification.valid ? 'text-green-200' : 'text-red-200'}>
                    {verification.error ? verification.error : verification.valid
                      ? 'The threat log hash matches the original. Data has not been tampered with.'
                      : 'Hash mismatch detected. The data may have been altered.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Hash Comparison */}
            {!verification.error && verification.originalHash && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📝</span>
                    <h4 className="text-sm font-semibold text-gray-300">Original Hash (Blockchain)</h4>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <code className="text-xs font-mono text-emerald-400 break-all">
                      {verification.originalHash}
                    </code>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className={`px-4 py-2 rounded-lg border ${
                    verification.valid
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <span className="text-sm font-semibold">
                      {verification.valid ? '✓ Hashes Match' : '✗ Hashes Do Not Match'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔢</span>
                    <h4 className="text-sm font-semibold text-gray-300">Calculated Hash (Current Data)</h4>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <code className="text-xs font-mono text-cyan-400 break-all">
                      {verification.currentHash}
                    </code>
                  </div>
                </div>

                {/* Hash Comparison Section */}
                
              </div>
            )}

            {/* Technical Details */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Algorithm</span>
                  <div className="text-gray-200 font-semibold">SHA-256</div>
                </div>
                <div>
                  <span className="text-gray-500">Network</span>
                  <div className="text-gray-200 font-semibold">Hyperledger Fabric</div>
                </div>
                <div>
                  <span className="text-gray-500">Verified At</span>
                  <div className="text-gray-200 font-semibold">{new Date().toLocaleTimeString()}</div>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <div className={`font-semibold ${verification.valid ? 'text-green-400' : 'text-red-400'}`}>
                    {verification.valid ? 'Valid' : 'Invalid'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
