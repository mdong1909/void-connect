CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`author_name` text DEFAULT 'Anonymous Visitor' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
