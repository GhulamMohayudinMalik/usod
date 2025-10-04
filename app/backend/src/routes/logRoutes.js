import { Router } from 'express';
import { logController } from '../controllers/logController.js';
// import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, logController.getLogs);
router.get('/statistics', authMiddleware, logController.getLogStatistics);
router.get('/user/:userId', authMiddleware, logController.getLogsByUser);
router.post('/', authMiddleware, logController.createLog);

export default router;

