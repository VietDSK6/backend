import prisma from '../../config/database';
import { AppError } from '../../utils/app-error';
import { paginate, paginatedResponse } from '../../utils/pagination';
import { Prisma } from '@prisma/client';

interface ListClubsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export const list = async (query: ListClubsQuery) => {
  const { skip, take } = paginate(query.page, query.limit);

  const where: Prisma.ClubWhereInput = {};
  if (query.search) {
    where.name = { contains: query.search, mode: 'insensitive' };
  }

  const [clubs, total] = await Promise.all([
    prisma.club.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        leader: { select: { id: true, full_name: true, avatar_url: true } },
        _count: { 
          select: { 
            members: { where: { status: 'APPROVED' } } 
          } 
        },
      },
    }),
    prisma.club.count({ where }),
  ]);

  return paginatedResponse(clubs, total, query.page || 1, query.limit || 10);
};

export const getById = async (id: string) => {
  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      leader: { select: { id: true, full_name: true, avatar_url: true, email: true } },
      members: {
        where: { status: 'APPROVED' },
        include: {
          user: { select: { id: true, full_name: true, avatar_url: true, email: true } },
        },
        orderBy: { joined_at: 'asc' },
      },
    },
  });

  if (!club) throw new AppError('CLB không tồn tại', 404);
  return club;
};

export const create = async (data: {
  name: string;
  description?: string;
  leader_id: string;
  is_reason_required?: boolean;
  is_promise_required?: boolean;
}, coverImage?: Buffer) => {
  // Verify leader exists
  const leader = await prisma.user.findUnique({ where: { id: data.leader_id } });
  if (!leader) throw new AppError('Người dùng được chỉ định làm trưởng CLB không tồn tại', 404);

  const club = await prisma.club.create({
    data: {
      name: data.name,
      description: data.description,
      leader_id: data.leader_id,
      is_reason_required: data.is_reason_required ?? false,
      is_promise_required: data.is_promise_required ?? false,
    },
  });

  // Auto-add leader as a LEADER member
  await prisma.clubMember.create({
    data: {
      club_id: club.id,
      user_id: data.leader_id,
      role: 'LEADER',
      status: 'APPROVED',
    },
  });

  return club;
};

export const update = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    leader_id: string;
    is_reason_required: boolean;
    is_promise_required: boolean;
  }>,
  userId: string,
  userRole: string
) => {
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) throw new AppError('CLB không tồn tại', 404);

  if (userRole !== 'ADMIN' && club.leader_id !== userId) {
    throw new AppError('Bạn không có quyền chỉnh sửa CLB này', 403);
  }

  // If changing leader
  if (data.leader_id && data.leader_id !== club.leader_id) {
    const newLeader = await prisma.user.findUnique({ where: { id: data.leader_id } });
    if (!newLeader) throw new AppError('Người dùng được chỉ định làm trưởng CLB không tồn tại', 404);

    await prisma.$transaction(async (tx) => {
      // Demote old leader to MEMBER
      await tx.clubMember.updateMany({
        where: { club_id: id, user_id: club.leader_id },
        data: { role: 'MEMBER' },
      });

      // Upsert new leader as LEADER member
      const existing = await tx.clubMember.findUnique({
        where: { club_id_user_id: { club_id: id, user_id: data.leader_id! } },
      });

      if (existing) {
        await tx.clubMember.update({
          where: { id: existing.id },
          data: { role: 'LEADER', status: 'APPROVED' },
        });
      } else {
        await tx.clubMember.create({
          data: { club_id: id, user_id: data.leader_id!, role: 'LEADER', status: 'APPROVED' },
        });
      }

      await tx.club.update({ where: { id }, data });
    });

    return prisma.club.findUnique({
      where: { id },
      include: {
        leader: { select: { id: true, full_name: true, avatar_url: true } },
      },
    });
  }

  return prisma.club.update({
    where: { id },
    data,
    include: {
      leader: { select: { id: true, full_name: true, avatar_url: true } },
    },
  });
};

export const remove = async (id: string) => {
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) throw new AppError('CLB không tồn tại', 404);

  await prisma.club.delete({ where: { id } });
};

