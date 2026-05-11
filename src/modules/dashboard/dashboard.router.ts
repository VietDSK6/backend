import { Router } from 'express';
import * as dashboardController from './dashboard.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', dashboardController.getStats);
router.get('/hours-by-month', dashboardController.getHoursByMonth);
router.get('/application-status', dashboardController.getApplicationStatus);
router.get('/points-analytics', dashboardController.getPointsAnalytics);
router.get('/points-by-month', dashboardController.getPointsByMonth);

export default router;
