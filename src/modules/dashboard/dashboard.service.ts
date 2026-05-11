import prisma from '../../config/database';

export const getStats = async (adminId: string) => {
  const [totalEvents, pendingApplications, totalStudents, hoursResult, pointsResult, rewardsRedeemed] = await Promise.all([
    prisma.event.count({ where: { admin_id: adminId } }),
    prisma.application.count({
      where: { status: 'PENDING', event: { admin_id: adminId } },
    }),
    prisma.application.findMany({
      where: { status: { in: ['APPROVED', 'COMPLETED'] }, event: { admin_id: adminId } },
      distinct: ['student_id'],
      select: { student_id: true },
    }),
    prisma.application.findMany({
      where: { status: 'COMPLETED', event: { admin_id: adminId } },
      include: { event: { select: { start_date: true, end_date: true } } },
    }),
    // Total points distributed from admin's completed events
    prisma.application.findMany({
      where: { status: 'COMPLETED', event: { admin_id: adminId } },
      include: { event: { select: { fixed_point: true } } },
    }),
    // Total reward redemptions system-wide
    prisma.rewardTransaction.count(),
  ]);

  const totalHours = hoursResult.reduce((sum, app) => {
    return sum + (app.event.end_date.getTime() - app.event.start_date.getTime()) / 3_600_000;
  }, 0);

  const totalPointsDistributed = pointsResult.reduce((sum, app) => sum + app.event.fixed_point, 0);

  return {
    total_events: totalEvents,
    pending_applications: pendingApplications,
    total_students: totalStudents.length,
    total_hours: Math.round(totalHours * 10) / 10,
    total_points_distributed: totalPointsDistributed,
    total_rewards_redeemed: rewardsRedeemed,
  };
};

export const getHoursByMonth = async (adminId: string) => {
  const year = new Date().getFullYear();
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

  const completedApps = await prisma.application.findMany({
    where: {
      status: 'COMPLETED',
      event: { admin_id: adminId },
    },
    include: {
      event: { select: { start_date: true, end_date: true } },
    },
  });

  const hoursByMonth = new Array(12).fill(0);

  for (const app of completedApps) {
    const completedMonth = app.updated_at.getFullYear() === year ? app.updated_at.getMonth() : -1;
    if (completedMonth >= 0) {
      const hours = (app.event.end_date.getTime() - app.event.start_date.getTime()) / 3_600_000;
      hoursByMonth[completedMonth] += hours;
    }
  }

  return months.map((month, i) => ({
    month,
    hours: Math.round(hoursByMonth[i] * 10) / 10,
  }));
};

export const getApplicationStatus = async (adminId: string) => {
  const [pending, approved, rejected, completed] = await Promise.all([
    prisma.application.count({ where: { status: 'PENDING', event: { admin_id: adminId } } }),
    prisma.application.count({ where: { status: 'APPROVED', event: { admin_id: adminId } } }),
    prisma.application.count({ where: { status: 'REJECTED', event: { admin_id: adminId } } }),
    prisma.application.count({ where: { status: 'COMPLETED', event: { admin_id: adminId } } }),
  ]);

  return [
    { status: 'Chờ duyệt', value: pending, color: '#faad14' },
    { status: 'Đã duyệt', value: approved, color: '#52c41a' },
    { status: 'Từ chối', value: rejected, color: '#ff4d4f' },
    { status: 'Hoàn thành', value: completed, color: '#1677ff' },
  ];
};

export const getPointsAnalytics = async (adminId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [allCompleted, thisMonthCompleted, allRedemptions, thisMonthRedemptions, activeStudents] = await Promise.all([
    // All-time points distributed from admin's events
    prisma.application.findMany({
      where: { status: 'COMPLETED', event: { admin_id: adminId } },
      include: { event: { select: { fixed_point: true } } },
    }),
    // This month's points distributed
    prisma.application.findMany({
      where: {
        status: 'COMPLETED',
        event: { admin_id: adminId },
        updated_at: { gte: startOfMonth, lt: endOfMonth },
      },
      include: { event: { select: { fixed_point: true } } },
    }),
    // All-time redemptions (system-wide)
    prisma.rewardTransaction.aggregate({
      _sum: { points_spent: true },
      _count: true,
    }),
    // This month's redemptions
    prisma.rewardTransaction.aggregate({
      where: { created_at: { gte: startOfMonth, lt: endOfMonth } },
      _sum: { points_spent: true },
      _count: true,
    }),
    // Distinct students with completed applications under this admin
    prisma.application.findMany({
      where: { status: 'COMPLETED', event: { admin_id: adminId } },
      distinct: ['student_id'],
      select: { student_id: true },
    }),
  ]);

  const totalPointsDistributed = allCompleted.reduce((sum, app) => sum + app.event.fixed_point, 0);
  const pointsDistributedThisMonth = thisMonthCompleted.reduce((sum, app) => sum + app.event.fixed_point, 0);
  const avgPointsPerStudent = activeStudents.length > 0
    ? Math.round(totalPointsDistributed / activeStudents.length)
    : 0;

  return {
    total_points_distributed: totalPointsDistributed,
    points_distributed_this_month: pointsDistributedThisMonth,
    total_points_redeemed: allRedemptions._sum.points_spent || 0,
    total_redemption_count: allRedemptions._count,
    points_redeemed_this_month: thisMonthRedemptions._sum.points_spent || 0,
    redemptions_this_month: thisMonthRedemptions._count,
    avg_points_per_student: avgPointsPerStudent,
    active_students: activeStudents.length,
  };
};

export const getPointsByMonth = async (adminId: string) => {
  const year = new Date().getFullYear();
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

  const [completedApps, rewardTxs] = await Promise.all([
    // Points earned from admin's events this year
    prisma.application.findMany({
      where: {
        status: 'COMPLETED',
        event: { admin_id: adminId },
        updated_at: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      include: { event: { select: { fixed_point: true } } },
    }),
    // Points spent (system-wide) this year
    prisma.rewardTransaction.findMany({
      where: {
        created_at: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      select: { points_spent: true, created_at: true },
    }),
  ]);

  const earnedByMonth = new Array(12).fill(0);
  const spentByMonth = new Array(12).fill(0);

  for (const app of completedApps) {
    const m = app.updated_at.getMonth();
    earnedByMonth[m] += app.event.fixed_point;
  }

  for (const tx of rewardTxs) {
    const m = tx.created_at.getMonth();
    spentByMonth[m] += tx.points_spent;
  }

  return months.map((month, i) => ({
    month,
    points_earned: earnedByMonth[i],
    points_spent: spentByMonth[i],
  }));
};
