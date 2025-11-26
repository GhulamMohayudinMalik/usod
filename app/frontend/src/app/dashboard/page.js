
"use client";
import { useEffect, useState } from 'react';
import { getData } from '@/services/api';
import { StatsCard } from '@/components/StatsCard';
import { ThreatCard } from '@/components/ThreatCard';

export default function DashboardIndex() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({ connected: false, monitoring: false });
  const [blockchainStatus, setBlockchainStatus] = useState({ connected: false, health: 'unknown' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, e] = await Promise.all([
        getData('/api/data/dashboard-stats'),
        getData('/api/data/security-events?count=6')
      ]);
      setStats(s);
      setEvents(e);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard');
      setLoading(false);
    }
  };

  const checkStatuses = async () => {
    try {
      // Check blockchain status
      const bcRes = await fetch('http://api.glitchmorse.tech/api/blockchain/health');
      if (bcRes.ok) {
        const bcData = await bcRes.json();
        const isConnected = bcData.status === 'connected';
        setBlockchainStatus({ 
          connected: isConnected, 
          health: bcData.status || 'unknown' 
        });
      } else {
        setBlockchainStatus({ connected: false, health: 'error' });
      }
    } catch (err) {
      setBlockchainStatus({ connected: false, health: 'error' });
    }

    // Simulate network monitoring status (you can add real endpoint later)
    setNetworkStatus({ connected: true, monitoring: true });
  };

  useEffect(() => { 
    loadData();
    checkStatuses();
    const interval = setInterval(checkStatuses, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-6">Loading dashboard…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Dashboard Overview</h1>
          <p className="text-sm text-gray-400">Welcome to your security operations dashboard</p>
        </div>
        <button 
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 transition-all"
          onClick={loadData}
        >
          Refresh Data
        </button>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard size="lg" title="Security Score" value={`${stats.securityScore}%`} change={3} description="Overall security posture" />
          <StatsCard size="lg" title="Active Threats" value={stats.activeThreats} change={-2} description="Threats requiring attention" />
          <StatsCard size="lg" title="Protected Users" value={stats.protectedUsers} change={5} description="Users with security policies" />
        </div>
      )}

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Network Monitoring Status */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-200">Network Monitoring</h3>
                <p className="text-xs text-gray-400">Real-time traffic analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${networkStatus.monitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-xs text-gray-400">{networkStatus.monitoring ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        {/* Blockchain Status */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-200">Blockchain Ledger</h3>
                <p className="text-xs text-gray-400">Immutable audit trail</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${blockchainStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-400">{blockchainStatus.connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Threats - 2 rows x 3 columns grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">Recent Threats</h2>
          <button className="text-sm text-blue-400 hover:underline" onClick={loadData}>View All</button>
        </div>
        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <ThreatCard
                key={ev.id}
                level={ev.severity}
                source={ev.source}
                timestamp={new Date(ev.timestamp).toLocaleString()}
                description={ev.description}
                confidence={0.75}
                recommendations={[]}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-400">No recent events.</div>
        )}
      </div>

      {/* AI Analysis Block */}
      <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-200">AI-Powered Threat Analysis</h3>
          <button className="text-xs text-blue-400">Run Analysis</button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-400 mb-3">Analyze text or network traffic for potential security threats using advanced AI detection.</p>
          <textarea className="w-full h-24 p-3 rounded-md bg-gray-900 text-gray-100 border border-gray-700" placeholder="Enter text to analyze for potential threats..."></textarea>
          <div className="mt-3 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Analyze</button>
          </div>
        </div>
      </div>
    </div>
  );
}
