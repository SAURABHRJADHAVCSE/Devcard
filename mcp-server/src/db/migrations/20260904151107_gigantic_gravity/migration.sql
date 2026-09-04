CREATE TABLE `resume_versions` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`job_description` text,
	`template` text DEFAULT 'polished',
	`summary` text,
	`skill_names` text,
	`project_names` text,
	`created_at` integer,
	`updated_at` integer
);
