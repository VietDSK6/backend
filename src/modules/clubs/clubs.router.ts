import { Router } from 'express';
import * as clubsController from './clubs.controller';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createClubSchema, updateClubSchema } from './clubs.validation';

const router = Router();

// Public (enriched with user context when authenticated)
router.get('/', optionalAuthenticate, clubsController.list);
router.get('/:id', optionalAuthenticate, clubsController.getById);
router.get('/:id/members', optionalAuthenticate, clubsController.getMembers);

// Admin only
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(createClubSchema),
  clubsController.create,
);
router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(updateClubSchema),
  clubsController.update,
);
router.delete('/:id', authenticate, requireRole('ADMIN'), clubsController.remove);

// Authenticated users
router.post('/:id/join', authenticate, clubsController.join);
router.delete('/:id/leave', authenticate, clubsController.leave);
router.delete('/:id/members/:userId', authenticate, clubsController.kickMember);

export default router;

