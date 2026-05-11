import { Router } from 'express';
import * as controller from './activity-types.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createActivityTypeSchema, updateActivityTypeSchema } from './activity-types.validation';

const router = Router();

// Public — only active types
router.get('/', controller.listActive);

// Admin
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/all', controller.listAll);
router.post('/', validate(createActivityTypeSchema), controller.create);
router.put('/:id', validate(updateActivityTypeSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;
