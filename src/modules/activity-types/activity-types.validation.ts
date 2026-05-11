import { z } from 'zod';

export const createActivityTypeSchema = z.object({
  name: z.string().min(1, 'Tên loại hoạt động không được để trống'),
  is_active: z.boolean().optional(),
});

export const updateActivityTypeSchema = createActivityTypeSchema.partial();
