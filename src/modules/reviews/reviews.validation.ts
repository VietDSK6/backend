import { z } from 'zod';

export const createReviewSchema = z.object({
  application_id: z.string().uuid('Application ID không hợp lệ'),
  rating_score: z.number().int().min(1).max(5, 'Điểm đánh giá từ 1 đến 5'),
  feedback_text: z.string().optional(),
});
