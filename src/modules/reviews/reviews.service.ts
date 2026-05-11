import prisma from '../../config/database';
import { AppError } from '../../utils/app-error';
import { sendReviewNotificationEmail } from '../../services/email.service';

export const create = async (
  adminId: string,
  data: { application_id: string; rating_score: number; feedback_text?: string },
) => {
  const application = await prisma.application.findUnique({
    where: { id: data.application_id },
    include: { event: true, student: true },
  });

  if (!application) throw new AppError('Đơn đăng ký không tồn tại', 404);
  if (application.status !== 'COMPLETED') {
    throw new AppError('Chỉ có thể đánh giá đơn đã hoàn thành', 400);
  }
  if (application.event.admin_id !== adminId) {
    throw new AppError('Không có quyền đánh giá', 403);
  }

  // Check duplicate review
  const existingReview = await prisma.review.findUnique({
    where: { application_id: data.application_id },
  });
  if (existingReview) throw new AppError('Đã có đánh giá cho đơn này', 409);

  const review = await prisma.review.create({
    data: {
      event_id: application.event_id,
      student_id: application.student_id,
      admin_id: adminId,
      application_id: data.application_id,
      rating_score: data.rating_score,
      feedback_text: data.feedback_text,
    },
  });

  // Update reputation_score = average of all ratings
  const avgResult = await prisma.review.aggregate({
    where: { student_id: application.student_id },
    _avg: { rating_score: true },
  });

  await prisma.user.update({
    where: { id: application.student_id },
    data: { reputation_score: avgResult._avg.rating_score || 0 },
  });

  // Notification
  await prisma.notification.create({
    data: {
      user_id: application.student_id,
      title: 'Đánh giá mới',
      message: `Bạn nhận được ${data.rating_score} sao cho sự kiện "${application.event.title}"`,
      type: 'REVIEW_RECEIVED',
    },
  });

  sendReviewNotificationEmail(application.student.email, application.event.title, data.rating_score);

  return review;
};

export const getByStudent = async (studentId: string) => {
  return prisma.review.findMany({
    where: { student_id: studentId },
    include: {
      event: { select: { id: true, title: true } },
      admin: { select: { id: true, full_name: true } },
    },
    orderBy: { created_at: 'desc' },
  });
};
