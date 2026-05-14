import prisma from '../../config/database';
import { AppError } from '../../utils/app-error';
import { paginate, paginatedResponse } from '../../utils/pagination';
import { uploadImage } from '../../utils/upload';
import { Prisma } from '@prisma/client';

interface ListEventsQuery {
  search?: string;
  category?: string;
  activity_type_id?: string;
  status?: string;
  is_applied?: boolean;
  userId?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export const list = async (query: ListEventsQuery) => {
  const { skip, take } = paginate(query.page, query.limit);

  const where: Prisma.EventWhereInput = {};
  if (query.search) {
    where.title = { contains: query.search, mode: 'insensitive' };
  }
  if (query.category) {
    where.category = query.category;
  }
  if (query.activity_type_id) {
    where.activity_type_id = query.activity_type_id;
  }
  if (query.status) {
    where.status = query.status as any;
  }
  if (query.date_from || query.date_to) {
    if (query.date_from) {
      where.end_date = { gte: new Date(query.date_from) };
    }
    if (query.date_to) {
      const dateTo = new Date(query.date_to);
      dateTo.setUTCHours(23, 59, 59, 999);
      where.start_date = { lte: dateTo };
    }
  }
  if (query.is_applied && query.userId) {
    where.applications = {
      some: { student_id: query.userId },
    };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        admin: { select: { id: true, full_name: true, avatar_url: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return paginatedResponse(events, total, query.page || 1, query.limit || 10);
};

export const getById = async (id: string, userId?: string) => {
  const [event, application] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        admin: { select: { id: true, full_name: true, avatar_url: true } },
        _count: { select: { applications: { where: { status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] } } } } },
      },
    }),
    userId
      ? prisma.application.findFirst({
          where: { event_id: id, student_id: userId },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (!event) throw new AppError('Sự kiện không tồn tại', 404);
  return { ...event, is_applied: application !== null };
};

export const create = async (
  adminId: string,
  data: {
    title: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
    max_slots: number;
    activity_type_id: string;
    fixed_point?: number;
    cover_image?: string;
    cover_url?: string;
  },
  coverImage?: Buffer,
) => {
  let cover_image: string | undefined = data.cover_image || data.cover_url;
  if (coverImage) {
    cover_image = await uploadImage(coverImage, 'events');
  }

  const event = await prisma.event.create({
    data: {
      admin_id: adminId,
      title: data.title,
      description: data.description,
      location: data.location,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      max_slots: data.max_slots,
      activity_type_id: data.activity_type_id,
      fixed_point: data.fixed_point ?? 0,
      cover_image,
    },
  });

  return event;
};

export const update = async (
  id: string,
  adminId: string,
  data: Partial<{
    title: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
    max_slots: number;
    activity_type_id: string;
    cover_image: string;
    cover_url: string;
    fixed_point: number;
  }>,
) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError('Sự kiện không tồn tại', 404);
  if (event.admin_id !== adminId) throw new AppError('Không có quyền chỉnh sửa', 403);

  const updateData: any = { ...data };
  if (data.cover_url && !data.cover_image) {
    updateData.cover_image = data.cover_url;
  }
  delete updateData.cover_url;

  if (data.start_date) updateData.start_date = new Date(data.start_date);
  if (data.end_date) updateData.end_date = new Date(data.end_date);

  return prisma.event.update({ where: { id }, data: updateData });
};

export const remove = async (id: string, adminId: string) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError('Sự kiện không tồn tại', 404);
  if (event.admin_id !== adminId) throw new AppError('Không có quyền xóa', 403);

  const approvedCount = await prisma.application.count({
    where: { event_id: id, status: 'APPROVED' },
  });
  if (approvedCount > 0) {
    throw new AppError('Không thể xóa sự kiện đang có người tham gia', 400);
  }

  await prisma.event.delete({ where: { id } });
};

export const getApplications = async (eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError('Sự kiện không tồn tại', 404);

  return prisma.application.findMany({
    where: { event_id: eventId },
    include: {
      student: { select: { id: true, full_name: true, email: true, avatar_url: true } },
      review: true,
    },
    orderBy: { applied_at: 'desc' },
  });
};
