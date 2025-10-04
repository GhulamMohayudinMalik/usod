import express from 'express';
import { SecurityLog } from '../models/SecurityLog.js';
import { generateDummyData } from '../services/dummyDataService.js';

const router = express.Router();

router.get('/all', async (req, res) => {
    try { res.json(generateDummyData()); } catch (error) { console.error('Error fetching all data:', error); res.status(500).json({ error: 'Failed to fetch data' }); }
});

router.get('/dashboard-stats', async (req, res) => {
    try {
        const securityEventsCount = await SecurityLog.countDocuments({ action: 'security_event', 'details.resolved': false });
        const securityScore = Math.floor(Math.random() * 30) + 70;
        const stats = { securityScore, activeThreats: securityEventsCount || Math.floor(Math.random() * 10) + 5, protectedUsers: Math.floor(Math.random() * 50) + 100, meanTimeToResolve: Math.floor(Math.random() * 6) + 2, lastUpdated: new Date().toISOString() };
        res.json(stats);
    } catch (error) { console.error('Error fetching dashboard stats:', error); res.status(500).json({ error: 'Failed to fetch dashboard statistics' }); }
});

router.get('/login-attempts', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 10;
        const loginLogs = await SecurityLog.find({ action: { $in: ['login'] } }).sort({ timestamp: -1 }).limit(count).populate('userId', 'username email');
        const loginAttempts = loginLogs.map((log) => ({ id: log._id.toString(), username: log.userId ? log.userId.username : 'Unknown', email: log.userId ? log.userId.email : 'unknown@example.com', ipAddress: log.ipAddress, userAgent: log.userAgent, timestamp: log.timestamp, successful: log.status === 'success', location: log.details?.location || { country: 'Unknown', city: 'Unknown', coordinates: [0, 0] }, failureReason: log.status === 'failure' ? 'Invalid credentials' : undefined }));
        if (loginAttempts.length < count) {
            const dummyData = generateDummyData();
            const combined = [...loginAttempts, ...dummyData.loginAttempts.slice(0, count - loginAttempts.length)];
            return res.json(combined);
        }
        res.json(loginAttempts);
    } catch (error) { console.error('Error fetching login attempts:', error); res.status(500).json({ error: 'Failed to fetch login attempts' }); }
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
        const securityEvents = securityEventLogs.map((log) => ({ id: log.details?.id || log._id.toString(), type: log.details?.type || 'suspicious_activity', severity: log.details?.severity || 'medium', source: log.details?.source || log.ipAddress, target: log.details?.target || 'system', timestamp: log.timestamp, description: log.details?.description || 'Security event detected', resolved: log.details?.resolved || false, resolvedAt: log.details?.resolvedAt, assignedTo: log.details?.assignedTo, relatedEvents: log.details?.relatedEvents || [] }));
        if (requestingAll) return res.json(securityEvents);
        if (securityEvents.length < count) {
            const dummyData = generateDummyData();
            const combined = [...securityEvents, ...dummyData.securityEvents.slice(0, count - securityEvents.length)];
            return res.json(combined);
        }
        res.json(securityEvents);
    } catch (error) { console.error('Error fetching security events:', error); res.status(500).json({ error: 'Failed to fetch security events' }); }
});

router.get('/ip-analysis', async (req, res) => {
    try { const count = parseInt(req.query.count) || 10; const data = generateDummyData(); res.json(data.ipAnalysis.slice(0, count)); }
    catch (error) { console.error('Error fetching IP analysis:', error); res.status(500).json({ error: 'Failed to fetch IP analysis' }); }
});

router.get('/system-logs', async (req, res) => {
    try { const count = parseInt(req.query.count) || 10; const data = generateDummyData(); res.json(data.systemLogs.slice(0, count)); }
    catch (error) { console.error('Error fetching system logs:', error); res.status(500).json({ error: 'Failed to fetch system logs' }); }
});

router.get('/threat-intel', async (req, res) => {
    try { const count = parseInt(req.query.count) || 10; const data = generateDummyData(); res.json(data.threatIntelligence.slice(0, count)); }
    catch (error) { console.error('Error fetching threat intelligence:', error); res.status(500).json({ error: 'Failed to fetch threat intelligence' }); }
});

export default router;
