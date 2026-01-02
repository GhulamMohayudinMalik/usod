import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { logSecurityEvent } from '../services/loggingService.js';

const router = express.Router();

// In-memory cache for IP lookups (reduces API calls)
const ipCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Helper to wait for a specified time
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Geocode cache - stores city coordinates
 */
const geocodeCache = new Map();

/**
 * Get accurate coordinates using OpenStreetMap Nominatim
 * Tries postal code first for more accuracy, falls back to city-only
 */
async function geocodeCity(city, country, countryCode, postalCode = null) {
    // Create cache key (include postal if available)
    const cacheKey = postalCode
        ? `${postalCode}-${countryCode}`.toLowerCase()
        : `${city}-${countryCode}`.toLowerCase();

    // Check cache
    if (geocodeCache.has(cacheKey)) {
        return geocodeCache.get(cacheKey);
    }

    try {
        // Try with postal code first for more precision
        if (postalCode) {
            const postalQuery = encodeURIComponent(`${postalCode}, ${city}, ${country}`);
            const postalResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${postalQuery}&format=json&limit=1`,
                { headers: { 'User-Agent': 'USOD-IPTracer/1.0' } }
            );

            if (postalResponse.ok) {
                const postalResults = await postalResponse.json();
                if (postalResults.length > 0) {
                    const coords = {
                        latitude: parseFloat(postalResults[0].lat),
                        longitude: parseFloat(postalResults[0].lon),
                        precision: 'postal'
                    };
                    geocodeCache.set(cacheKey, coords);
                    console.log(`Geocoded ${postalCode}, ${city} with postal precision`);
                    return coords;
                }
            }
        }

        // Fall back to city + country only
        const cityQuery = encodeURIComponent(`${city}, ${country}`);
        const cityResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${cityQuery}&format=json&limit=1`,
            { headers: { 'User-Agent': 'USOD-IPTracer/1.0' } }
        );

        if (cityResponse.ok) {
            const cityResults = await cityResponse.json();
            if (cityResults.length > 0) {
                const coords = {
                    latitude: parseFloat(cityResults[0].lat),
                    longitude: parseFloat(cityResults[0].lon),
                    precision: 'city'
                };
                geocodeCache.set(cacheKey, coords);
                console.log(`Geocoded ${city}, ${country} with city precision`);
                return coords;
            }
        }
    } catch (error) {
        console.log('Geocoding failed, using IP-based coordinates:', error.message);
    }

    return null; // Fall back to IP-based coordinates
}

/**
 * Helper to get IP data from ip-api.com with geocoding for accurate city location
 */
async function getIPLocation(ip, retryCount = 0) {
    // Check cache first
    const cached = ipCache.get(ip);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return { ...cached.data, fromCache: true };
    }

    try {
        // Get IP data from ip-api.com (45 requests per minute)
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as`);

        if (!response.ok) {
            throw new Error(`ip-api.com returned status ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'fail') {
            throw new Error(data.message || 'Invalid IP address');
        }

        // Get accurate coordinates for the city via geocoding
        let latitude = data.lat || 0;
        let longitude = data.lon || 0;
        let geocoded = false;
        let precision = 'ip';

        if (data.city && data.country) {
            const cityCoords = await geocodeCity(data.city, data.country, data.countryCode, data.zip);
            if (cityCoords) {
                latitude = cityCoords.latitude;
                longitude = cityCoords.longitude;
                geocoded = true;
                precision = cityCoords.precision || 'city';
            }
        }

        const locationData = {
            ip: ip,
            city: data.city || 'Unknown',
            region: data.regionName || 'Unknown',
            region_code: data.region || '',
            country: data.country || 'Unknown',
            country_code: data.countryCode || '',
            latitude: latitude,
            longitude: longitude,
            timezone: data.timezone || 'Unknown',
            utc_offset: '',
            isp: data.isp || 'Unknown',
            asn: data.as || '',
            postal: data.zip || '',
            org: data.org || '',
            geocoded: geocoded  // Flag to indicate if we used geocoding
        };

        // Cache the result
        ipCache.set(ip, {
            data: locationData,
            timestamp: Date.now()
        });

        return { ...locationData, fromCache: false };
    } catch (error) {
        console.error('Error fetching IP location:', error.message);

        if (retryCount < 2) {
            console.log(`Retrying IP lookup in 2 seconds...`);
            await delay(2000);
            return getIPLocation(ip, retryCount + 1);
        }

        throw new Error('Failed to trace IP address. Please try again.');
    }
}

