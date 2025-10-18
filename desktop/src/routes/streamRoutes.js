import express from 'express';
import { eventBus } from '../services/eventBus.js';

const router = express.Router();

// Simple logs SSE stream
router.get('/logs', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const keepAlive = setInterval(() => {
    res.write(`: keep-alive\n\n`);
  }, 25000);

  const onLog = (log) => {
    try {
      const payload = JSON.stringify({
        id: log._id,
        action: log.action,
        status: log.status,
        userId: log.userId,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        details: log.details,
        timestamp: log.timestamp
      });
      res.write(`event: log\n`);
      res.write(`data: ${payload}\n\n`);
    } catch {}
  };

  eventBus.on('log.created', onLog);

  req.on('close', () => {
    clearInterval(keepAlive);
    eventBus.off('log.created', onLog);
    try { res.end(); } catch {}
  });
});

export default router;


