-- CreateEnum
CREATE TYPE "ClubMemberStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "is_promise_required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_reason_required" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ClubMember" ADD COLUMN     "promise" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "status" "ClubMemberStatus" NOT NULL DEFAULT 'PENDING';
