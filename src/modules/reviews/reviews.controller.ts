import { Request, Response, NextFunction } from 'express';
import * as reviewsService from './reviews.service';
import { sendSuccess } from '../../utils/response';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await reviewsService.create(req.user!.id, req.user!.role, req.body);
    sendSuccess(res, review, 'Đánh giá thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const getByStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await reviewsService.getByStudent(req.params.id as string);
    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
};