export const join = async (clubId: string, userId: string, data: { reason?: string; promise?: string }) => {
  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) throw new AppError('CLB không tồn tại', 404);

  if (club.is_reason_required && !data.reason?.trim()) {
    throw new AppError('Vui lòng nhập lí do tham gia CLB', 400);
  }
  if (club.is_promise_required && !data.promise?.trim()) {
    throw new AppError('Vui lòng nhập lời hứa khi tham gia CLB', 400);
  }

  const existing = await prisma.clubMember.findUnique({
    where: { club_id_user_id: { club_id: clubId, user_id: userId } },
  });
  
  if (existing) {
    if (existing.status === 'APPROVED') {
      throw new AppError('Bạn đã là thành viên của CLB này', 400);
    }
    if (existing.status === 'PENDING') {
      throw new AppError('Đơn đăng ký của bạn đang chờ duyệt', 400);
    }
    // If REJECTED, update to PENDING
    return prisma.clubMember.update({
      where: { id: existing.id },
      data: { status: 'PENDING', reason: data.reason, promise: data.promise },
    });
  }

  return prisma.clubMember.create({
    data: { 
      club_id: clubId, 
      user_id: userId, 
      role: 'MEMBER',
      status: 'PENDING',
      reason: data.reason,
      promise: data.promise
    },
  });
};

export const leave = async (clubId: string, userId: string) => {
  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) throw new AppError('CLB không tồn tại', 404);

  if (club.leader_id === userId) {
    throw new AppError('Trưởng CLB không thể rời CLB. Hãy chuyển quyền trưởng CLB trước', 400);
  }

  const member = await prisma.clubMember.findUnique({
    where: { club_id_user_id: { club_id: clubId, user_id: userId } },
  });
  if (!member) throw new AppError('Bạn không phải thành viên của CLB này', 400);

  await prisma.clubMember.delete({ where: { id: member.id } });
};

export const getMembers = async (clubId: string) => {
  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) throw new AppError('CLB không tồn tại', 404);

  return prisma.clubMember.findMany({
    where: { club_id: clubId, status: 'APPROVED' },
    include: {
      user: { select: { id: true, full_name: true, avatar_url: true, email: true } },
    },
    orderBy: [{ role: 'asc' }, { joined_at: 'asc' }],
  });
};

export const kickMember = async (clubId: string, leaderId: string, targetUserId: string) => {
  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) throw new AppError('CLB không tồn tại', 404);

  // Only the leader can kick
  if (club.leader_id !== leaderId) {
    throw new AppError('Chỉ trưởng CLB mới có thể kick thành viên', 403);
  }

  // Cannot kick yourself
  if (leaderId === targetUserId) {
    throw new AppError('Bạn không thể tự kick chính mình. Hãy dùng chức năng rời CLB', 400);
  }

  const member = await prisma.clubMember.findUnique({
    where: { club_id_user_id: { club_id: clubId, user_id: targetUserId } },
  });
  if (!member) throw new AppError('Người dùng này không phải thành viên của CLB', 404);

  await prisma.clubMember.delete({ where: { id: member.id } });
};

export const getPendingApplications = async (clubId: string, leaderId: string) => {
  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) throw new AppError('CLB không tồn tại', 404);

  if (club.leader_id !== leaderId) {
    throw new AppError('Chỉ trưởng CLB mới có thể xem danh sách đơn đăng ký', 403);
  }

  return prisma.clubMember.findMany({
    where: { club_id: clubId, status: 'PENDING' },
    include: {
      user: { select: { id: true, full_name: true, avatar_url: true, email: true } },
    },
    orderBy: { joined_at: 'asc' },
  });
};

export const approveApplication = async (clubId: string, leaderId: string, targetUserId: string) => {
  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) throw new AppError('CLB không tồn tại', 404);

  if (club.leader_id !== leaderId) {
    throw new AppError('Chỉ trưởng CLB mới có thể duyệt đơn', 403);
  }

  const member = await prisma.clubMember.findUnique({
    where: { club_id_user_id: { club_id: clubId, user_id: targetUserId } },
  });

  if (!member || member.status !== 'PENDING') {
    throw new AppError('Đơn đăng ký không tồn tại hoặc đã được xử lý', 404);
  }

  return prisma.clubMember.update({
    where: { id: member.id },
    data: { status: 'APPROVED' },
  });
};

export const rejectApplication = async (clubId: string, leaderId: string, targetUserId: string) => {
  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) throw new AppError('CLB không tồn tại', 404);

  if (club.leader_id !== leaderId) {
    throw new AppError('Chỉ trưởng CLB mới có thể từ chối đơn', 403);
  }

  const member = await prisma.clubMember.findUnique({
    where: { club_id_user_id: { club_id: clubId, user_id: targetUserId } },
  });

  if (!member || member.status !== 'PENDING') {
    throw new AppError('Đơn đăng ký không tồn tại hoặc đã được xử lý', 404);
  }

  return prisma.clubMember.update({
    where: { id: member.id },
    data: { status: 'REJECTED' },
  });
};

