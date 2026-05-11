import { Router } from 'express';
import * as badgesController from './badges.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', badgesController.list);

// Admin routes
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.post('/', badgesController.create);
router.post('/backfill', badgesController.backfill);
router.put('/:id', badgesController.update);
router.delete('/:id', badgesController.remove);

export default router;
