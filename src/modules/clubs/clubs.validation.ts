import { z } from 'zod';

export const createClubSchema = z.object({
  name: z.string().min(1, 'Tên CLB không được để trống'),
  description: z.string().optional(),
  leader_id: z.string().uuid('leader_id phải là UUID hợp lệ'),
});

export const updateClubSchema = createClubSchema.partial();
