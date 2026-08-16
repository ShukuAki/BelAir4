-- ============================================================================
-- Laguna BelAir 4 - Staff Dashboard Database Setup Script
-- SQL Server Script for Entity Framework Core Staff Dashboard Entities
-- ============================================================================

PRINT '============================================================================';
PRINT 'Staff Dashboard Database Integration';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- SECTION 1: VERIFY/CREATE STAFF DASHBOARD TABLES
-- ============================================================================

-- Create Tasks Table (Kanban Board)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'tasks')
BEGIN
	CREATE TABLE [tasks] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[title] VARCHAR(300) NOT NULL,
		[description] NVARCHAR(MAX) NULL,
		[category] VARCHAR(50) NOT NULL DEFAULT 'General',
		[priority] VARCHAR(20) NOT NULL DEFAULT 'medium',
		[status] VARCHAR(20) NOT NULL DEFAULT 'todo',
		[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
		[due_date] DATETIME2 NULL,
		[completed_at] DATETIME2 NULL,
		[assigned_to] VARCHAR(200) NULL,
		[auto_delete_after_days] INT NULL,
		[notes] VARCHAR(500) NULL
	);
	CREATE INDEX [IX_Tasks_Status] ON [tasks]([status]);
	CREATE INDEX [IX_Tasks_Category] ON [tasks]([category]);
	CREATE INDEX [IX_Tasks_Priority] ON [tasks]([priority]);
	CREATE INDEX [IX_Tasks_CreatedAt] ON [tasks]([created_at]);
	PRINT 'Table [tasks] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [tasks] already exists';
END;

-- Verify Announcements Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'announcements')
BEGIN
	CREATE TABLE [announcements] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[title] VARCHAR(300) NOT NULL,
		[body] NVARCHAR(MAX) NULL,
		[category] VARCHAR(100) NOT NULL DEFAULT 'General',
		[posted_by] VARCHAR(100) NULL,
		[posted_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
		[status] VARCHAR(20) NOT NULL DEFAULT 'published',
		[scheduled_at] DATETIME2 NULL
	);
	CREATE INDEX [IX_Announcements_Status] ON [announcements]([status]);
	CREATE INDEX [IX_Announcements_PostedAt] ON [announcements]([posted_at]);
	PRINT 'Table [announcements] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [announcements] already exists';
END;

-- Verify Events Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'hoa_events')
BEGIN
	CREATE TABLE [hoa_events] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[title] VARCHAR(300) NOT NULL,
		[description] NVARCHAR(MAX) NULL,
		[date] VARCHAR(20) NOT NULL,
		[time] VARCHAR(10) NULL,
		[location] VARCHAR(200) NULL,
		[category] VARCHAR(100) NULL,
		[created_by] VARCHAR(100) NULL,
		[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
	);
	CREATE INDEX [IX_HoaEvents_Date] ON [hoa_events]([date]);
	PRINT 'Table [hoa_events] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [hoa_events] already exists';
END;

-- Verify BOD Members Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'bod_members')
BEGIN
	CREATE TABLE [bod_members] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[name] VARCHAR(200) NOT NULL,
		[position] VARCHAR(100) NULL,
		[term] VARCHAR(50) NULL,
		[phone] VARCHAR(50) NULL,
		[email] VARCHAR(200) NULL,
		[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
	);
	PRINT 'Table [bod_members] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [bod_members] already exists';
END;

-- Verify Meeting Records Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'meeting_records')
BEGIN
	CREATE TABLE [meeting_records] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[title] VARCHAR(300) NOT NULL,
		[date] VARCHAR(20) NULL,
		[type] VARCHAR(50) NULL,
		[file_path] NVARCHAR(MAX) NULL,
		[uploaded_by] VARCHAR(100) NULL,
		[uploaded_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
	);
	CREATE INDEX [IX_MeetingRecords_UploadedAt] ON [meeting_records]([uploaded_at]);
	PRINT 'Table [meeting_records] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [meeting_records] already exists';
