import ExcelJS from 'exceljs';
import prisma from '../config/database';
import { AppError } from '../utils/app-error';

export const exportEventParticipants = async (eventId: string, userId: string, userRole: string) => {
  const event = await prisma.event.findUnique({ 
    where: { id: eventId },
    include: { managers: { select: { id: true } } }
  });
  if (!event) throw new AppError('Sự kiện không tồn tại', 404);

  const isManager = event.managers.some((m) => m.id === userId);
  if (userRole !== 'ADMIN' && event.admin_id !== userId && !isManager) {
    throw new AppError('Không có quyền export danh sách', 403);
  }

  const applications = await prisma.application.findMany({
    where: { event_id: eventId },
    include: { student: { select: { full_name: true, email: true, total_hours: true } } },
    orderBy: { applied_at: 'asc' },
  });

  const statusMap: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    COMPLETED: 'Hoàn thành',
  };

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Danh sách tình nguyện viên');

  sheet.columns = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Họ tên', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Tổng giờ TNV', key: 'hours', width: 15 },
  ];

  // Style header row
  sheet.getRow(1).font = { bold: true };

  applications.forEach((app, index) => {
    sheet.addRow({
      stt: index + 1,
      name: app.student.full_name,
      email: app.student.email,
      status: statusMap[app.status] || app.status,
      hours: app.student.total_hours,
    });
  });

  return workbook.xlsx.writeBuffer();
};
