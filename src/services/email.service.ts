// Email service — console stubs for development
// Replace with Nodemailer when ready to send real emails

export const sendApprovalEmail = (to: string, eventTitle: string) => {
  console.log(`📧 [EMAIL] Approval → ${to}: Đơn sự kiện "${eventTitle}" đã được duyệt`);
};

export const sendRejectionEmail = (to: string, eventTitle: string) => {
  console.log(`📧 [EMAIL] Rejection → ${to}: Đơn sự kiện "${eventTitle}" đã bị từ chối`);
};

export const sendReviewNotificationEmail = (to: string, eventTitle: string, rating: number) => {
  console.log(`📧 [EMAIL] Review → ${to}: Nhận ${rating} sao cho "${eventTitle}"`);
};