END;

-- Verify HOA Documents Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'hoa_documents')
BEGIN
	CREATE TABLE [hoa_documents] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[name] VARCHAR(300) NOT NULL,
		[category] VARCHAR(100) NULL,
		[file_path] NVARCHAR(MAX) NULL,
		[uploaded_by] VARCHAR(100) NULL,
		[uploaded_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
	);
	CREATE INDEX [IX_HoaDocuments_Category] ON [hoa_documents]([category]);
	PRINT 'Table [hoa_documents] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [hoa_documents] already exists';
END;

-- Verify Contacts Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'contacts')
BEGIN
	CREATE TABLE [contacts] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[name] VARCHAR(200) NOT NULL,
		[role] VARCHAR(100) NULL,
		[phone] VARCHAR(50) NULL,
		[email] VARCHAR(200) NULL,
		[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
	);
	PRINT 'Table [contacts] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [contacts] already exists';
END;

-- Verify Reservations Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'reservations')
BEGIN
	CREATE TABLE [reservations] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[user_id] VARCHAR(100) NULL,
		[resident_name] VARCHAR(200) NULL,
		[amenity] VARCHAR(100) NOT NULL,
		[date] VARCHAR(20) NOT NULL,
		[start_time] VARCHAR(10) NOT NULL,
		[end_time] VARCHAR(10) NOT NULL,
		[purpose] VARCHAR(100) NULL,
		[notes] NVARCHAR(MAX) NULL,
		[status] VARCHAR(20) NOT NULL DEFAULT 'pending',
		[submitted_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
		[reviewed_at] DATETIME2 NULL,
		[reviewed_by] VARCHAR(100) NULL,
		[rejection_reason] NVARCHAR(MAX) NULL
	);
	CREATE INDEX [IX_Reservations_Status] ON [reservations]([status]);
	CREATE INDEX [IX_Reservations_Date] ON [reservations]([date]);
	CREATE INDEX [IX_Reservations_Amenity] ON [reservations]([amenity]);
	PRINT 'Table [reservations] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [reservations] already exists';
END;

-- Verify Concern Reports (Incidents) Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'concern_reports')
BEGIN
	CREATE TABLE [concern_reports] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[description] NVARCHAR(MAX) NULL,
		[category] VARCHAR(100) NULL,
		[address] VARCHAR(200) NULL,
		[street] VARCHAR(200) NULL,
		[additional_location] VARCHAR(500) NULL,
		[latitude] FLOAT NULL,
		[longitude] FLOAT NULL,
		[anonymous] BIT NOT NULL DEFAULT 0,
		[reporter_name] VARCHAR(200) NULL,
		[reporter_contact] VARCHAR(200) NULL,
		[photo] NVARCHAR(MAX) NULL,
		[timestamp] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
		[reference] VARCHAR(50) NULL UNIQUE,
		[priority] VARCHAR(20) NOT NULL DEFAULT 'medium',
		[detected_keywords] NVARCHAR(MAX) NULL,
		[is_public] BIT NOT NULL DEFAULT 1,
		[status] VARCHAR(20) NOT NULL DEFAULT 'open',
		[staff_comment] NVARCHAR(MAX) NULL,
		[resolved_by] VARCHAR(200) NULL,
		[resolved_at] DATETIME2 NULL
	);
	CREATE INDEX [IX_ConcernReports_Status] ON [concern_reports]([status]);
	CREATE INDEX [IX_ConcernReports_Priority] ON [concern_reports]([priority]);
	CREATE INDEX [IX_ConcernReports_Timestamp] ON [concern_reports]([timestamp]);
	CREATE INDEX [IX_ConcernReports_Reference] ON [concern_reports]([reference]);
	PRINT 'Table [concern_reports] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [concern_reports] already exists';
END;

