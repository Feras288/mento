CREATE TABLE `eventRegistrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`attendeeName` varchar(160) NOT NULL,
	`attendeeEmail` varchar(320) NOT NULL,
	`attendeePhone` varchar(48),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventRegistrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_registration_unique` UNIQUE(`eventId`,`attendeeEmail`)
);
--> statement-breakpoint
ALTER TABLE `eventRegistrations` ADD CONSTRAINT `eventRegistrations_eventId_contentItems_id_fk` FOREIGN KEY (`eventId`) REFERENCES `contentItems`(`id`) ON DELETE cascade ON UPDATE no action;