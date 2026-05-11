import prisma from '../../config/database';
import { Prisma } from '@prisma/client';
import { AppError } from '../../utils/app-error';

const publicUserSelect = {
  id: true,
  email: true,
  full_name: true,
  avatar_url: true,
  role: true,
  reputation_score: true,
  total_hours: true,
  total_points: true,
  current_points: true,
  created_at: true,
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });
  if (!user) throw new AppError('Người dùng không tồn tại', 404);

  const clubMemberships = await prisma.clubMember.findMany({
    where: { user_id: userId },
    include: {
      club: {
        include: {
          leader: { select: { id: true, full_name: true, avatar_url: true } },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joined_at: 'asc' },
  });

  const clubs = clubMemberships.map((m) => ({
    ...m.club,
    is_leader: m.role === 'LEADER',
  }));

  return { ...user, clubs };
};

export const updateMe = async (userId: string, data: { full_name?: string; avatar_url?: string }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: publicUserSelect,
  });
  return user;
};

export const getById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });
  if (!user) throw new AppError('Người dùng không tồn tại', 404);
  return user;
};

export const getUserBadges = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Người dùng không tồn tại', 404);

  const userBadges = await prisma.userBadge.findMany({
    where: { user_id: userId },
    include: { badge: true },
    orderBy: { earned_at: 'desc' },
  });

  return userBadges.map((ub) => ({
    ...ub.badge,
    earned_at: ub.earned_at,
  }));
};

const VALID_SORT_FIELDS = ['total_points', 'current_points', 'total_hours', 'reputation_score', 'created_at'] as const;
type SortField = typeof VALID_SORT_FIELDS[number];

export const listUsers = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  role?: 'STUDENT' | 'ADMIN',
  sortBy: SortField = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc',
) => {
  const skip = (page - 1) * limit;

  const safeSort: SortField = VALID_SORT_FIELDS.includes(sortBy as SortField) ? sortBy : 'created_at';

  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { full_name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      skip,
      take: limit,
      orderBy: { [safeSort]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  const userIds = users.map((u) => u.id);

  const memberships = userIds.length > 0
    ? await prisma.clubMember.findMany({
        where: { user_id: { in: userIds } },
        include: {
          club: {
            select: { id: true, name: true, cover_image: true },
          },
        },
      })
    : [];

  const clubsByUserId = memberships.reduce<Record<string, { id: string; name: string; cover_image: string | null; is_leader: boolean }[]>>(
    (acc, m) => {
      if (!acc[m.user_id]) acc[m.user_id] = [];
      acc[m.user_id].push({ ...m.club, is_leader: m.role === 'LEADER' });
      return acc;
    },
    {},
  );

  return {
    data: users.map((u) => ({ ...u, clubs: clubsByUserId[u.id] ?? [] })),
    meta: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const updateUserRole = async (userId: string, role: 'ADMIN' | 'STUDENT') => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Người dùng không tồn tại', 404);

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: publicUserSelect,
  });
};

export const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Người dùng không tồn tại', 404);

  // Prisma cascade will handle related records if configured, otherwise we may need to manually delete
  // Looking at schema, RefreshToken has Cascade delete. Reviews, Applications, Events might restrict deletion.
  // We'll delete the user and let Prisma throw an error if restricted, or we can use a transaction.
  // Assuming basic delete is sufficient.
  await prisma.user.delete({ where: { id: userId } });
  return { message: 'Xóa người dùng thành công' };
};

export const getMyPointsSummary = async (userId: string, month?: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { current_points: true, total_points: true },
  });
  if (!user) throw new AppError('Người dùng không tồn tại', 404);

  // Default to current month (YYYY-MM)
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  const [year, mon] = targetMonth.split('-').map(Number);
  const startOfMonth = new Date(year, mon - 1, 1);
  const endOfMonth = new Date(year, mon, 1);

  // Points earned: sum fixed_point from completed applications in the month
  const completedApps = await prisma.application.findMany({
    where: {
      student_id: userId,
      status: 'COMPLETED',
      updated_at: { gte: startOfMonth, lt: endOfMonth },
    },
    include: { event: { select: { fixed_point: true } } },
  });

  const pointsEarned = completedApps.reduce((sum, app) => sum + app.event.fixed_point, 0);
  const eventsCompleted = completedApps.length;

  // Points spent: sum points_spent from reward transactions in the month
  const rewardTxs = await prisma.rewardTransaction.findMany({
    where: {
      user_id: userId,
      created_at: { gte: startOfMonth, lt: endOfMonth },
    },
    select: { points_spent: true },
  });

  const pointsSpent = rewardTxs.reduce((sum, tx) => sum + tx.points_spent, 0);
  const rewardsRedeemed = rewardTxs.length;

  return {
    current_points: user.current_points,
    total_points: user.total_points,
    month: targetMonth,
    points_earned: pointsEarned,
    points_spent: pointsSpent,
    events_completed: eventsCompleted,
    rewards_redeemed: rewardsRedeemed,
  };
};

