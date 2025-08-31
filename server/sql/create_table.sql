USE recruit_web;

-- USERS
CREATE TABLE users (
  id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  role ENUM('admin','recruiter','applicant') NOT NULL DEFAULT 'applicant',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_created_at (created_at)
);

-- JOBS
CREATE TABLE jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  location VARCHAR(200) NULL,
  description TEXT NULL,
  salary VARCHAR(100) NULL,
  requirements TEXT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_by_name VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_user FOREIGN KEY (created_by) REFERENCES users(id)
);

-- JOB TAGS (từ mảng tags của job)
CREATE TABLE job_tags (
  job_id BIGINT UNSIGNED NOT NULL,
  tag VARCHAR(100) NOT NULL,
  PRIMARY KEY (job_id, tag),
  CONSTRAINT fk_job_tags_job FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- USER FAVORITES (từ favoriteJobs trong user)
CREATE TABLE user_favorite_jobs (
  user_id BIGINT UNSIGNED NOT NULL,
  job_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, job_id),
  CONSTRAINT fk_ufj_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_ufj_job  FOREIGN KEY (job_id)  REFERENCES jobs(id)
);

-- APPLICATIONS
CREATE TABLE applications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  applicant_id BIGINT UNSIGNED NOT NULL,
  cover_letter TEXT NOT NULL,
  cv VARCHAR(500) NULL,
  phone VARCHAR(30) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_app_user FOREIGN KEY (applicant_id) REFERENCES users(id)
  -- Nếu muốn: 1 ứng viên chỉ nộp 1 đơn cho 1 job thì mở dòng dưới:
  -- , UNIQUE KEY uk_app_unique (job_id, applicant_id)
);
