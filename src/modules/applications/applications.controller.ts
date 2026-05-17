import { Request, Response, NextFunction } from 'express';
import * as applicationsService from './applications.service';
import { sendSuccess } from '../../utils/response';

export const apply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationsService.apply(req.user!.id, req.body.event_id);
    sendSuccess(res, application, 'Đăng ký thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applications = await applicationsService.getMyApplications(req.user!.id);
    sendSuccess(res, applications);
  } catch (error) {
    next(error);
  }
};

export const approve = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationsService.approve(req.params.id as string, req.user!.id, req.user!.role);
    sendSuccess(res, application, 'Đã duyệt đơn');
  } catch (error) {
    next(error);
  }
};

export const reject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationsService.reject(req.params.id as string, req.user!.id, req.user!.role);
    sendSuccess(res, application, 'Đã từ chối đơn');
  } catch (error) {
    next(error);
  }
};

export const complete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationsService.complete(req.params.id as string, req.user!.id, req.user!.role);
    sendSuccess(res, application, 'Đã hoàn thành');
  } catch (error) {
    next(error);
  }
};
