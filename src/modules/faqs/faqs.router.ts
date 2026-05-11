import { Router } from 'express';
import * as faqsController from './faqs.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', faqsController.listActive);

// Authenticated routes
router.use(authenticate);

// Both ADMIN and STUDENT can view all FAQs
router.get('/all', authorize(['ADMIN', 'STUDENT']), faqsController.listAll);

// Only ADMIN can Create, Update, Delete FAQs
router.use(authorize(['ADMIN']));
router.post('/', faqsController.create);
router.put('/:id', faqsController.update);
router.delete('/:id', faqsController.remove);

export default router;
