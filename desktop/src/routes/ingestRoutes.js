import express from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import { SecurityLog } from '../models/SecurityLog.js';
import { eventBus } from '../services/eventBus.js';
import { performSecurityCheck } from '../services/securityDetectionService.js';

const router = express.Router();

// Ingest login attempt only (first real log type)
router.post('/login', performSecurityCheck, apiKeyAuth, async (req, res) => {
  try {
    const { userId, status, ipAddress, userAgent, details, timestamp } = req.body || {};
    if (!userId || !status) {
      return res.status(400).json({ message: 'Missing required fields: userId, status' });
    }
    if (!['success', 'failure'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use one of: success, failure' });
    }

    const saved = await SecurityLog.create({
      userId,
      action: 'login',
      status,
      ipAddress: ipAddress || req.ip || '0.0.0.0',
      userAgent: userAgent || req.get('user-agent') || 'unknown',
      details: details || {},
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    eventBus.emit('log.created', saved);
    return res.status(201).json({ message: 'Login log ingested', id: saved._id });
  } catch (error) {
    console.error('Ingest login error:', error);
    return res.status(500).json({ message: 'Failed to ingest login log' });
  }
});

// Ingest a single log
router.post('/log', performSecurityCheck, apiKeyAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.action || !payload.status) {
      return res.status(400).json({ message: 'Missing required fields: action, status' });
    }
    if (!payload.userId) {
      return res.status(400).json({ message: 'Missing required field: userId' });
    }

    const saved = await SecurityLog.create({
      userId: payload.userId,
      action: payload.action,
      status: payload.status,
      ipAddress: payload.ipAddress || req.ip || '0.0.0.0',
      userAgent: payload.userAgent || req.get('user-agent') || 'unknown',
      details: payload.details || {},
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date()
    });

    eventBus.emit('log.created', saved);
    return res.status(201).json({ message: 'Log ingested', id: saved._id });
  } catch (error) {
    console.error('Ingest single log error:', error);
    return res.status(500).json({ message: 'Failed to ingest log' });
  }
});

// Ingest batch logs
router.post('/logs', performSecurityCheck, apiKeyAuth, async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : (req.body?.logs || []);
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Provide an array of logs' });
    }

    const docs = items.map((p) => ({
      userId: p.userId,
      action: p.action,
      status: p.status,
      ipAddress: p.ipAddress || '0.0.0.0',
      userAgent: p.userAgent || 'unknown',
      details: p.details || {},
      timestamp: p.timestamp ? new Date(p.timestamp) : new Date()
    }));

    // Basic validation
    for (const d of docs) {
      if (!d.userId || !d.action || !d.status) {
        return res.status(400).json({ message: 'Each log requires userId, action, status' });
      }
    }

    const result = await SecurityLog.insertMany(docs, { ordered: false });
    result.forEach((doc) => eventBus.emit('log.created', doc));
    return res.status(201).json({ message: 'Logs ingested', inserted: result.length });
  } catch (error) {
    console.error('Ingest batch logs error:', error);
    return res.status(500).json({ message: 'Failed to ingest logs' });
  }
});

export default router;


