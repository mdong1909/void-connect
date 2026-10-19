ALTER TABLE `questions` ADD `sentiment` text;--> statement-breakpoint
ALTER TABLE `questions` ADD `sentiment_confidence` real;
--> statement-breakpoint
UPDATE `questions`
SET `sentiment` = (SELECT `label` FROM `question_sentiments` WHERE `question_id` = `questions`.`id`),
    `sentiment_confidence` = (SELECT `confidence` FROM `question_sentiments` WHERE `question_id` = `questions`.`id`)
WHERE `id` IN (SELECT `question_id` FROM `question_sentiments` WHERE `status` = 'complete' AND `label` IS NOT NULL);
