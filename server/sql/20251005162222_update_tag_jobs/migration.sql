/*
  Warnings:

  - The primary key for the `job_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tag` on the `job_tags` table. All the data in the column will be lost.
  - You are about to drop the `job_tags_advanced` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `preference_tags` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tag_id` to the `job_tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `job_tags` DROP FOREIGN KEY `job_tags_job_id_fkey`;

-- DropForeignKey
ALTER TABLE `job_tags_advanced` DROP FOREIGN KEY `job_tags_advanced_job_id_fkey`;

-- DropForeignKey
ALTER TABLE `job_tags_advanced` DROP FOREIGN KEY `job_tags_advanced_tag_id_fkey`;

-- DropForeignKey
ALTER TABLE `preference_tags` DROP FOREIGN KEY `preference_tags_tag_id_fkey`;

-- DropForeignKey
ALTER TABLE `preference_tags` DROP FOREIGN KEY `preference_tags_user_id_fkey`;

-- AlterTable
ALTER TABLE `job_tags` DROP PRIMARY KEY,
    DROP COLUMN `tag`,
    ADD COLUMN `tag_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`job_id`, `tag_id`);

-- AlterTable
ALTER TABLE `users` MODIFY `avatar` VARCHAR(500) NOT NULL DEFAULT 'uploads\pic.jpg';

-- DropTable
DROP TABLE `job_tags_advanced`;

-- DropTable
DROP TABLE `preference_tags`;

-- CreateTable
CREATE TABLE `career_preference_tags` (
    `user_id` BIGINT NOT NULL,
    `tag_id` INTEGER NOT NULL,

    INDEX `idx_cpref_tagid`(`tag_id`),
    PRIMARY KEY (`user_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `job_tags` ADD CONSTRAINT `job_tags_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_tags` ADD CONSTRAINT `job_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `career_preference_tags` ADD CONSTRAINT `career_preference_tags_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `career_preferences`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `career_preference_tags` ADD CONSTRAINT `career_preference_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
