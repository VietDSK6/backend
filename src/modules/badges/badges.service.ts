import prisma from '../../config/database';
import { AppError } from '../../utils/app-error';
import { checkAndAssignBadges } from '../../services/badge.service';

export const list = async () => {
  return prisma.badge.findMany({
    orderBy: { required_hours: 'asc' },
    include: { activity_type: true },
  });
};

export const create = async (data: {
  name: string;
  description: string;
  icon_url?: string;
  required_hours: number;
  activity_type_id?: string;
}) => {
  return prisma.badge.create({
    data: {
      ...data,
      icon_url: data.icon_url || '',
    },
    include: { activity_type: true },
  });
};

export const update = async (
  id: string,
  data: { name?: string; description?: string; icon_url?: string; required_hours?: number; activity_type_id?: string | null },
) => {
  const badge = await prisma.badge.findUnique({ where: { id } });
  if (!badge) throw new AppError('Huy hiệu không tồn tại', 404);

  return prisma.badge.update({
    where: { id },
    data,
    include: { activity_type: true },
  });
};

export const remove = async (id: string) => {
  const badge = await prisma.badge.findUnique({ where: { id } });
  if (!badge) throw new AppError('Huy hiệu không tồn tại', 404);

  await prisma.badge.delete({ where: { id } });
  return { message: 'Xóa huy hiệu thành công' };
};

/**
 * Manually triggered by admin after creating a new badge.
 * Checks all students and awards any badges they now qualify for.
 */
export const backfillAllUsers = async () => {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true },
  });

  for (const student of students) {
    await checkAndAssignBadges(student.id);
  }

  return { processed: students.length };
};
