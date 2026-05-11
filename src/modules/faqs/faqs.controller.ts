import { Request, Response, NextFunction } from 'express';
import * as faqsService from './faqs.service';
import { sendSuccess } from '../../utils/response';

export const listActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faqs = await faqsService.listActive();
    sendSuccess(res, faqs);
  } catch (error) {
    next(error);
  }
};

export const listAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faqs = await faqsService.listAll();
    sendSuccess(res, faqs);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faq = await faqsService.create(req.body);
    sendSuccess(res, faq, 'Tạo FAQ thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faq = await faqsService.update(req.params.id as string, req.body);
    sendSuccess(res, faq, 'Cập nhật FAQ thành công');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await faqsService.remove(req.params.id as string);
    sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
};
