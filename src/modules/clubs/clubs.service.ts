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
        _count: { select: { members: true } },
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
}, coverImage?: Buffer) => {
  // Verify leader exists
  const leader = await prisma.user.findUnique({ where: { id: data.leader_id } });
  if (!leader) throw new AppError('Người dùng được chỉ định làm trưởng CLB không tồn tại', 404);

  const club = await prisma.club.create({
    data: {
      name: data.name,
      description: data.description,
      leader_id: data.leader_id,
    },
  });

  // Auto-add leader as a LEADER member
  await prisma.clubMember.create({
    data: {
      club_id: club.id,
      user_id: data.leader_id,
      role: 'LEADER',
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
  }>,
) => {
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) throw new AppError('CLB không tồn tại', 404);

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
          data: { role: 'LEADER' },
        });
      } else {
        await tx.clubMember.create({
          data: { club_id: id, user_id: data.leader_id!, role: 'LEADER' },
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

export const join = async (clubId: string, userId: string) => {
  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) throw new AppError('CLB không tồn tại', 404);

  const existing = await prisma.clubMember.findUnique({
    where: { club_id_user_id: { club_id: clubId, user_id: userId } },
  });
  if (existing) throw new AppError('Bạn đã là thành viên của CLB này', 400);

  return prisma.clubMember.create({
    data: { club_id: clubId, user_id: userId, role: 'MEMBER' },
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
    where: { club_id: clubId },
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

