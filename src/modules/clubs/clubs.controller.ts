import { Request, Response, NextFunction } from 'express';
import * as clubsService from './clubs.service';
import { sendSuccess } from '../../utils/response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await clubsService.list({
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    });
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const club = await clubsService.getById(req.params.id as string);
    sendSuccess(res, club);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const club = await clubsService.create(req.body);
    sendSuccess(res, club, 'Tạo CLB thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const club = await clubsService.update(req.params.id as string, req.body);
    sendSuccess(res, club, 'Cập nhật CLB thành công');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clubsService.remove(req.params.id as string);
    sendSuccess(res, null, 'Xóa CLB thành công');
  } catch (error) {
    next(error);
  }
};

export const join = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await clubsService.join(req.params.id as string, req.user!.id);
    sendSuccess(res, member, 'Tham gia CLB thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const leave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clubsService.leave(req.params.id as string, req.user!.id);
    sendSuccess(res, null, 'Rời CLB thành công');
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await clubsService.getMembers(req.params.id as string);
    sendSuccess(res, members);
  } catch (error) {
    next(error);
  }
};

export const kickMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clubsService.kickMember(req.params.id as string, req.user!.id, req.params.userId as string);
    sendSuccess(res, null, 'Kick thành viên thành công');
  } catch (error) {
    next(error);
  }
};