-- Verify Keyword Dictionary Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'keyword_dictionary')
BEGIN
	CREATE TABLE [keyword_dictionary] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[keyword] NVARCHAR(100) NOT NULL,
		[severity] VARCHAR(20) NOT NULL DEFAULT 'medium',
		[category] VARCHAR(100) NULL,
		[language] VARCHAR(10) NULL DEFAULT 'bilingual',
		[description] NVARCHAR(MAX) NULL,
		[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
		[updated_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
		[is_active] BIT NOT NULL DEFAULT 1
	);
	CREATE INDEX [IX_KeywordDictionary_Keyword] ON [keyword_dictionary]([keyword]);
	CREATE INDEX [IX_KeywordDictionary_Severity] ON [keyword_dictionary]([severity]);
	CREATE INDEX [IX_KeywordDictionary_IsActive] ON [keyword_dictionary]([is_active]);
	PRINT 'Table [keyword_dictionary] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [keyword_dictionary] already exists';
END;

-- Insert sample keywords if table is empty
IF NOT EXISTS (SELECT 1 FROM [keyword_dictionary] WHERE [is_active] = 1)
BEGIN
	INSERT INTO [keyword_dictionary] ([keyword], [severity], [category], [language], [is_active])
	VALUES 
		('suspicious', 'high', 'Security', 'bilingual', 1),
		('break-in', 'high', 'Security', 'bilingual', 1),
		('theft', 'high', 'Crime', 'bilingual', 1),
		('nakawan', 'high', 'Crime', 'Filipino', 1),
		('tubig', 'high', 'Emergency', 'Filipino', 1),
		('water leak', 'high', 'Emergency', 'English', 1),
		('baha', 'high', 'Disaster', 'Filipino', 1),
		('flood', 'high', 'Disaster', 'English', 1),
		('sunog', 'high', 'Emergency', 'Filipino', 1),
		('fire', 'high', 'Emergency', 'English', 1),
		('emergency', 'high', 'General', 'bilingual', 1),
		('fallen tree', 'high', 'Hazard', 'English', 1),
		('open gate', 'high', 'Security', 'English', 1),
		('ilaw', 'medium', 'Maintenance', 'Filipino', 1),
		('light', 'medium', 'Maintenance', 'English', 1),
		('kuryente', 'medium', 'Utilities', 'Filipino', 1),
		('pothole', 'medium', 'Roads', 'English', 1),
		('kalsada', 'medium', 'Infrastructure', 'Filipino', 1),
		('maintenance', 'medium', 'General', 'bilingual', 1),
		('sira', 'medium', 'Maintenance', 'Filipino', 1),
		('broken', 'medium', 'Maintenance', 'English', 1),
		('parking', 'low', 'Traffic', 'bilingual', 1),
		('basura', 'low', 'Sanitation', 'Filipino', 1),
		('garbage', 'low', 'Sanitation', 'English', 1),
		('ingay', 'low', 'Nuisance', 'Filipino', 1),
		('noise', 'low', 'Nuisance', 'English', 1);
	PRINT 'Sample keywords inserted - 26 total';
END
ELSE
BEGIN
	PRINT 'Keywords table already populated';
END;

-- ============================================================================
-- VERIFICATION AND SUMMARY
-- ============================================================================

PRINT '';
PRINT '============================================================================';
PRINT 'STAFF DASHBOARD DATABASE INTEGRATION COMPLETE';
PRINT '============================================================================';
PRINT '';
PRINT 'Tables Created/Verified:';
PRINT '  [tasks] - Task management and kanban board';
PRINT '  [announcements] - Community announcements';
PRINT '  [hoa_events] - Events and calendar';
PRINT '  [bod_members] - Board of Directors';
PRINT '  [meeting_records] - Meeting documentation';
PRINT '  [hoa_documents] - Forms and documents';
PRINT '  [contacts] - Contact directory';
PRINT '  [reservations] - Amenity reservations';
PRINT '  [concern_reports] - Incident reporting';
PRINT '  [keyword_dictionary] - Keyword analysis';
PRINT '';
PRINT 'All tables are ready for the staff dashboard API!';
PRINT '';
PRINT '============================================================================';
