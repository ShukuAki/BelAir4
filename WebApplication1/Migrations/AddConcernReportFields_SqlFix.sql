-- Add missing columns to concern_reports table
-- Run this script directly against your database to fix the SQL exception

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('concern_reports') AND name = 'priority')
BEGIN
    ALTER TABLE concern_reports ADD priority VARCHAR(20) NULL DEFAULT 'medium';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('concern_reports') AND name = 'detected_keywords')
BEGIN
    ALTER TABLE concern_reports ADD detected_keywords NVARCHAR(MAX) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('concern_reports') AND name = 'is_public')
BEGIN
    ALTER TABLE concern_reports ADD is_public BIT NOT NULL DEFAULT 1;
END
