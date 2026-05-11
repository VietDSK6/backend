-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "batch_id" TEXT;

-- CreateTable
CREATE TABLE "NotificationBatch" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationBatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "NotificationBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