export const getLeaderboard = async (month?: string, search?: string, sortBy: 'hours' | 'events' = 'hours') => {
  const orderByClause = sortBy === 'events'
    ? Prisma.sql`ORDER BY event_count DESC, calculated_hours DESC`
    : Prisma.sql`ORDER BY calculated_hours DESC, event_count DESC`;

  const leaderboardRaw: any[] = await prisma.$queryRaw`
    SELECT 
      u.id,
      u.full_name,
      u.avatar_url,
      u.reputation_score,
      u.total_hours AS all_time_hours,
      COUNT(a.id)::int AS event_count,
      COALESCE(SUM(
        EXTRACT(EPOCH FROM (e.end_date - e.start_date))/3600
      ), 0)::float AS calculated_hours
    FROM "User" u
    LEFT JOIN "Application" a ON a.student_id = u.id AND a.status = 'COMPLETED'
    LEFT JOIN "Event" e ON e.id = a.event_id ${
      month ? Prisma.sql`AND TO_CHAR(e.start_date, 'YYYY-MM') = ${month}` : Prisma.empty
    }
    WHERE u.role = 'STUDENT'
      ${search ? Prisma.sql`AND u.full_name ILIKE ${'%' + search + '%'}` : Prisma.empty}
    GROUP BY u.id
    ${orderByClause}
    LIMIT 100
  `;

  const userIds = leaderboardRaw.map((u) => u.id);
  
  let badgesByUserId: Record<string, any[]> = {};
  if (userIds.length > 0) {
    const userBadges = await prisma.userBadge.findMany({
      where: { user_id: { in: userIds } },
      include: { badge: true }
    });

    badgesByUserId = userBadges.reduce((acc, ub) => {
      if (!acc[ub.user_id]) acc[ub.user_id] = [];
      acc[ub.user_id].push({
        id: ub.badge.id,
        name: ub.badge.name,
        icon_url: ub.badge.icon_url,
        earned_at: ub.earned_at
      });
      return acc;
    }, {} as Record<string, any[]>);
  }

  return leaderboardRaw.map((user) => ({
    id: user.id,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    total_hours: user.calculated_hours,
    event_count: user.event_count,
    reputation_score: user.reputation_score,
    user_badges: badgesByUserId[user.id] || []
  }));
};

export const getDashboardSummary = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { current_points: true, total_points: true, total_hours: true },
  });
  if (!user) throw new AppError('Người dùng không tồn tại', 404);

  const [total_events_joined, events_completed, badges_count, rankAbove] = await Promise.all([
    prisma.application.count({
      where: { student_id: userId, status: { in: ['APPROVED', 'COMPLETED'] } },
    }),
    prisma.application.count({
      where: { student_id: userId, status: 'COMPLETED' },
    }),
    prisma.userBadge.count({
      where: { user_id: userId },
    }),
    prisma.user.count({
      where: { role: 'STUDENT', total_hours: { gt: user.total_hours } },
    })
  ]);

  const rank = rankAbove + 1;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [allCompletedApps, allRewardTxs] = await Promise.all([
    prisma.application.findMany({
      where: {
        student_id: userId,
        status: 'COMPLETED',
        updated_at: { gte: sixMonthsAgo },
      },
      include: { event: { select: { fixed_point: true } } },
    }),
    prisma.rewardTransaction.findMany({
      where: {
        user_id: userId,
        created_at: { gte: sixMonthsAgo },
      },
      select: { points_spent: true, created_at: true },
    }),
  ]);

  const points_by_month = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toISOString().slice(0, 7);
    
    const appsInMonth = allCompletedApps.filter(app => app.updated_at.toISOString().startsWith(monthStr));
    const txsInMonth = allRewardTxs.filter(tx => tx.created_at.toISOString().startsWith(monthStr));

    const points_earned = appsInMonth.reduce((sum, app) => sum + (app.event?.fixed_point || 0), 0);
    const points_spent = txsInMonth.reduce((sum, tx) => sum + tx.points_spent, 0);

    points_by_month.push({
      month: monthStr,
      points_earned,
      points_spent
    });
  }

  const upcoming_events = await prisma.event.findMany({
    where: { status: 'UPCOMING' },
    orderBy: { start_date: 'asc' },
    take: 6,
    include: {
      activity_type: true,
      _count: { select: { applications: true } },
    },
  });

  const recent_applications = await prisma.application.findMany({
    where: { student_id: userId },
    orderBy: { applied_at: 'desc' },
    take: 5,
    include: {
      event: { select: { id: true, title: true, start_date: true } },
    },
  });

  return {
    stats: {
      total_hours: user.total_hours,
      total_events_joined,
      events_completed,
      current_points: user.current_points,
      total_points: user.total_points,
      badges_count,
      rank
    },
    points_by_month,
    upcoming_events,
    recent_applications
  };
};
