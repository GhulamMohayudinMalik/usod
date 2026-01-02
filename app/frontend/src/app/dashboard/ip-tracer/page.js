'use client';

import { useState, useEffect, useCallback } from 'react';
import { getData } from '@/services/api';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-gray-400">Loading map...</div>
        </div>
    )
});

export default function IPTracerPage() {
    const [ipAddress, setIpAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [locationData, setLocationData] = useState(null);
    const [recentTraces, setRecentTraces] = useState([]);

    // Validate IP address format
    const isValidIP = (ip) => {
        const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Pattern.test(ip);
    };

    // Trace IP address
    const traceIP = async (e) => {
        e?.preventDefault();

        const ip = ipAddress.trim();

        if (!ip) {
            setError('Please enter an IP address');
            return;
        }

        if (!isValidIP(ip)) {
            setError('Please enter a valid IPv4 address (e.g., 8.8.8.8)');
            return;
        }

        setLoading(true);
        setError('');
        setLocationData(null);

        try {
            const response = await getData(`/api/trace-ip/${ip}`);

            if (response.success) {
                setLocationData(response.data);

                // Add to recent traces
                setRecentTraces(prev => {
                    const newTraces = [response.data, ...prev.filter(t => t.ip !== ip)].slice(0, 5);
                    return newTraces;
                });
            } else {
                setError(response.message || 'Failed to trace IP address');
            }
        } catch (err) {
            console.error('IP trace error:', err);
            setError(err.message || 'Failed to trace IP address');
        } finally {
            setLoading(false);
        }
    };

    // Quick trace from recent list
    const quickTrace = (ip) => {
        setIpAddress(ip);
        setLocationData(recentTraces.find(t => t.ip === ip) || null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">🌍 IP Tracer</h1>
                    <p className="text-gray-400 mt-2">
                        Trace any IP address and view its geographic location on the map
                    </p>
                </div>
            </div>

            {/* Search Form */}
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                <form onSubmit={traceIP} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            IP Address
                        </label>
                        <input
                            type="text"
                            value={ipAddress}
                            onChange={(e) => setIpAddress(e.target.value)}
                            placeholder="Enter IP address (e.g., 8.8.8.8)"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-500/25"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Tracing...
                                </span>
                            ) : (
                                '🔍 Trace IP'
                            )}
                        </button>
                    </div>
                </form>

                {/* Quick Access - Recent Traces */}
                {recentTraces.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <p className="text-sm text-gray-400 mb-2">Recent traces:</p>
                        <div className="flex flex-wrap gap-2">
                            {recentTraces.map((trace) => (
                                <button
                                    key={trace.ip}
                                    onClick={() => quickTrace(trace.ip)}
                                    className="px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-sm rounded-full transition-colors"
                                >
                                    {trace.ip} ({trace.country_code})
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-red-300">
                    {error}
                </div>
            )}

            {/* Results */}
            {locationData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Map */}
                    <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                        <h2 className="text-xl font-semibold text-white mb-4">📍 Approximate Location</h2>
                        <div className="h-96 rounded-lg overflow-hidden">
                            <MapComponent
                                latitude={locationData.latitude}
                                longitude={locationData.longitude}
                                city={locationData.city}
                                country={locationData.country}
                                ip={locationData.ip}
                            />
                        </div>
                        <p className="text-gray-400 text-sm mt-2 text-center">
                            Coordinates: {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                        </p>
                        <p className="text-gray-500 text-xs mt-2 text-center">
                            ⚠️ IP geolocation shows ISP network location, which may differ a little from exact location
                        </p>
                    </div>

                    {/* Details */}
                    <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                        <h2 className="text-xl font-semibold text-white mb-4">📋 Location Details</h2>
                        <div className="space-y-4">
                            <DetailRow label="IP Address" value={locationData.ip} />
                            <DetailRow label="City" value={locationData.city} />
                            <DetailRow label="Region" value={`${locationData.region} (${locationData.region_code})`} />
                            <DetailRow
                                label="Country"
                                value={
                                    <span className="flex items-center gap-2">
                                        <span className="text-2xl">{getFlagEmoji(locationData.country_code)}</span>
                                        {locationData.country} ({locationData.country_code})
                                    </span>
                                }
                            />
                            <DetailRow label="Postal Code" value={locationData.postal || 'N/A'} />
                            <DetailRow label="Timezone" value={locationData.timezone} />
                            <DetailRow label="ISP / Organization" value={locationData.isp} />
                            <DetailRow label="ASN" value={locationData.asn || 'N/A'} />
                            {locationData.fromCache && (
                                <p className="text-xs text-gray-500 mt-4">
                                    ℹ️ Data retrieved from cache
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sample IPs for Testing */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <h3 className="text-lg font-semibold text-white mb-3">🧪 Try These Sample IPs</h3>
                <div className="flex flex-wrap gap-3">
                    {[
                        { ip: '8.8.8.8', label: 'Google DNS (US)' },
                        { ip: '1.1.1.1', label: 'Cloudflare (AU)' },
                        { ip: '208.67.222.222', label: 'OpenDNS (US)' },
                        { ip: '9.9.9.9', label: 'Quad9 (CH)' },
                    ].map((sample) => (
                        <button
                            key={sample.ip}
                            onClick={() => {
                                setIpAddress(sample.ip);
                            }}
                            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg transition-colors text-sm"
                        >
                            <span className="font-mono">{sample.ip}</span>
                            <span className="text-gray-500 ml-2">- {sample.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Helper component for detail rows
function DetailRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
            <span className="text-gray-400">{label}</span>
            <span className="text-white font-medium">{value}</span>
        </div>
    );
}

// Convert country code to flag emoji
function getFlagEmoji(countryCode) {
    if (!countryCode) return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}
