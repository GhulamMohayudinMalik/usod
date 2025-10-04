import { Router } from 'express';
import { logController } from '../controllers/logController.js';

const router = Router();

router.get('/', logController.getLogs);
router.get('/statistics', logController.getLogStatistics);
router.post('/', logController.createLog);

export default router;

