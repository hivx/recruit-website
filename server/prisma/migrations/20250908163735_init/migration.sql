-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `avatar` VARCHAR(500) NOT NULL DEFAULT 'uploads/pic.jpg';,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `role` ENUM('admin', 'recruiter', 'applicant') NOT NULL DEFAULT 'applicant',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `company` VARCHAR(200) NOT NULL,
    `location` VARCHAR(100) NULL,
    `description` VARCHAR(500) NULL,
    `salary_min` INT NULL,
    `salary_max` INT NULL,
    `requirements` VARCHAR(500) NULL,
    `created_by` BIGINT NOT NULL,
    `created_by_name` VARCHAR(500) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_tags` (
    `job_id` BIGINT NOT NULL,
    `tag` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`job_id`, `tag`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_favorite_jobs` (
    `user_id` BIGINT NOT NULL,
    `job_id` BIGINT NOT NULL,

    PRIMARY KEY (`user_id`, `job_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `job_id` BIGINT NOT NULL,
    `applicant_id` BIGINT NOT NULL,
    `cover_letter` VARCHAR(500) NOT NULL,
    `cv` VARCHAR(500) NULL,
    `phone` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    -- UNIQUE KEY `applications_job_id_applicant_id_key` (`job_id`, `applicant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_tags` ADD CONSTRAINT `job_tags_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_favorite_jobs` ADD CONSTRAINT `user_favorite_jobs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_favorite_jobs` ADD CONSTRAINT `user_favorite_jobs_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
