import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiService from '../services/api';

// Fix for default marker icon
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map view changes
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
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

const IPTracerPage = () => {
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
            const result = await apiService.traceIP(ip);

            if (result.success) {
                setLocationData(result.data);
                setRecentTraces(prev => {
                    const newTraces = [result.data, ...prev.filter(t => t.ip !== ip)].slice(0, 5);
                    return newTraces;
                });
            } else {
                setError(result.message || 'Failed to trace IP address');
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

    // Sample IPs for testing
    const sampleIPs = [
        { ip: '8.8.8.8', label: 'Google DNS (US)' },
        { ip: '1.1.1.1', label: 'Cloudflare (AU)' },
        { ip: '208.67.222.222', label: 'OpenDNS (US)' },
        { ip: '9.9.9.9', label: 'Quad9 (CH)' },
    ];

    return (
        <div style={{ padding: '1.5rem', color: 'white' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', margin: 0 }}>
                    🌍 IP Tracer
                </h1>
                <p style={{ color: '#9ca3af', margin: '0.5rem 0 0 0' }}>
                    Trace any IP address and view its geographic location on the map
                </p>
            </div>

            {/* Search Form */}
            <div style={{
                background: 'rgba(31, 41, 55, 0.8)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                marginBottom: '1.5rem'
            }}>
                <form onSubmit={traceIP} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.5rem' }}>
                            IP Address
                        </label>
                        <input
                            type="text"
                            value={ipAddress}
                            onChange={(e) => setIpAddress(e.target.value)}
                            placeholder="Enter IP address (e.g., 8.8.8.8)"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(55, 65, 81, 0.5)',
                                border: '1px solid rgba(75, 85, 99, 0.5)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: loading ? '#4b5563' : 'linear-gradient(to right, #059669, #0891b2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Tracing...' : '🔍 Trace IP'}
                        </button>
                    </div>
                </form>

                {/* Recent traces */}
                {recentTraces.length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(75, 85, 99, 0.3)' }}>
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Recent traces:</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {recentTraces.map((trace) => (
                                <button
                                    key={trace.ip}
                                    onClick={() => quickTrace(trace.ip)}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        background: 'rgba(55, 65, 81, 0.5)',
                                        color: '#d1d5db',
                                        border: 'none',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                    }}
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
                <div style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    color: '#ef4444',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            {/* Results */}
            {locationData && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Map */}
                    <div style={{
                        background: 'rgba(31, 41, 55, 0.8)',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(75, 85, 99, 0.3)'
                    }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                            📍 Location Map
                        </h2>
                        <div style={{ height: '350px', borderRadius: '0.5rem', overflow: 'hidden' }}>
                            <MapContainer
                                center={[locationData.latitude, locationData.longitude]}
                                zoom={10}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={true}
                            >
                                <ChangeView center={[locationData.latitude, locationData.longitude]} zoom={10} />
                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[locationData.latitude, locationData.longitude]}>
                                    <Popup>
                                        <strong>{locationData.ip}</strong><br />
                                        {locationData.city}, {locationData.country}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem' }}>
                            Coordinates: {locationData.latitude?.toFixed(4)}, {locationData.longitude?.toFixed(4)}
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '0.65rem', textAlign: 'center', marginTop: '0.25rem' }}>
                            ⚠️ IP geolocation shows ISP network location, which may differ a little from exact location
                        </p>
                    </div>

                    {/* Details */}
                    <div style={{
                        background: 'rgba(31, 41, 55, 0.8)',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(75, 85, 99, 0.3)'
                    }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                            📋 Location Details
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <DetailRow label="IP Address" value={locationData.ip} />
                            <DetailRow label="City" value={locationData.city} />
                            <DetailRow label="Region" value={`${locationData.region} (${locationData.region_code})`} />
                            <DetailRow
                                label="Country"
                                value={
                                    <span>
                                        <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>
                                            {getFlagEmoji(locationData.country_code)}
                                        </span>
                                        {locationData.country} ({locationData.country_code})
                                    </span>
                                }
                            />
                            <DetailRow label="Postal Code" value={locationData.postal || 'N/A'} />
                            <DetailRow label="Timezone" value={locationData.timezone} />
                            <DetailRow label="ISP / Organization" value={locationData.isp} />
                            <DetailRow label="ASN" value={locationData.asn || 'N/A'} />
                        </div>
                    </div>
                </div>
            )}

            {/* Sample IPs */}
            <div style={{
                background: 'rgba(31, 41, 55, 0.5)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(75, 85, 99, 0.2)'
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '0.75rem' }}>
                    🧪 Try These Sample IPs
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {sampleIPs.map((sample) => (
                        <button
                            key={sample.ip}
                            onClick={() => setIpAddress(sample.ip)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(55, 65, 81, 0.5)',
                                color: '#d1d5db',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontFamily: 'monospace' }}>{sample.ip}</span>
                            <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>- {sample.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper component for detail rows
function DetailRow({ label, value }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0',
            borderBottom: '1px solid rgba(75, 85, 99, 0.3)'
        }}>
            <span style={{ color: '#9ca3af' }}>{label}</span>
            <span style={{ color: 'white', fontWeight: '500' }}>{value}</span>
        </div>
    );
}

export default IPTracerPage;
