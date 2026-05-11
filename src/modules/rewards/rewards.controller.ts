import { Request, Response, NextFunction } from 'express';
import * as rewardsService from './rewards.service';
import { sendSuccess } from '../../utils/response';

// ─── Reward CRUD ─────────────────────────────────────

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, is_active, page, limit } = req.query;
    const rewards = await rewardsService.list({
      search: search as string,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendSuccess(res, rewards);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reward = await rewardsService.getById(req.params.id as string);
    sendSuccess(res, reward);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reward = await rewardsService.create(req.body);
    sendSuccess(res, reward, 'Tạo phần thưởng thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reward = await rewardsService.update(req.params.id as string, req.body);
    sendSuccess(res, reward, 'Cập nhật phần thưởng thành công');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await rewardsService.remove(req.params.id as string);
    sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
};

// ─── Redemption ──────────────────────────────────────

export const redeem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await rewardsService.redeem(req.user!.id, req.params.id as string);
    sendSuccess(res, transaction, 'Đổi thưởng thành công', 201);
  } catch (error) {
    next(error);
  }
};

// ─── Transaction queries ─────────────────────────────

export const getMyTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await rewardsService.getMyTransactions(req.user!.id);
    sendSuccess(res, transactions);
  } catch (error) {
    next(error);
  }
};

export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page, limit } = req.query;
    const transactions = await rewardsService.listTransactions({
      status: status as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    sendSuccess(res, transactions);
  } catch (error) {
    next(error);
  }
};

export const fulfillTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await rewardsService.fulfillTransaction(req.params.id as string);
    sendSuccess(res, transaction, 'Đã hoàn tất giao dịch');
  } catch (error) {
    next(error);
  }
};
