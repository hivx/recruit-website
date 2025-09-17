/*
  Warnings:

  - The primary key for the `job_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `job_tags` DROP PRIMARY KEY,
    MODIFY `tag` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`job_id`, `tag`);

-- AlterTable
ALTER TABLE `users` ADD COLUMN `reset_token` VARCHAR(255) NULL,
    ADD COLUMN `reset_token_expiry` DATETIME(3) NULL,
    MODIFY `avatar` VARCHAR(500) NOT NULL DEFAULT 'uploads\pic.jpg',
    ALTER COLUMN `updated_at` DROP DEFAULT;
