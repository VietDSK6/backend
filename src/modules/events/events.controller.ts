import { Request, Response, NextFunction } from 'express';
import * as eventsService from './events.service';
import * as exportService from '../../services/export.service';
import { sendSuccess } from '../../utils/response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await eventsService.list({
      search: req.query.search as string,
      category: req.query.category as string,
      activity_type_id: req.query.activity_type_id as string,
      status: req.query.status as string,
      is_applied: req.query.is_applied === 'true',
      userId: req.user?.id,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
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
    const event = await eventsService.getById(req.params.id as string, req.user?.id);
    sendSuccess(res, event);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parse JSON fields if sent via multipart/form-data
    const body = req.file ? { ...req.body, max_slots: Number(req.body.max_slots) } : req.body;
    const event = await eventsService.create(req.user!.id, body, req.file?.buffer);
    sendSuccess(res, event, 'Tạo sự kiện thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventsService.update(req.params.id as string, req.user!.id, req.body);
    sendSuccess(res, event, 'Cập nhật sự kiện thành công');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await eventsService.remove(req.params.id as string, req.user!.id);
    sendSuccess(res, null, 'Xóa sự kiện thành công');
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applications = await eventsService.getApplications(req.params.id as string);
    sendSuccess(res, applications);
  } catch (error) {
    next(error);
  }
};

export const exportExcel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await exportService.exportEventParticipants(req.params.id as string, req.user!.id);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=participants.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
