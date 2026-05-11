import { Router } from 'express';
import * as usersController from './users.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { updateProfileSchema } from './users.validation';

const router = Router();

router.use(authenticate); // All user routes require auth

router.get('/me', usersController.getMe);
router.put('/me', validate(updateProfileSchema), usersController.updateMe);
router.get('/me/points-summary', usersController.getMyPointsSummary);
router.get('/me/dashboard-summary', usersController.getDashboardSummary);
router.get('/leaderboard', usersController.getLeaderboard);

// Admin routes
router.get('/', authorize(['ADMIN']), usersController.listUsers);
router.put('/:id/role', authorize(['ADMIN']), usersController.updateUserRole);
router.delete('/:id', authorize(['ADMIN']), usersController.deleteUser);

// Other specific user routes
router.get('/:id', usersController.getById);
router.get('/:id/badges', usersController.getUserBadges);

export default router;
