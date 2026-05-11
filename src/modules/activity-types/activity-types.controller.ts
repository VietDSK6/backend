import { Request, Response, NextFunction } from 'express';
import * as activityTypesService from './activity-types.service';
import { sendSuccess } from '../../utils/response';

export const listActive = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await activityTypesService.listActive();
    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
};

export const listAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await activityTypesService.listAll();
    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await activityTypesService.create(req.body);
    sendSuccess(res, item, 'Tạo loại hoạt động thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await activityTypesService.update(req.params.id as string, req.body);
    sendSuccess(res, item, 'Cập nhật loại hoạt động thành công');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await activityTypesService.remove(req.params.id as string);
    sendSuccess(res, null, 'Xóa loại hoạt động thành công');
  } catch (error) {
    next(error);
  }
};
