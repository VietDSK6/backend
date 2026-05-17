import { Router } from 'express';
import * as reviewsController from './reviews.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createReviewSchema } from './reviews.validation';

const router = Router();

router.use(authenticate);

router.post('/', validate(createReviewSchema), reviewsController.create);
router.get('/student/:id', reviewsController.getByStudent);

export default router;
