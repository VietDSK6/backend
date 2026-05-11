import prisma from '../../config/database';
import { AppError } from '../../utils/app-error';

export const list = async (userId: string) => {
  return prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });
};

export const listBatches = async () => {
  return prisma.notificationBatch.findMany({
    orderBy: { sent_at: 'desc' },
    include: {
      _count: { select: { notifications: true } },
    },
  });
};

export const getBatchDetail = async (batchId: string) => {
  const batch = await prisma.notificationBatch.findUnique({
    where: { id: batchId },
    include: {
      notifications: {
        include: {
          user: { select: { id: true, full_name: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
      },
    },
  });
  if (!batch) throw new AppError('Không tìm thấy batch thông báo', 404);
  return batch;
};

export const markRead = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification) throw new AppError('Thông báo không tồn tại', 404);
  if (notification.user_id !== userId) throw new AppError('Không có quyền', 403);

  return prisma.notification.update({
    where: { id: notificationId },
    data: { is_read: true },
  });
};

export const markAllRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true },
  });
};

export const sendNotification = async (data: {
  target: 'ALL' | 'SPECIFIC';
  userIds?: string[];
  user_ids?: string[];
  title: string;
  message: string;
  type?: string;
}) => {
  const { target, title, message, type = 'SYSTEM' } = data;
  const userIds = data.userIds ?? data.user_ids;

  let targetUserIds: string[] = [];

  if (target === 'ALL') {
    const users = await prisma.user.findMany({ select: { id: true } });
    targetUserIds = users.map((u) => u.id);
  } else if (target === 'SPECIFIC' && userIds && userIds.length > 0) {
    targetUserIds = userIds;
  } else {
    throw new AppError('Phải cung cấp danh sách người dùng khi chọn SPECIFIC', 400);
  }

  if (targetUserIds.length === 0) return { count: 0 };

  // Create a batch record first, then link all notifications to it
  const batch = await prisma.notificationBatch.create({
    data: {
      title,
      message,
      type,
      target,
      notifications: {
        create: targetUserIds.map((id) => ({
          user_id: id,
          title,
          message,
          type,
        })),
      },
    },
    include: { _count: { select: { notifications: true } } },
  });

  return { batchId: batch.id, count: batch._count.notifications };
};
