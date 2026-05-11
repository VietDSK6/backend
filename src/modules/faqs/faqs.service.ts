import prisma from '../../config/database';
import { AppError } from '../../utils/app-error';

export const listActive = async () => {
  return prisma.fAQ.findMany({
    where: { is_active: true },
    orderBy: { created_at: 'desc' },
  });
};

export const listAll = async () => {
  return prisma.fAQ.findMany({
    orderBy: { created_at: 'desc' },
  });
};

export const create = async (data: { question: string; answer: string; is_active?: boolean }) => {
  return prisma.fAQ.create({
    data,
  });
};

export const update = async (id: string, data: { question?: string; answer?: string; is_active?: boolean }) => {
  const faq = await prisma.fAQ.findUnique({ where: { id } });
  if (!faq) throw new AppError('FAQ không tồn tại', 404);

  return prisma.fAQ.update({
    where: { id },
    data,
  });
};

export const remove = async (id: string) => {
  const faq = await prisma.fAQ.findUnique({ where: { id } });
  if (!faq) throw new AppError('FAQ không tồn tại', 404);

  await prisma.fAQ.delete({ where: { id } });
  return { message: 'Xóa FAQ thành công' };
};
