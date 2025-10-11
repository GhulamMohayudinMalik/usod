import { Router } from 'express';
import { logController } from '../controllers/logController.js';
import { performSecurityCheck } from '../services/securityDetectionService.js';

const router = Router();

router.get('/', logController.getLogs);
router.get('/statistics', logController.getLogStatistics);
router.post('/', performSecurityCheck, logController.createLog);
router.post('/clear', performSecurityCheck, logController.clearLogs);

export default router;

