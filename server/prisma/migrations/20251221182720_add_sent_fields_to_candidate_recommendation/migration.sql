-- AlterTable
ALTER TABLE `candidate_recommendations` ADD COLUMN `is_sent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sent_at` DATETIME(3) NULL;
