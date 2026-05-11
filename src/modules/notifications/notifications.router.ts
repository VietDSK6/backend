import { Router } from 'express';
import * as notificationsController from './notifications.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// User routes
router.get('/', notificationsController.list);
router.patch('/:id/read', notificationsController.markRead);
router.patch('/read-all', notificationsController.markAllRead);

// Admin routes
router.get('/batches', authorize(['ADMIN']), notificationsController.listBatches);
router.get('/batches/:batchId', authorize(['ADMIN']), notificationsController.getBatchDetail);
router.post('/send', authorize(['ADMIN']), notificationsController.send);

export default router;
