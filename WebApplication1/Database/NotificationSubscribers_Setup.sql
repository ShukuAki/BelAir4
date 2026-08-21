-- ============================================================================
-- Laguna BelAir 4 - Notification Subscribers Table
-- Run this script against the SqBelAir4 database to enable the
-- Push Notification Subscribers feature (Admin Integrations card /
-- Staff Subscribers page).
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notification_subscribers')
BEGIN
	CREATE TABLE [notification_subscribers] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[resident_name] VARCHAR(200) NULL,
		[email] VARCHAR(200) NOT NULL,
		[device_info] VARCHAR(300) NULL,
		[subscribed_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
		[is_active] BIT NOT NULL DEFAULT 1,
		[unsubscribed_at] DATETIME2 NULL,
		[last_notified_at] DATETIME2 NULL,
		[notifications_sent_count] INT NOT NULL DEFAULT 0
	);

	CREATE UNIQUE INDEX [UX_NotificationSubscribers_Email] ON [notification_subscribers]([email]);
END
GO
