import { Router } from 'express';
import * as rewardsController from './rewards.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', rewardsController.list);

// Authenticated routes
router.use(authenticate);

// Student: my transactions (must be before /:id to avoid param clash)
router.get('/transactions/me', rewardsController.getMyTransactions);

// Admin transaction routes (must be before /:id)
router.get('/transactions', authorize(['ADMIN']), rewardsController.listTransactions);
router.patch('/transactions/:id/fulfill', authorize(['ADMIN']), rewardsController.fulfillTransaction);

// Reward detail (public-ish, but after authenticate — fine for logged-in users)
router.get('/:id', rewardsController.getById);

// Student redeem
router.post('/:id/redeem', rewardsController.redeem);

// Admin CRUD
router.post('/', authorize(['ADMIN']), rewardsController.create);
router.put('/:id', authorize(['ADMIN']), rewardsController.update);
router.delete('/:id', authorize(['ADMIN']), rewardsController.remove);

export default router;
