CREATE TABLE `surveyAnswers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`responseId` int NOT NULL,
	`questionId` int NOT NULL,
	`value` text NOT NULL,
	CONSTRAINT `surveyAnswers_id` PRIMARY KEY(`id`),
	CONSTRAINT `survey_answer_per_question_unique` UNIQUE(`responseId`,`questionId`)
);
--> statement-breakpoint
CREATE TABLE `surveyQuestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`prompt` text NOT NULL,
	`helpText` text,
	`type` enum('single_choice','rating','text') NOT NULL,
	`optionsJson` text,
	`isRequired` enum('yes','no') NOT NULL DEFAULT 'yes',
	`position` int NOT NULL,
	CONSTRAINT `surveyQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surveyResponses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`respondentTokenHash` varchar(64) NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `surveyResponses_id` PRIMARY KEY(`id`),
	CONSTRAINT `survey_response_per_device_unique` UNIQUE(`surveyId`,`respondentTokenHash`)
);
--> statement-breakpoint
CREATE TABLE `surveys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(240) NOT NULL,
	`description` text,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `surveys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `surveyAnswers` ADD CONSTRAINT `surveyAnswers_responseId_surveyResponses_id_fk` FOREIGN KEY (`responseId`) REFERENCES `surveyResponses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `surveyAnswers` ADD CONSTRAINT `surveyAnswers_questionId_surveyQuestions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `surveyQuestions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `surveyQuestions` ADD CONSTRAINT `surveyQuestions_surveyId_surveys_id_fk` FOREIGN KEY (`surveyId`) REFERENCES `surveys`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `surveyResponses` ADD CONSTRAINT `surveyResponses_surveyId_surveys_id_fk` FOREIGN KEY (`surveyId`) REFERENCES `surveys`(`id`) ON DELETE cascade ON UPDATE no action;