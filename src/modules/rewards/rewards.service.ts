import prisma from '../../config/database';
import { AppError } from '../../utils/app-error';
import { paginate, paginatedResponse } from '../../utils/pagination';
import crypto from 'crypto';

// ─── Helpers ─────────────────────────────────────────

function generateVoucherCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
}

// ─── Reward CRUD (Admin) ─────────────────────────────

interface ListRewardsQuery {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export const list = async (query: ListRewardsQuery) => {
  const { skip, take } = paginate(query.page, query.limit);

  const where: any = {};
  if (query.is_active !== undefined) {
    where.is_active = query.is_active;
  }
  if (query.search) {
    where.name = { contains: query.search, mode: 'insensitive' };
  }

  const [rewards, total] = await Promise.all([
    prisma.reward.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: { _count: { select: { transactions: true } } },
    }),
    prisma.reward.count({ where }),
  ]);

  return paginatedResponse(rewards, total, query.page || 1, query.limit || 10);
};

export const getById = async (id: string) => {
  const reward = await prisma.reward.findUnique({
    where: { id },
    include: { _count: { select: { transactions: true } } },
  });
  if (!reward) throw new AppError('Phần thưởng không tồn tại', 404);
  return reward;
};

export const create = async (data: {
  name: string;
  description: string;
  point_cost: number;
  stock_quantity: number;
  image_url?: string;
}) => {
  return prisma.reward.create({ data });
};

export const update = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    point_cost: number;
    stock_quantity: number;
    image_url: string;
    is_active: boolean;
  }>,
) => {
  const reward = await prisma.reward.findUnique({ where: { id } });
  if (!reward) throw new AppError('Phần thưởng không tồn tại', 404);

  return prisma.reward.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  const reward = await prisma.reward.findUnique({ where: { id } });
  if (!reward) throw new AppError('Phần thưởng không tồn tại', 404);

  await prisma.reward.update({ where: { id }, data: { is_active: false } });
  return { message: 'Đã ẩn phần thưởng' };
};

// ─── Redemption ──────────────────────────────────────

export const redeem = async (userId: string, rewardId: string) => {
  const [user, reward] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, current_points: true } }),
    prisma.reward.findUnique({ where: { id: rewardId } }),
  ]);

  if (!user) throw new AppError('Người dùng không tồn tại', 404);
  if (!reward) throw new AppError('Phần thưởng không tồn tại', 404);
  if (!reward.is_active) throw new AppError('Phần thưởng đã ngừng hoạt động', 400);
  if (user.current_points < reward.point_cost) {
    throw new AppError('Không đủ điểm để đổi phần thưởng này', 400);
  }
  if (reward.stock_quantity <= 0) {
    throw new AppError('Phần thưởng đã hết hàng', 400);
  }

  // Check if already redeemed
  const existing = await prisma.rewardTransaction.findUnique({
    where: { user_id_reward_id: { user_id: userId, reward_id: rewardId } },
  });
  if (existing) throw new AppError('Bạn đã đổi phần thưởng này rồi', 409);

  const voucherCode = generateVoucherCode();

  // Atomic transaction
  const transaction = await prisma.$transaction(async (tx) => {
    // Deduct points
    await tx.user.update({
      where: { id: userId },
      data: { current_points: { decrement: reward.point_cost } },
    });

    // Deduct stock
    await tx.reward.update({
      where: { id: rewardId },
      data: { stock_quantity: { decrement: 1 } },
    });

    // Create transaction record
    return tx.rewardTransaction.create({
      data: {
        user_id: userId,
        reward_id: rewardId,
        points_spent: reward.point_cost,
        voucher_code: voucherCode,
      },
      include: { reward: true },
    });
  });

  // Notification for user
  await prisma.notification.create({
    data: {
      user_id: userId,
      title: 'Đổi thưởng thành công',
      message: `Bạn đã đổi "${reward.name}". Mã voucher: ${voucherCode}`,
      type: 'REWARD_REDEEMED',
    },
  });

  return transaction;
};

// ─── Transaction queries ─────────────────────────────

export const getMyTransactions = async (userId: string) => {
  return prisma.rewardTransaction.findMany({
    where: { user_id: userId },
    include: { reward: { select: { id: true, name: true, image_url: true, point_cost: true } } },
    orderBy: { created_at: 'desc' },
  });
};

interface ListTransactionsQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export const listTransactions = async (query: ListTransactionsQuery) => {
  const { skip, take } = paginate(query.page, query.limit);

  const where: any = {};
  if (query.status) {
    where.status = query.status;
  }

  const [transactions, total] = await Promise.all([
    prisma.rewardTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { id: true, full_name: true, email: true, avatar_url: true } },
        reward: { select: { id: true, name: true, point_cost: true } },
      },
    }),
    prisma.rewardTransaction.count({ where }),
  ]);

  return paginatedResponse(transactions, total, query.page || 1, query.limit || 10);
};

export const fulfillTransaction = async (transactionId: string) => {
  const transaction = await prisma.rewardTransaction.findUnique({
    where: { id: transactionId },
    include: { reward: true },
  });
  if (!transaction) throw new AppError('Giao dịch không tồn tại', 404);
  if (transaction.status !== 'PENDING') {
    throw new AppError('Chỉ có thể hoàn tất giao dịch đang chờ', 400);
  }

  const updated = await prisma.rewardTransaction.update({
    where: { id: transactionId },
    data: { status: 'FULFILLED' },
    include: { reward: true },
  });

  // Notify user
  await prisma.notification.create({
    data: {
      user_id: transaction.user_id,
      title: 'Quà đã sẵn sàng',
      message: `Phần thưởng "${transaction.reward.name}" của bạn đã được chuẩn bị xong!`,
      type: 'REWARD_FULFILLED',
    },
  });

  return updated;
};
