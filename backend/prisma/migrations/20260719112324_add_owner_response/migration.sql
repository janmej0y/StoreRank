-- AlterTable
ALTER TABLE "ratings" ADD COLUMN     "owner_responded_at" TIMESTAMP(3),
ADD COLUMN     "owner_response" VARCHAR(500);
