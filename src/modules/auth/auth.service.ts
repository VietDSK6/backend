import prisma from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../utils/app-error';

export const register = async (data: {
  email: string;
  password: string;
  full_name: string;
  role?: 'STUDENT' | 'ADMIN';
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError('Email đã được sử dụng', 409);
  }

  const hashed = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashed,
      full_name: data.full_name,
      role: data.role || 'STUDENT',
    },
    select: { id: true, email: true, full_name: true, role: true, created_at: true },
  });

  return user;
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const access_token = generateAccessToken(payload);
  const refresh_token = generateRefreshToken(payload);

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refresh_token,
      user_id: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    access_token,
    refresh_token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      total_points: user.total_points,
      current_points: user.current_points,
    },
  };
};

export const refresh = async (refreshToken: string) => {
  // Verify token signature
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Refresh token không hợp lệ', 401);
  }

  // Check token exists in DB
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!stored || stored.expires_at < new Date()) {
    // Clean up expired token if exists
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
    }
    throw new AppError('Refresh token đã hết hạn', 401);
  }

  const access_token = generateAccessToken({
    id: payload.id,
    email: payload.email,
    role: payload.role,
  });

  return { access_token };
};

export const logout = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
};
