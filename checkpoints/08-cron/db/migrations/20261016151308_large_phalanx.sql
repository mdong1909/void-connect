CREATE TABLE `question_sentiments` (
	`question_id` integer PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`label` text,
	`confidence` real,
	`attempts` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
