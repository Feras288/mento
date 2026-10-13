CREATE TABLE `contactAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(160) NOT NULL,
	`fileSize` int NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contactAttachments` ADD CONSTRAINT `contactAttachments_messageId_contactMessages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `contactMessages`(`id`) ON DELETE cascade ON UPDATE no action;