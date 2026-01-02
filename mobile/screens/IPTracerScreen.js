import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    Dimensions,
    Linking,
    Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const IPTracerScreen = () => {
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

    // Convert country code to flag emoji
    const getFlagEmoji = (countryCode) => {
        if (!countryCode) return '🌍';
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    };

    // Trace IP address
    const traceIP = async () => {
        const ip = ipAddress.trim();

        if (!ip) {
            Alert.alert('Error', 'Please enter an IP address');
            return;
        }

        if (!isValidIP(ip)) {
            Alert.alert('Error', 'Please enter a valid IPv4 address (e.g., 8.8.8.8)');
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

    // Generate HTML for the map
    const getMapHTML = (lat, lng, city, country, ip) => {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${lat}, ${lng}], 10);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          L.marker([${lat}, ${lng}]).addTo(map)
            .bindPopup('<b>${ip}</b><br>${city}, ${country}')
            .openPopup();
        </script>
      </body>
      </html>
    `;
    };

    // Sample IPs
    const sampleIPs = [
        { ip: '8.8.8.8', label: 'Google' },
        { ip: '1.1.1.1', label: 'Cloudflare' },
        { ip: '9.9.9.9', label: 'Quad9' },
    ];

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={() => { }} />
            }
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>🌍 IP Tracer</Text>
                    <Text style={styles.subtitle}>Trace IP addresses and view their location</Text>
                </View>

                {/* Search Form */}
                <View style={styles.searchCard}>
                    <Text style={styles.label}>IP Address</Text>
                    <TextInput
                        style={styles.input}
                        value={ipAddress}
                        onChangeText={setIpAddress}
                        placeholder="Enter IP address (e.g., 8.8.8.8)"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                    />
                    <TouchableOpacity
                        style={[styles.traceButton, loading && styles.traceButtonDisabled]}
                        onPress={traceIP}
                        disabled={loading}
                    >
                        <Text style={styles.traceButtonText}>
                            {loading ? 'Tracing...' : '🔍 Trace IP'}
                        </Text>
                    </TouchableOpacity>

                    {/* Sample IPs */}
                    <View style={styles.sampleContainer}>
                        <Text style={styles.sampleLabel}>Try:</Text>
                        {sampleIPs.map((sample) => (
                            <TouchableOpacity
                                key={sample.ip}
                                style={styles.sampleButton}
                                onPress={() => setIpAddress(sample.ip)}
                            >
                                <Text style={styles.sampleText}>{sample.ip}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Traces */}
                {recentTraces.length > 0 && (
                    <View style={styles.recentCard}>
                        <Text style={styles.recentLabel}>Recent Traces:</Text>
                        <View style={styles.recentList}>
                            {recentTraces.map((trace) => (
                                <TouchableOpacity
                                    key={trace.ip}
                                    style={styles.recentItem}
                                    onPress={() => {
                                        setIpAddress(trace.ip);
                                        setLocationData(trace);
                                    }}
                                >
                                    <Text style={styles.recentText}>
                                        {trace.ip} ({trace.country_code})
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Error Message */}
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* Results */}
                {locationData && (
                    <>
                        {/* Map */}
                        <View style={styles.mapCard}>
                            <Text style={styles.cardTitle}>📍 Location Map</Text>
                            <View style={styles.mapContainer}>
                                <WebView
                                    source={{
                                        html: getMapHTML(
                                            locationData.latitude,
                                            locationData.longitude,
                                            locationData.city,
                                            locationData.country,
                                            locationData.ip
                                        )
                                    }}
                                    style={styles.map}
                                    scrollEnabled={false}
                                />
                            </View>
                            <Text style={styles.coordinates}>
                                {locationData.latitude?.toFixed(4)}, {locationData.longitude?.toFixed(4)}
                            </Text>
                            <Text style={styles.disclaimer}>
                                ⚠️ IP geolocation shows ISP network location, which may differ a little from exact location
                            </Text>
                        </View>

                        {/* Details */}
                        <View style={styles.detailsCard}>
                            <Text style={styles.cardTitle}>📋 Location Details</Text>
                            <DetailRow label="IP Address" value={locationData.ip} />
                            <DetailRow label="City" value={locationData.city} />
                            <DetailRow label="Region" value={`${locationData.region} (${locationData.region_code})`} />
                            <DetailRow
                                label="Country"
                                value={`${getFlagEmoji(locationData.country_code)} ${locationData.country}`}
                            />
                            <DetailRow label="Postal Code" value={locationData.postal || 'N/A'} />
                            <DetailRow label="Timezone" value={locationData.timezone} />
                            <DetailRow label="ISP" value={locationData.isp} />
                            <DetailRow label="ASN" value={locationData.asn || 'N/A'} />
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

// Helper component for detail rows
const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    content: {
        padding: 16,
        paddingBottom: 30,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    searchCard: {
        backgroundColor: '#1F2937',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(55, 65, 81, 0.5)',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#D1D5DB',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#374151',
        borderWidth: 1,
        borderColor: 'rgba(55, 65, 81, 0.5)',
        borderRadius: 8,
        padding: 12,
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 12,
    },
    traceButton: {
        backgroundColor: '#059669',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    traceButtonDisabled: {
        backgroundColor: '#4B5563',
    },
    traceButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    sampleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        flexWrap: 'wrap',
        gap: 8,
    },
    sampleLabel: {
        color: '#9CA3AF',
        fontSize: 14,
        marginRight: 8,
    },
    sampleButton: {
        backgroundColor: 'rgba(55, 65, 81, 0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    sampleText: {
        color: '#D1D5DB',
        fontSize: 12,
        fontFamily: 'monospace',
    },
    recentCard: {
        backgroundColor: 'rgba(31, 41, 55, 0.5)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    recentLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 8,
    },
    recentList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    recentItem: {
        backgroundColor: 'rgba(55, 65, 81, 0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    recentText: {
        color: '#D1D5DB',
        fontSize: 12,
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
    },
    mapCard: {
        backgroundColor: '#1F2937',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(55, 65, 81, 0.5)',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    mapContainer: {
        height: 250,
        borderRadius: 8,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    coordinates: {
        color: '#9CA3AF',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    disclaimer: {
        color: '#6B7280',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 4,
    },
    detailsCard: {
        backgroundColor: '#1F2937',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(55, 65, 81, 0.5)',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(55, 65, 81, 0.3)',
    },
    detailLabel: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    detailValue: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        maxWidth: '60%',
        textAlign: 'right',
    },
});

export default IPTracerScreen;
