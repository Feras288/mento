ALTER TABLE `contentItems` ADD `documentCategory` enum('governance','annual_report');--> statement-breakpoint
ALTER TABLE `contentItems` ADD `documentYear` int;--> statement-breakpoint
ALTER TABLE `contentItems` ADD `downloadCount` int DEFAULT 0 NOT NULL;