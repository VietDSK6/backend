import { Request, Response, NextFunction } from 'express';
import * as notificationsService from './notifications.service';
import { sendSuccess } from '../../utils/response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await notificationsService.list(req.user!.id);
    sendSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
};

export const listBatches = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const batches = await notificationsService.listBatches();
    sendSuccess(res, batches);
  } catch (error) {
    next(error);
  }
};

export const getBatchDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batch = await notificationsService.getBatchDetail(req.params.batchId as string);
    sendSuccess(res, batch);
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationsService.markRead(req.params.id as string, req.user!.id);
    sendSuccess(res, notification, 'Đã đánh dấu đã đọc');
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationsService.markAllRead(req.user!.id);
    sendSuccess(res, null, 'Đã đánh dấu tất cả đã đọc');
  } catch (error) {
    next(error);
  }
};

export const send = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationsService.sendNotification(req.body);
    sendSuccess(res, result, `Đã gửi ${result.count} thông báo`);
  } catch (error) {
    next(error);
  }
};
