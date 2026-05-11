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

// Admin
router.patch('/:id/approve', requireRole('ADMIN'), applicationsController.approve);
router.patch('/:id/reject', requireRole('ADMIN'), applicationsController.reject);
router.patch('/:id/complete', requireRole('ADMIN'), applicationsController.complete);

export default router;
