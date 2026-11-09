-- Hypothesis Gate Database Schema
-- Database: hypothesis_gate

CREATE DATABASE IF NOT EXISTS `hypothesis_gate` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `hypothesis_gate`;

-- 1. Users Table (Students and Mentors)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'mentor') NOT NULL,
  `institution` VARCHAR(255) DEFAULT 'National Institute of Technology',
  `department` VARCHAR(255) DEFAULT 'Computer Science & Engineering',
  `bio` TEXT DEFAULT NULL,
  `expertise` VARCHAR(255) DEFAULT NULL,
  `skills` TEXT DEFAULT NULL,
  `experience_years` INT DEFAULT 0,
  `availability_status` ENUM('available', 'limited', 'unavailable') DEFAULT 'available',
  `max_capacity` INT DEFAULT 5,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `domain` VARCHAR(100) NOT NULL,
  `problem_statement` TEXT NOT NULL,
  `limitations` TEXT DEFAULT NULL,
  `proposed_solution` TEXT NOT NULL,
  `objectives` TEXT NOT NULL,
  `technologies` TEXT DEFAULT NULL,
  `expected_outcome` TEXT DEFAULT NULL,
  `initial_hypothesis` TEXT DEFAULT NULL,
  `status` ENUM('draft', 'submitted', 'under_review', 'revision_requested', 'approved', 'completed') DEFAULT 'draft',
  `current_stage` ENUM('submission', 'research', 'validation', 'mentor_matching', 'mentor_review', 'hypothesis_testing', 'completed') DEFAULT 'submission',
  `assigned_mentor_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_projects_student` (`student_id`),
  INDEX `idx_projects_mentor` (`assigned_mentor_id`),
  INDEX `idx_projects_domain` (`domain`),
  CONSTRAINT `fk_projects_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_projects_mentor` FOREIGN KEY (`assigned_mentor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Research Papers Table
CREATE TABLE IF NOT EXISTS `research_papers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `title` TEXT NOT NULL,
  `authors` TEXT DEFAULT NULL,
  `publication_year` INT DEFAULT NULL,
  `abstract` TEXT DEFAULT NULL,
  `source_url` TEXT DEFAULT NULL,
  `doi` VARCHAR(255) DEFAULT NULL,
  `relevance_score` INT DEFAULT 0,
  `comparison_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_papers_project` (`project_id`),
  CONSTRAINT `fk_papers_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Project Research Papers Junction Table (for multi-link flexibility)
CREATE TABLE IF NOT EXISTS `project_research_papers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `paper_id` INT NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_prp_project` (`project_id`),
  INDEX `idx_prp_paper` (`paper_id`),
  CONSTRAINT `fk_prp_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prp_paper` FOREIGN KEY (`paper_id`) REFERENCES `research_papers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Evidence Validation Results Table
CREATE TABLE IF NOT EXISTS `validation_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL UNIQUE,
  `problem_clarity_score` INT NOT NULL,
  `problem_clarity_feedback` TEXT NOT NULL,
  `research_support_score` INT NOT NULL,
  `research_support_feedback` TEXT NOT NULL,
  `originality_score` INT NOT NULL,
  `originality_feedback` TEXT NOT NULL,
  `feasibility_score` INT NOT NULL,
  `feasibility_feedback` TEXT NOT NULL,
  `testability_score` INT NOT NULL,
  `testability_feedback` TEXT NOT NULL,
  `overall_score` INT NOT NULL,
  `overall_status` VARCHAR(50) NOT NULL,
  `missing_info` JSON DEFAULT NULL,
  `recommended_improvements` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_validation_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Mentor Requests Table
CREATE TABLE IF NOT EXISTS `mentor_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `mentor_id` INT NOT NULL,
  `match_score` INT NOT NULL,
  `match_explanation` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  `request_message` TEXT DEFAULT NULL,
  `response_message` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_mr_project` (`project_id`),
  INDEX `idx_mr_student` (`student_id`),
  INDEX `idx_mr_mentor` (`mentor_id`),
  INDEX `idx_mr_status` (`status`),
  CONSTRAINT `fk_mr_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mr_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mr_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Mentor Reviews Table
CREATE TABLE IF NOT EXISTS `mentor_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `mentor_id` INT NOT NULL,
  `review_decision` ENUM('approved', 'revision_requested', 'rejected', 'feedback_only') NOT NULL,
  `general_feedback` TEXT NOT NULL,
  `strengths` TEXT DEFAULT NULL,
  `weaknesses` TEXT DEFAULT NULL,
  `recommended_actions` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_reviews_project` (`project_id`),
  INDEX `idx_reviews_mentor` (`mentor_id`),
  CONSTRAINT `fk_reviews_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Hypotheses Table
CREATE TABLE IF NOT EXISTS `hypotheses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `statement` TEXT NOT NULL,
  `rationale` TEXT DEFAULT NULL,
  `status` ENUM('draft', 'testing', 'supported', 'not_supported', 'inconclusive') DEFAULT 'draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_hypotheses_project` (`project_id`),
  CONSTRAINT `fk_hypotheses_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Experiments Table
CREATE TABLE IF NOT EXISTS `experiments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hypothesis_id` INT NOT NULL,
  `project_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `procedure_steps` TEXT NOT NULL,
  `evaluation_metric` VARCHAR(255) NOT NULL,
  `success_criteria` VARCHAR(255) NOT NULL,
  `observations` TEXT DEFAULT NULL,
  `quantitative_data` JSON DEFAULT NULL,
  `result_outcome` ENUM('supported', 'not_supported', 'inconclusive', 'pending') DEFAULT 'pending',
  `conclusion` TEXT DEFAULT NULL,
  `mentor_reviewed` BOOLEAN DEFAULT FALSE,
  `mentor_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_exp_hypothesis` (`hypothesis_id`),
  INDEX `idx_exp_project` (`project_id`),
  CONSTRAINT `fk_exp_hypothesis` FOREIGN KEY (`hypothesis_id`) REFERENCES `hypotheses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exp_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Project Versions Table
CREATE TABLE IF NOT EXISTS `project_versions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `version_number` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `domain` VARCHAR(100) NOT NULL,
  `problem_statement` TEXT NOT NULL,
  `limitations` TEXT DEFAULT NULL,
  `proposed_solution` TEXT NOT NULL,
  `objectives` TEXT NOT NULL,
  `technologies` TEXT DEFAULT NULL,
  `change_summary` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pv_project` (`project_id`),
  CONSTRAINT `fk_pv_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
