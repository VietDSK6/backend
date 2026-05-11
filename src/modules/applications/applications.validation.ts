import { z } from 'zod';

export const applySchema = z.object({
  event_id: z.string().uuid('Event ID không hợp lệ'),
});
