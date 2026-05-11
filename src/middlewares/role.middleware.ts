import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Chưa xác thực', 401);
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError('Không có quyền truy cập', 403);
    }
    next();
  };
};
