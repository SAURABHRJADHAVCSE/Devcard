CREATE TABLE `applications` (
	`id` text PRIMARY KEY,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`platform` text,
	`job_url` text,
	`resume_version_id` text,
	`status` text DEFAULT 'applied' NOT NULL,
	`notes` text,
	`applied_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `job_platforms` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`base_url` text NOT NULL,
	`added_at` integer
);
