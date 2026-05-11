import { Request, Response, NextFunction } from 'express';
import * as badgesService from './badges.service';
import { sendSuccess } from '../../utils/response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const badges = await badgesService.list();
    sendSuccess(res, badges);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const badge = await badgesService.create(req.body);
    sendSuccess(res, badge, 'Tạo huy hiệu thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const badge = await badgesService.update(req.params.id as string, req.body);
    sendSuccess(res, badge, 'Cập nhật huy hiệu thành công');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await badgesService.remove(req.params.id as string);
    sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
};

export const backfill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await badgesService.backfillAllUsers();
    sendSuccess(res, result, `Đã kiểm tra huy hiệu cho ${result.processed} người dùng`);
  } catch (error) {
    next(error);
  }
};
