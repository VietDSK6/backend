import prisma from '../../config/database';
import { AppError } from '../../utils/app-error';

export const listActive = async () => {
  return prisma.activityType.findMany({
    where: { is_active: true },
    orderBy: { created_at: 'desc' },
  });
};

export const listAll = async () => {
  return prisma.activityType.findMany({
    orderBy: { created_at: 'desc' },
  });
};

export const create = async (data: { name: string; is_active?: boolean }) => {
  const exists = await prisma.activityType.findUnique({ where: { name: data.name } });
  if (exists) throw new AppError('Loại hoạt động đã tồn tại', 409);

  return prisma.activityType.create({ data });
};

export const update = async (id: string, data: { name?: string; is_active?: boolean }) => {
  const item = await prisma.activityType.findUnique({ where: { id } });
  if (!item) throw new AppError('Loại hoạt động không tồn tại', 404);

  if (data.name && data.name !== item.name) {
    const dup = await prisma.activityType.findUnique({ where: { name: data.name } });
    if (dup) throw new AppError('Tên loại hoạt động đã tồn tại', 409);
  }

  return prisma.activityType.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  const item = await prisma.activityType.findUnique({ where: { id } });
  if (!item) throw new AppError('Loại hoạt động không tồn tại', 404);

  const eventCount = await prisma.event.count({ where: { activity_type_id: id } });
  if (eventCount > 0) {
    throw new AppError('Không thể xóa loại hoạt động đang được sử dụng', 400);
  }

  await prisma.activityType.delete({ where: { id } });
};