/**
 * Validate IP address format (IPv4 or IPv6)
 */
function isValidIP(ip) {
    // IPv4 pattern
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // IPv6 pattern (simplified)
    const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){0,6}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$/;

    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

/**
 * GET /api/trace-ip/:ip
 * Trace an IP address and get its geolocation data
 */
router.get('/:ip', authenticateToken, async (req, res) => {
    const { ip } = req.params;

    try {
        // Validate IP format
        if (!isValidIP(ip)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid IP address format'
            });
        }

        // Get location data
        const locationData = await getIPLocation(ip);

        // Log the IP trace action
        try {
            await logSecurityEvent(req.user.id, 'ip_trace', 'success', req, {
                tracedIP: ip,
                city: locationData.city,
                country: locationData.country,
                fromCache: locationData.fromCache,
                description: `IP trace performed for ${ip} - ${locationData.city}, ${locationData.country}`
            });
        } catch (logError) {
            console.error('Failed to log IP trace:', logError);
            // Continue anyway - logging failure shouldn't block the response
        }

        res.json({
            success: true,
            data: locationData
        });
    } catch (error) {
        console.error('IP trace error:', error);

        // Log failed trace attempt
        try {
            await logSecurityEvent(req.user.id, 'ip_trace', 'failure', req, {
                tracedIP: ip,
                error: error.message,
                description: `Failed IP trace for ${ip}: ${error.message}`
            });
        } catch (logError) {
            console.error('Failed to log IP trace error:', logError);
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to trace IP address'
        });
    }
});

/**
 * POST /api/trace-ip/batch
 * Trace multiple IP addresses at once (for bulk operations)
 */
router.post('/batch', authenticateToken, async (req, res) => {
    const { ips } = req.body;

    if (!Array.isArray(ips) || ips.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide an array of IP addresses'
        });
    }

    // Limit batch size to prevent abuse
    if (ips.length > 10) {
        return res.status(400).json({
            success: false,
            message: 'Maximum 10 IPs allowed per batch request'
        });
    }

    try {
        const results = await Promise.all(
            ips.map(async (ip) => {
                try {
                    if (!isValidIP(ip)) {
                        return { ip, success: false, error: 'Invalid IP format' };
                    }
                    const data = await getIPLocation(ip);
                    return { ip, success: true, data };
                } catch (error) {
                    return { ip, success: false, error: error.message };
                }
            })
        );

        // Log batch trace
        try {
            await logSecurityEvent(req.user.id, 'ip_trace_batch', 'success', req, {
                ipCount: ips.length,
                successCount: results.filter(r => r.success).length,
                description: `Batch IP trace for ${ips.length} addresses`
            });
        } catch (logError) {
            console.error('Failed to log batch IP trace:', logError);
        }

        res.json({
            success: true,
            results
        });
    } catch (error) {
        console.error('Batch IP trace error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process batch IP trace'
        });
    }
});

/**
 * GET /api/trace-ip/cache/stats
 * Get cache statistics (admin debugging)
 */
router.get('/cache/stats', authenticateToken, async (req, res) => {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    ipCache.forEach((value) => {
        if ((now - value.timestamp) < CACHE_TTL) {
            validEntries++;
        } else {
            expiredEntries++;
        }
    });

    res.json({
        success: true,
        stats: {
            totalEntries: ipCache.size,
            validEntries,
            expiredEntries,
            cacheTTLHours: CACHE_TTL / (60 * 60 * 1000)
        }
    });
});

export default router;
