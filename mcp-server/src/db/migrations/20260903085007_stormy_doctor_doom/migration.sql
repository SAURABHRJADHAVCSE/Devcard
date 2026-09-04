CREATE TABLE `certifications` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`issuer` text,
	`issued_date` text,
	`expires_date` text,
	`credential_url` text
);
--> statement-breakpoint
CREATE TABLE `education` (
	`id` text PRIMARY KEY,
	`institution` text NOT NULL,
	`degree` text,
	`field` text,
	`start_year` integer,
	`end_year` integer,
	`gpa` real,
	`activities` text
);
--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` text PRIMARY KEY,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`description` text,
	`location` text,
	`employment_type` text,
	`tech_used` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`is_current` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `knowledge_events` (
	`id` text PRIMARY KEY,
	`source` text NOT NULL,
	`raw_message` text,
	`parsed_delta` text,
	`applied_at` integer
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`headline` text,
	`bio` text,
	`email` text,
	`phone` text,
	`location` text,
	`website` text,
	`github` text,
	`linkedin` text,
	`twitter` text,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`description` text,
	`long_description` text,
	`url` text,
	`github` text,
	`tech` text,
	`status` text,
	`featured` integer DEFAULT false,
	`start_date` text,
	`end_date` text
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`level` text,
	`years_of_experience` real,
	`added_at` integer
);
