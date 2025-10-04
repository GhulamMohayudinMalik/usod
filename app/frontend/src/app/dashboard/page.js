
"use client";
import { useEffect, useState, useRef } from 'react';
import { getData } from '@/services/api';
import { StatsCard } from '@/components/StatsCard';
import { ThreatCard } from '@/components/ThreatCard';

export default function DashboardIndex() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [live, setLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const pollingRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const [s, e] = await Promise.all([
        getData('/api/data/dashboard-stats'),
        getData('/api/data/security-events?count=5')
      ]);
      setStats(s);
      setEvents(e);
      setLoading(false);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load dashboard');
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (live) {
      pollingRef.current = setInterval(load, 10000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [live]);

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
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <button
            className={`px-3 py-1 rounded ${live ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-100'}`}
            onClick={() => setLive(v => !v)}
          >
            Live Updates: {live ? 'ON' : 'OFF'}
          </button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={load}>Refresh</button>
        </div>
      </div>

      {/* Live banner */}
      <div className="rounded-md px-3 py-2 text-sm bg-emerald-900/40 text-emerald-300 border border-emerald-700">
        Live monitoring {live ? 'active' : 'paused'} — Dashboard will {live ? 'automatically update' : 'not auto update'}
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard size="lg" title="Security Score" value={`${stats.securityScore}%`} change={3} description="Overall security posture" />
          <StatsCard size="lg" title="Active Threats" value={stats.activeThreats} change={-2} description="Threats requiring attention" />
          <StatsCard size="lg" title="Protected Users" value={stats.protectedUsers} change={5} description="Users with security policies" />
        </div>
      )}

      {/* Recent threats */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Recent Threats</h2>
        <button className="text-sm text-blue-400 hover:underline" onClick={load}>View All</button>
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
