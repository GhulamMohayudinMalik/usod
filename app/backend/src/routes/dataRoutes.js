import express from 'express';
import { SecurityLog } from '../models/securityLog.js';
import { User } from '../models/User.js';

const router = express.Router();

router.get('/all', async (req, res) => {
    try {
        const [securityEvents, loginAttempts] = await Promise.all([
            SecurityLog.find({ action: 'security_event' }).sort({ timestamp: -1 }).limit(50),
            SecurityLog.find({ action: 'login' }).sort({ timestamp: -1 }).limit(50)
        ]);

        res.json({
            securityEvents: securityEvents.map(log => ({
                id: log.details?.id || log._id.toString(),
                type: log.details?.type || 'suspicious_activity',
                severity: log.details?.severity || 'medium',
                source: log.details?.source || log.ipAddress,
                target: log.details?.target || 'system',
                timestamp: log.timestamp,
                description: log.details?.description || 'Security event detected',
                resolved: log.details?.resolved || false
            })),
            loginAttempts: loginAttempts.map(log => ({
                id: log._id.toString(),
                username: 'user',
                email: 'user@example.com',
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                timestamp: log.timestamp,
                successful: log.status === 'success',
                location: log.details?.location || { country: 'Unknown', city: 'Unknown', coordinates: [0, 0] }
            }))
        });
    } catch (error) {
        console.error('Error fetching all data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

router.get('/dashboard-stats', async (req, res) => {
    try {
        // Get total threats and resolved threats for Security Score calculation
        const [totalThreats, resolvedThreats, escalatedThreats, activeUsers] = await Promise.all([
            SecurityLog.countDocuments({ action: 'security_event' }),
            SecurityLog.countDocuments({ action: 'security_event', 'details.status': 'resolved' }),
            SecurityLog.countDocuments({ action: 'security_event', 'details.status': 'escalated' }),
            User.countDocuments({ isActive: true })
        ]);

        // Security Score = (resolved threats / total threats) * 100
        const securityScore = totalThreats > 0 ? Math.round((resolvedThreats / totalThreats) * 100) : 100;

        // MTTR (hours): average of (resolvedAt - createdAt) for resolved security events
        const mttrAgg = await SecurityLog.aggregate([
            { $match: { action: 'security_event', 'details.status': 'resolved', 'details.statusUpdatedAt': { $exists: true } } },
            { $project: { diffMs: { $subtract: ['$details.statusUpdatedAt', '$timestamp'] } } },
            { $group: { _id: null, avgMs: { $avg: '$diffMs' } } }
        ]);
        const meanTimeToResolve = mttrAgg.length ? Math.max(0, Math.round((mttrAgg[0].avgMs / (1000 * 60 * 60)) * 10) / 10) : null;

        res.json({
            securityScore,
            activeThreats: escalatedThreats, // Active Threats = count of escalated threats
            protectedUsers: activeUsers,
            totalThreats,
            resolvedThreats,
            meanTimeToResolve,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

router.get('/login-attempts', async (req, res) => {
    try {
        const countParam = req.query.count;
        let count = 10;
        if (countParam !== undefined) {
            const parsed = parseInt(countParam);
            if (!Number.isNaN(parsed) && parsed > 0) count = Math.min(parsed, 200);
        }

        const loginLogs = await SecurityLog
            .find({ action: 'login' })
            .sort({ timestamp: -1 })
            .limit(count)
            .lean();

        const loginAttempts = loginLogs.map((log) => ({
            id: log._id?.toString?.() || String(log._id),
            username: 'user',
            email: 'user@example.com',
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            timestamp: log.timestamp,
            successful: log.status === 'success',
            location: log.details?.location || { country: 'Unknown', city: 'Unknown', coordinates: [0, 0] },
            failureReason: log.status === 'failure' ? (log.details?.failureReason || 'Invalid credentials') : undefined
        }));

        res.json(loginAttempts);
    } catch (error) {
        console.error('Error fetching login attempts:', error);
        res.status(500).json({ error: 'Failed to fetch login attempts' });
    }
});

router.get('/security-events', async (req, res) => {
    try {
        const countParam = req.query.count;
        let count = 10;
        const requestingAll = countParam === 'all';
        if (!requestingAll && countParam) count = parseInt(countParam) || 10;
        const query = SecurityLog.find({ action: 'security_event' }).sort({ timestamp: -1 });
        if (!requestingAll && count <= 100) { query.limit(count); }
        const securityEventLogs = await query.exec();
        const securityEvents = securityEventLogs.map((log) => ({
            id: log._id.toString(), // Use actual MongoDB _id for updates
            eventId: log.details?.id || log._id.toString(), // Keep original event ID for display
            type: log.details?.type || 'suspicious_activity',
            severity: log.details?.severity || 'medium',
            source: log.details?.source || log.ipAddress,
            target: log.details?.target || 'system',
            timestamp: log.timestamp,
            description: log.details?.description || 'Security event detected',
            resolved: log.details?.resolved || false,
            resolvedAt: log.details?.resolvedAt,
            assignedTo: log.details?.assignedTo,
            relatedEvents: log.details?.relatedEvents || [],
            status: log.details?.status || 'open' // Include status field
        }));
        res.json(securityEvents);
    } catch (error) {
        console.error('Error fetching security events:', error);
        res.status(500).json({ error: 'Failed to fetch security events' });
    }
});


export default router;
