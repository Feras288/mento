CREATE TABLE `contactMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderName` varchar(160) NOT NULL,
	`senderEmail` varchar(320) NOT NULL,
	`phone` varchar(48),
	`subject` varchar(240) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','read') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('news','event') NOT NULL,
	`title` varchar(240) NOT NULL,
	`summary` text NOT NULL,
	`imageUrl` text,
	`status` enum('draft','published') NOT NULL DEFAULT 'published',
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`eventStartsAt` timestamp,
	`eventLocation` varchar(240),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
