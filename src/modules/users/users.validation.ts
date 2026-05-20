import { z } from 'zod';

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).optional(),
  avatar_url: z.string().url().optional(),
  phone: z.string().trim().min(1).max(30).nullable().optional(),
  student_id: z.string().trim().min(1).max(50).nullable().optional(),
  faculty: z.string().trim().min(1).max(120).nullable().optional(),
  class_name: z.string().trim().min(1).max(80).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  birthday: z.coerce.date().nullable().optional(),
  social_link: z.string().url().nullable().optional(),
  emergency_contact_name: z.string().trim().min(1).max(120).nullable().optional(),
  emergency_contact_phone: z.string().trim().min(1).max(30).nullable().optional(),
});
