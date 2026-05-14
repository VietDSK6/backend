import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  location: z.string().min(1, 'Địa điểm không được để trống'),
  start_date: z.string().datetime({ message: 'Ngày bắt đầu không hợp lệ' }),
  end_date: z.string().datetime({ message: 'Ngày kết thúc không hợp lệ' }),
  max_slots: z.coerce.number().int().min(1, 'Số slot tối thiểu là 1'),
  activity_type_id: z.string().min(1, 'Loại hoạt động không được để trống'),
  cover_image: z.string().url('cover_image phải là URL hợp lệ').optional(),
  cover_url: z.string().url('cover_url phải là URL hợp lệ').optional(),
  fixed_point: z.coerce.number().int().min(0, 'Điểm cố định phải lớn hơn hoặc bằng 0').optional(),
});

export const updateEventSchema = createEventSchema.partial();

