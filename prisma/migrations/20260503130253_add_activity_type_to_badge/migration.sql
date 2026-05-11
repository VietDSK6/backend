-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "activity_type_id" TEXT;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_activity_type_id_fkey" FOREIGN KEY ("activity_type_id") REFERENCES "ActivityType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
