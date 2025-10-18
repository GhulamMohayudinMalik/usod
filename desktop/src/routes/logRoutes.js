import { Router } from 'express';
import { logController } from '../controllers/logController.js';
import { performSecurityCheck } from '../services/securityDetectionService.js';

const router = Router();

// General log routes
router.get('/', logController.getLogs);
router.get('/statistics', logController.getLogStatistics);
router.post('/', performSecurityCheck, logController.createLog);
router.post('/clear', performSecurityCheck, logController.clearLogs);
router.put('/:id/status', performSecurityCheck, logController.updateLogStatus);

// Platform-specific ingestion routes
router.post('/desktop/ingest', performSecurityCheck, logController.bulkIngest);
router.post('/mobile/ingest', performSecurityCheck, logController.bulkIngest);

// Platform-specific log retrieval
router.get('/desktop', (req, res, next) => {
  req.query.platform = 'desktop';
  next();
}, logController.getLogs);

router.get('/mobile', (req, res, next) => {
  req.query.platform = 'mobile';
  next();
}, logController.getLogs);

export default router;

