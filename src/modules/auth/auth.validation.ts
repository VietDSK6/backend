import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  full_name: z.string().min(1, 'Họ tên không được để trống'),
  role: z.enum(['STUDENT', 'ADMIN']).optional().default('STUDENT'),
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token không được để trống'),
});
