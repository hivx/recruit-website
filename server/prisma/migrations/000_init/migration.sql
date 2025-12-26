-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `avatar` VARCHAR(255) NOT NULL DEFAULT 'uploads/pic.jpg',
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `role` ENUM('admin', 'recruiter', 'applicant') NOT NULL DEFAULT 'applicant',
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reset_token` VARCHAR(255) NULL,
    `reset_token_expiry` DATETIME(3) NULL,
    `reset_password_hash` VARCHAR(255) NULL,
    `receive_recommendation` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `idx_user_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companies` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `legal_name` VARCHAR(255) NOT NULL,
    `registration_number` VARCHAR(100) NOT NULL,
    `tax_id` VARCHAR(100) NULL,
    `country_code` VARCHAR(2) NOT NULL,
    `registered_address` VARCHAR(255) NOT NULL,
    `incorporation_date` DATETIME(3) NULL,
    `owner_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `logo` VARCHAR(255) NULL DEFAULT 'uploads/pic.jpg',

    UNIQUE INDEX `companies_owner_id_key`(`owner_id`),
    INDEX `idx_company_country`(`country_code`),
    UNIQUE INDEX `uq_company_reg_country`(`registration_number`, `country_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_verifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `reviewed_by` BIGINT NULL,
    `company_id` BIGINT NOT NULL,
    `status` ENUM('submitted', 'verified', 'rejected') NOT NULL DEFAULT 'submitted',
    `rejection_reason` TEXT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `verified_at` DATETIME(3) NULL,

    UNIQUE INDEX `company_verifications_company_id_key`(`company_id`),
    INDEX `idx_companyver_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `company_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_by_name` VARCHAR(200) NOT NULL,
    `location` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `salary_min` INTEGER NULL,
    `salary_max` INTEGER NULL,
    `requirements` TEXT NULL,
    `quality_score` DOUBLE NULL DEFAULT 0,
    `application_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_jobs_company`(`company_id`),
    INDEX `idx_jobs_creator`(`created_by`),
    INDEX `idx_jobs_location`(`location`),
    INDEX `idx_jobs_updated`(`updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_approvals` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `job_id` BIGINT NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `reason` TEXT NULL,
    `auditor_id` BIGINT NULL,
    `audited_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `job_approvals_job_id_key`(`job_id`),
    INDEX `idx_jobapproval_status_time`(`status`, `audited_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_required_skills` (
    `job_id` BIGINT NOT NULL,
    `skill_id` INTEGER NOT NULL,
    `level_required` INTEGER NULL,
    `years_required` INTEGER NULL,
    `must_have` BOOLEAN NOT NULL DEFAULT true,
    `fit_weight` DOUBLE NULL DEFAULT 1,

    INDEX `idx_jobreq_skill`(`skill_id`),
    PRIMARY KEY (`job_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `tags_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_tags` (
    `job_id` BIGINT NOT NULL,
    `tag_id` INTEGER NOT NULL,

    INDEX `idx_jobtag_tag`(`tag_id`),
    PRIMARY KEY (`job_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_favorite_jobs` (
    `user_id` BIGINT NOT NULL,
    `job_id` BIGINT NOT NULL,

    INDEX `user_favorite_jobs_job_id_fkey`(`job_id`),
    PRIMARY KEY (`user_id`, `job_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `job_id` BIGINT NOT NULL,
    `applicant_id` BIGINT NOT NULL,
    `cover_letter` TEXT NOT NULL,
    `cv` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    `fit_score` DOUBLE NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `review_note` TEXT NULL,
    `reviewed_at` DATETIME(3) NULL,
    `reviewed_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_app_job_status`(`job_id`, `status`),
    INDEX `idx_app_fit`(`fit_score`),
    INDEX `idx_app_applicant`(`applicant_id`),
    INDEX `idx_app_job`(`job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_interest_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `job_id` BIGINT NOT NULL,
    `job_title` VARCHAR(255) NOT NULL,
    `location` VARCHAR(100) NULL,
    `avg_salary` INTEGER NULL,
    `tags` JSON NULL,
    `source` ENUM('viewed', 'applied', 'favorite', 'recommended') NOT NULL,
    `event_type` VARCHAR(50) NULL DEFAULT 'open_detail',
    `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_uih_user_date`(`user_id`, `recorded_at`),
    INDEX `idx_uih_job`(`job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `career_preferences` (
    `user_id` BIGINT NOT NULL,
    `desired_title` VARCHAR(200) NULL,
    `desired_company` VARCHAR(200) NULL,
    `desired_location` VARCHAR(100) NULL,
    `desired_salary` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `career_preference_tags` (
    `user_id` BIGINT NOT NULL,
    `tag_id` INTEGER NOT NULL,

    INDEX `career_preference_tags_tag_id_fkey`(`tag_id`),
    PRIMARY KEY (`user_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recruiter_preferences` (
    `user_id` BIGINT NOT NULL,
    `desired_location` VARCHAR(191) NULL,
    `desired_salary_avg` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recruiter_required_skills` (
    `user_id` BIGINT NOT NULL,
    `skill_id` INTEGER NOT NULL,
    `years_required` INTEGER NULL,
    `must_have` BOOLEAN NOT NULL DEFAULT true,

    INDEX `idx_rec_req_skill`(`skill_id`),
    PRIMARY KEY (`user_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recruiter_preference_tags` (
    `user_id` BIGINT NOT NULL,
    `tag_id` INTEGER NOT NULL,

    INDEX `idx_rec_pref_tag`(`tag_id`),
    PRIMARY KEY (`user_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_behavior_profile` (
    `user_id` BIGINT NOT NULL,
    `avg_salary` INTEGER NULL,
    `main_location` VARCHAR(100) NULL,
    `tags` JSON NULL,
    `keywords` JSON NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_recommendations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `job_id` BIGINT NOT NULL,
    `fit_score` DOUBLE NULL DEFAULT 0,
    `reason` TEXT NULL,
    `is_sent` BOOLEAN NOT NULL DEFAULT false,
    `sent_at` DATETIME(3) NULL,
    `status` VARCHAR(50) NULL,
    `recommended_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_jobreco_fit`(`fit_score`),
    INDEX `job_recommendations_job_id_fkey`(`job_id`),
    UNIQUE INDEX `job_recommendations_user_id_job_id_key`(`user_id`, `job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `candidate_recommendations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `recruiter_id` BIGINT NOT NULL,
    `applicant_id` BIGINT NOT NULL,
    `fit_score` DOUBLE NULL DEFAULT 0,
    `reason` TEXT NULL,
    `status` VARCHAR(50) NULL,
    `recommended_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_candreco_fit`(`fit_score`),
    INDEX `candidate_recommendations_applicant_id_fkey`(`applicant_id`),
    UNIQUE INDEX `candidate_recommendations_recruiter_id_applicant_id_key`(`recruiter_id`, `applicant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `skills_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_skills` (
    `user_id` BIGINT NOT NULL,
    `skill_id` INTEGER NOT NULL,
    `level` INTEGER NULL,
    `years` INTEGER NULL,
    `note` TEXT NULL,

    INDEX `idx_userskill_skill`(`skill_id`),
    PRIMARY KEY (`user_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_vector` (
    `user_id` BIGINT NOT NULL,
    `skill_profile` JSON NULL,
    `tag_profile` JSON NULL,
    `title_keywords` JSON NULL,
    `preferred_location` VARCHAR(100) NULL,
    `salary_expected` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_vector_updated_at_idx`(`updated_at`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recruiter_vector` (
    `user_id` BIGINT NOT NULL,
    `skill_profile` JSON NULL,
    `tag_profile` JSON NULL,
    `preferred_location` VARCHAR(100) NULL,
    `salary_avg` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_vector` (
    `job_id` BIGINT NOT NULL,
    `skill_profile` JSON NULL,
    `tag_profile` JSON NULL,
    `title_keywords` JSON NULL,
    `location` VARCHAR(100) NULL,
    `salary_avg` INTEGER NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `job_vector_updated_at_idx`(`updated_at`),
    PRIMARY KEY (`job_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_job_matrix` (
    `user_id` BIGINT NOT NULL,
    `job_id` BIGINT NOT NULL,
    `score` DOUBLE NOT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_userjob_score`(`score`),
    INDEX `user_job_matrix_job_id_fkey`(`job_id`),
    PRIMARY KEY (`user_id`, `job_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `companies` ADD CONSTRAINT `companies_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_verifications` ADD CONSTRAINT `company_verifications_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_approvals` ADD CONSTRAINT `job_approvals_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_required_skills` ADD CONSTRAINT `job_required_skills_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_required_skills` ADD CONSTRAINT `job_required_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_tags` ADD CONSTRAINT `job_tags_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_tags` ADD CONSTRAINT `job_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_favorite_jobs` ADD CONSTRAINT `user_favorite_jobs_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_favorite_jobs` ADD CONSTRAINT `user_favorite_jobs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_interest_history` ADD CONSTRAINT `user_interest_history_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_interest_history` ADD CONSTRAINT `user_interest_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `career_preferences` ADD CONSTRAINT `career_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `career_preference_tags` ADD CONSTRAINT `career_preference_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `career_preference_tags` ADD CONSTRAINT `career_preference_tags_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `career_preferences`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruiter_preferences` ADD CONSTRAINT `recruiter_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruiter_required_skills` ADD CONSTRAINT `recruiter_required_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruiter_required_skills` ADD CONSTRAINT `recruiter_required_skills_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `recruiter_preferences`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruiter_preference_tags` ADD CONSTRAINT `recruiter_preference_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruiter_preference_tags` ADD CONSTRAINT `recruiter_preference_tags_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `recruiter_preferences`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_behavior_profile` ADD CONSTRAINT `user_behavior_profile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_recommendations` ADD CONSTRAINT `job_recommendations_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_recommendations` ADD CONSTRAINT `job_recommendations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidate_recommendations` ADD CONSTRAINT `candidate_recommendations_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidate_recommendations` ADD CONSTRAINT `candidate_recommendations_recruiter_id_fkey` FOREIGN KEY (`recruiter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_skills` ADD CONSTRAINT `user_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_skills` ADD CONSTRAINT `user_skills_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_vector` ADD CONSTRAINT `user_vector_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruiter_vector` ADD CONSTRAINT `recruiter_vector_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_vector` ADD CONSTRAINT `job_vector_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_job_matrix` ADD CONSTRAINT `user_job_matrix_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_job_matrix` ADD CONSTRAINT `user_job_matrix_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

