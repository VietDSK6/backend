import { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service';
import { sendSuccess } from '../../utils/response';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await dashboardService.getStats(req.user!.id);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

export const getHoursByMonth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getHoursByMonth(req.user!.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getApplicationStatus(req.user!.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getPointsAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getPointsAnalytics(req.user!.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getPointsByMonth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getPointsByMonth(req.user!.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
