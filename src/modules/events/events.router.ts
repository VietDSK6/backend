import { Router } from 'express';
import * as eventsController from './events.controller';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { upload } from '../../config/upload';
import { createEventSchema, updateEventSchema } from './events.validation';

const router = Router();

// Public (enriched with user context when authenticated)
router.get('/', optionalAuthenticate, eventsController.list);
router.get('/:id', optionalAuthenticate, eventsController.getById);

// Admin only
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  upload.single('cover_image'),
  validate(createEventSchema),
  eventsController.create,
);
router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(updateEventSchema),
  eventsController.update,
);
router.delete('/:id', authenticate, requireRole('ADMIN'), eventsController.remove);
router.get('/:id/applications', authenticate, eventsController.getApplications);
router.get('/:id/export', authenticate, eventsController.exportExcel);

// Event Managers (checked in service)
router.get('/:id/managers', authenticate, eventsController.getManagers);
router.post('/:id/managers', authenticate, eventsController.addManager);
router.delete('/:id/managers/:userId', authenticate, eventsController.removeManager);

export default router;
