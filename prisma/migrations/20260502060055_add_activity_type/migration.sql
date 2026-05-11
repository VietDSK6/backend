-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "activity_type_id" TEXT;

-- CreateTable
CREATE TABLE "ActivityType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityType_name_key" ON "ActivityType"("name");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_activity_type_id_fkey" FOREIGN KEY ("activity_type_id") REFERENCES "ActivityType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
