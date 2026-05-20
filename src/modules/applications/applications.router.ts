import { Router } from 'express';
import * as applicationsController from './applications.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { applySchema } from './applications.validation';

const router = Router();

router.use(authenticate);

// Student
router.post('/', requireRole('STUDENT'), validate(applySchema), applicationsController.apply);
router.get('/my', requireRole('STUDENT'), applicationsController.getMyApplications);
router.patch('/:id/cancel', requireRole('STUDENT'), applicationsController.cancel);

// Admin or Event Manager
router.patch('/:id/approve', applicationsController.approve);
router.patch('/:id/reject', applicationsController.reject);
router.patch('/:id/complete', applicationsController.complete);

export default router;
