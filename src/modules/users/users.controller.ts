import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service';
import { sendSuccess } from '../../utils/response';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getMe(req.user!.id);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.updateMe(req.user!.id, req.body);
    sendSuccess(res, user, 'Cập nhật thành công');
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getById(req.params.id as string);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const getUserBadges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const badges = await usersService.getUserBadges(req.params.id as string);
    sendSuccess(res, badges);
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const role = req.query.role as 'STUDENT' | 'ADMIN' | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

    const result = await usersService.listUsers(page, limit, search, role, sortBy as any, sortOrder);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const user = await usersService.updateUserRole(req.params.id as string, role);
    sendSuccess(res, user, 'Cập nhật quyền thành công');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.deleteUser(req.params.id as string);
    sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const month = req.query.month as string;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy === 'events' ? 'events' : 'hours') as 'hours' | 'events';
    const leaderboard = await usersService.getLeaderboard(month, search, sortBy);
    sendSuccess(res, leaderboard);
  } catch (error) {
    next(error);
  }
};

export const getMyPointsSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const month = req.query.month as string | undefined;
    const summary = await usersService.getMyPointsSummary(req.user!.id, month);
    sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await usersService.getDashboardSummary(req.user!.id);
    sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};
