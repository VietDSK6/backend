import prisma from '../../config/database';
import { AppError } from '../../utils/app-error';
import { checkAndAssignBadges } from '../../services/badge.service';
import { sendApprovalEmail, sendRejectionEmail } from '../../services/email.service';

export const apply = async (studentId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { managers: { select: { id: true } }, admin: { select: { id: true } } },
  });
  if (!event) throw new AppError('Sự kiện không tồn tại', 404);

  // Check duplicate
  const existing = await prisma.application.findUnique({
    where: { event_id_student_id: { event_id: eventId, student_id: studentId } },
  });
  if (existing && existing.status !== 'CANCELLED') {
    throw new AppError('Bạn đã đăng ký sự kiện này rồi', 409);
  }

  // Check slots
  const takenSlots = await prisma.application.count({
    where: { event_id: eventId, status: { in: ['PENDING', 'APPROVED'] } },
  });
  if (takenSlots >= event.max_slots) {
    throw new AppError('Sự kiện đã hết chỗ', 400);
  }

  const application = existing
    ? await prisma.application.update({
        where: { id: existing.id },
        data: { status: 'PENDING', applied_at: new Date() },
      })
    : await prisma.application.create({
        data: { event_id: eventId, student_id: studentId },
      });

  const recipientIds = Array.from(new Set([event.admin.id, ...event.managers.map((manager) => manager.id)]));
  if (recipientIds.length > 0) {
    await prisma.notification.createMany({
      data: recipientIds.map((userId) => ({
        user_id: userId,
        title: 'Có đơn đăng ký mới',
        message: `Có sinh viên vừa đăng ký sự kiện "${event.title}".`,
        type: 'APPLICATION_CREATED',
        link: `/events/${event.id}/applications`,
      })),
    });
  }

  return application;
};

export const getMyApplications = async (studentId: string) => {
  return prisma.application.findMany({
    where: { student_id: studentId },
    include: {
      event: {
        select: { id: true, title: true, start_date: true, end_date: true, status: true, cover_image: true },
      },
    },
    orderBy: { applied_at: 'desc' },
  });
};

export const approve = async (applicationId: string, userId: string, userRole: string) => {
  const app = await getApplicationWithEvent(applicationId, userId, userRole);
  if (app.status !== 'PENDING') {
    throw new AppError('Chỉ có thể duyệt đơn đang chờ', 400);
  }

  const studentSelect = { id: true, email: true, full_name: true, avatar_url: true };

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'APPROVED' },
    include: { student: { select: studentSelect }, event: true },
  });

  // Notification
  await prisma.notification.create({
    data: {
      user_id: updated.student_id,
      title: 'Đơn được duyệt',
      message: `Đơn đăng ký sự kiện "${updated.event.title}" đã được duyệt!`,
      type: 'APPLICATION_APPROVED',
      link: `/events/${updated.event_id}`,
    },
  });

  // Email (logs to console for now)
  sendApprovalEmail(updated.student.email, updated.event.title);

  return updated;
};

export const reject = async (applicationId: string, userId: string, userRole: string) => {
  const app = await getApplicationWithEvent(applicationId, userId, userRole);
  if (app.status !== 'PENDING') {
    throw new AppError('Chỉ có thể từ chối đơn đang chờ', 400);
  }

  const studentSelect = { id: true, email: true, full_name: true, avatar_url: true };

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'REJECTED' },
    include: { student: { select: studentSelect }, event: true },
  });

  await prisma.notification.create({
    data: {
      user_id: updated.student_id,
      title: 'Đơn bị từ chối',
      message: `Đơn đăng ký sự kiện "${updated.event.title}" đã bị từ chối.`,
      type: 'APPLICATION_REJECTED',
      link: `/my-applications`,
    },
  });

  sendRejectionEmail(updated.student.email, updated.event.title);

  return updated;
};

export const complete = async (applicationId: string, userId: string, userRole: string) => {
  const app = await getApplicationWithEvent(applicationId, userId, userRole);
  if (app.status !== 'APPROVED') {
    throw new AppError('Chỉ có thể hoàn thành đơn đã duyệt', 400);
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'COMPLETED' },
    include: { event: true },
  });

  // Calculate hours
  const hours =
    (updated.event.end_date.getTime() - updated.event.start_date.getTime()) / 3_600_000;

  await prisma.user.update({
    where: { id: app.student_id },
    data: {
      total_hours: { increment: hours },
      total_points: { increment: updated.event.fixed_point },
      current_points: { increment: updated.event.fixed_point },
    },
  });

  // Check for new badges
  await checkAndAssignBadges(app.student_id);

  await prisma.notification.create({
    data: {
      user_id: app.student_id,
      title: 'Đơn đã hoàn thành',
      message: `Bạn đã hoàn thành sự kiện "${updated.event.title}".`,
      type: 'APPLICATION_COMPLETED',
      link: `/my-applications`,
    },
  });

  return updated;
};

export const cancel = async (applicationId: string, studentId: string) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { event: true },
  });
  if (!application) throw new AppError('Đơn đăng ký không tồn tại', 404);
  if (application.student_id !== studentId) throw new AppError('Không có quyền huỷ đơn này', 403);
  if (!['PENDING', 'APPROVED'].includes(application.status)) {
    throw new AppError('Chỉ có thể huỷ đơn đang chờ duyệt hoặc đã duyệt', 400);
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: { status: 'CANCELLED' },
    include: {
      event: {
        select: { id: true, title: true, start_date: true, end_date: true, status: true, cover_image: true },
      },
    },
  });
};

// ─── Helper ──────────────────────────────────────────

async function getApplicationWithEvent(applicationId: string, userId: string, userRole: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { event: { include: { managers: { select: { id: true } } } } },
  });
  if (!app) throw new AppError('Đơn đăng ký không tồn tại', 404);

  const isManager = app.event.managers.some((m) => m.id === userId);
  if (userRole !== 'ADMIN' && app.event.admin_id !== userId && !isManager) {
    throw new AppError('Không có quyền quản lý đơn đăng ký này', 403);
  }

  return app;
}
