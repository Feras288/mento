CREATE TABLE `contactReplies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`body` text NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactReplies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contactMessages` MODIFY COLUMN `status` enum('new','read','replied') NOT NULL DEFAULT 'new';--> statement-breakpoint
ALTER TABLE `contactReplies` ADD CONSTRAINT `contactReplies_messageId_contactMessages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `contactMessages`(`id`) ON DELETE cascade ON UPDATE no action;