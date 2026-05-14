import { z } from 'zod';

export const createClubSchema = z.object({
  name: z.string().min(1, 'Tên CLB không được để trống'),
  description: z.string().optional(),
  leader_id: z.string().uuid('leader_id phải là UUID hợp lệ'),
  is_reason_required: z.boolean().optional().default(false),
  is_promise_required: z.boolean().optional().default(false),
});

export const updateClubSchema = createClubSchema.partial();

export const joinClubSchema = z.object({
  reason: z.string().optional(),
  promise: z.string().optional(),
});
