import prisma from '../config/database';

export const checkAndAssignBadges = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { total_hours: true },
  });
  if (!user) return;

  const allBadges = await prisma.badge.findMany({
    orderBy: { required_hours: 'asc' },
  });

  const earnedBadgeIds = await prisma.userBadge.findMany({
    where: { user_id: userId },
    select: { badge_id: true },
  });
  const earnedSet = new Set(earnedBadgeIds.map((ub) => ub.badge_id));

  // Cache category hours to avoid repeated queries
  const categoryHoursCache = new Map<string, number>();

  for (const badge of allBadges) {
    if (earnedSet.has(badge.id)) continue;

    let qualifies = false;

    if (!badge.activity_type_id) {
      // General badge: check total hours
      qualifies = user.total_hours >= badge.required_hours;
    } else {
      // Category badge: calculate hours from completed applications of this activity type
      let hours = categoryHoursCache.get(badge.activity_type_id);
      if (hours === undefined) {
        hours = await getCategoryHours(userId, badge.activity_type_id);
        categoryHoursCache.set(badge.activity_type_id, hours);
      }
      qualifies = hours >= badge.required_hours;
    }

    if (qualifies) {
      await prisma.userBadge.create({
        data: { user_id: userId, badge_id: badge.id },
      });
      console.log(`🏅 Badge "${badge.name}" assigned to user ${userId}`);
    }
  }
};

/**
 * Sum hours from COMPLETED applications where the event belongs to a specific activity type.
 */
async function getCategoryHours(userId: string, activityTypeId: string): Promise<number> {
  const completedApps = await prisma.application.findMany({
    where: {
      student_id: userId,
      status: 'COMPLETED',
      event: { activity_type_id: activityTypeId },
    },
    include: {
      event: { select: { start_date: true, end_date: true } },
    },
  });

  return completedApps.reduce((sum, app) => {
    const hours = (app.event.end_date.getTime() - app.event.start_date.getTime()) / 3_600_000;
    return sum + hours;
  }, 0);
}
