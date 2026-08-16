-- ============================================================================
-- Laguna BelAir 4 - Staff Dashboard Database Setup Script
-- SQL Server Script for Entity Framework Core Staff Dashboard Entities
-- ============================================================================

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

-- Verify Advertisements Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'advertisements')
BEGIN
	CREATE TABLE [advertisements] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[type] VARCHAR(50) NULL,
		[title] VARCHAR(250) NOT NULL,
		[description] NVARCHAR(MAX) NULL,
		[author] VARCHAR(200) NULL,
		[contact_name] VARCHAR(200) NULL,
		[contact_phone] VARCHAR(50) NULL,
		[contact_email] VARCHAR(200) NULL,
		[contact_link] VARCHAR(500) NULL,
		[price] VARCHAR(100) NULL,
		[availability] VARCHAR(200) NULL,
		[image] NVARCHAR(MAX) NULL,
		[status] VARCHAR(20) NOT NULL DEFAULT 'pending',
		[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
		[reviewed_at] DATETIME2 NULL,
		[reviewed_by] VARCHAR(100) NULL
	);
	CREATE INDEX [IX_Advertisements_Status] ON [advertisements]([status]);
	CREATE INDEX [IX_Advertisements_CreatedAt] ON [advertisements]([created_at]);
	PRINT 'Table [advertisements] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [advertisements] already exists';
END;

-- Verify Registrations Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'registrations')
BEGIN
	CREATE TABLE [registrations] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[first_name] VARCHAR(100) NULL,
		[last_name] VARCHAR(100) NULL,
		[full_name] VARCHAR(200) NULL,
		[email] VARCHAR(100) NOT NULL UNIQUE,
		[mobile] VARCHAR(20) NULL,
		[password] NVARCHAR(MAX) NULL,
		[resident_type] VARCHAR(20) NULL,
		[address] VARCHAR(500) NULL,
		[proof_of_residency_path] NVARCHAR(MAX) NULL,
		[status] VARCHAR(20) NOT NULL DEFAULT 'pending',
		[submitted_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
		[reviewed_at] DATETIME2 NULL,
		[reviewed_by] VARCHAR(100) NULL,
		[rejection_reason] NVARCHAR(MAX) NULL
	);
	CREATE INDEX [IX_Registrations_Status] ON [registrations]([status]);
	CREATE INDEX [IX_Registrations_Email] ON [registrations]([email]);
	PRINT 'Table [registrations] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [registrations] already exists';
END;

-- Verify Posts Table (Forums)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'posts')
BEGIN
	CREATE TABLE [posts] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[title] VARCHAR(250) NOT NULL,
		[category] VARCHAR(100) NULL,
		[status] VARCHAR(50) NULL,
		[description] NVARCHAR(MAX) NULL,
		[author] VARCHAR(100) NULL,
		[date] VARCHAR(50) NULL,
		[helpful] INT NULL DEFAULT 0,
		[image] NVARCHAR(MAX) NULL,
		[location] VARCHAR(200) NULL,
		[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
		[detected_keywords] NVARCHAR(MAX) NULL,
		[priority] VARCHAR(20) NULL DEFAULT 'medium'
	);
	CREATE INDEX [IX_Posts_Category] ON [posts]([category]);
	CREATE INDEX [IX_Posts_Status] ON [posts]([status]);
	CREATE INDEX [IX_Posts_Author] ON [posts]([author]);
	PRINT 'Table [posts] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [posts] already exists';
END;

-- Verify Replies Table (Forums)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'replies')
BEGIN
	CREATE TABLE [replies] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[post_id] INT NOT NULL,
		[name] VARCHAR(100) NULL,
		[is_staff] BIT NULL DEFAULT 0,
		[date] VARCHAR(50) NULL,
		[text] NVARCHAR(MAX) NULL,
		[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
		CONSTRAINT [FK_Replies_Posts] FOREIGN KEY ([post_id]) REFERENCES [posts]([id]) ON DELETE CASCADE
	);
	CREATE INDEX [IX_Replies_PostId] ON [replies]([post_id]);
	PRINT 'Table [replies] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [replies] already exists';
END;

-- ============================================================================
-- SECTION 2: VERIFY/CREATE SUPPORT TABLES
-- ============================================================================

-- Verify Vehicles Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'vehicles')
BEGIN
	CREATE TABLE [vehicles] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[type] VARCHAR(50) NULL,
		[category] VARCHAR(50) NULL,
		[plate_number] VARCHAR(50) UNIQUE NULL,
		[color] VARCHAR(50) NULL,
		[brand] VARCHAR(100) NULL,
		[model] VARCHAR(100) NULL,
		[year] VARCHAR(10) NULL,
		[vin] VARCHAR(100) NULL,
		[notes] NVARCHAR(MAX) NULL,
		[guest_name] VARCHAR(200) NULL,
		[guest_contact] VARCHAR(50) NULL,
		[guest_duration] VARCHAR(50) NULL,
		[guest_duration_type] VARCHAR(20) NULL,
		[owner_name] VARCHAR(200) NULL,
		[registered_date] VARCHAR(50) NULL
	);
	PRINT 'Table [vehicles] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [vehicles] already exists';
END;

-- Verify Pets Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'pets')
BEGIN
	CREATE TABLE [pets] (
		[id] INT PRIMARY KEY IDENTITY(1,1),
		[type] VARCHAR(50) NULL,
		[breed] VARCHAR(100) NULL,
		[name] VARCHAR(100) NULL,
		[color] VARCHAR(100) NULL,
		[age] INT NULL,
		[gender] VARCHAR(20) NULL,
		[vaccinated] VARCHAR(20) NULL,
		[microchip] VARCHAR(20) NULL,
		[neutered] VARCHAR(20) NULL,
		[temperament] VARCHAR(100) NULL,
		[notes] NVARCHAR(MAX) NULL,
		[photo] NVARCHAR(MAX) NULL,
		[owner_name] VARCHAR(200) NULL,
		[registered_date] VARCHAR(50) NULL
	);
	PRINT 'Table [pets] created successfully';
END
ELSE
BEGIN
	PRINT 'Table [pets] already exists';
END;

-- ============================================================================
-- SECTION 3: SAMPLE DATA FOR STAFF DASHBOARD
-- ============================================================================

-- Insert sample tasks if table is empty
IF NOT EXISTS (SELECT 1 FROM [tasks])
BEGIN
	INSERT INTO [tasks] ([title], [description], [category], [priority], [status], [due_date], [assigned_to])
	VALUES 
		('Update emergency contact list for Phase 3', 'Compile and verify all emergency contacts', 'Admin', 'high', 'todo', DATEADD(DAY, 7, CAST(GETUTCDATE() AS DATE)), 'Staff Officer'),
		('Prepare March BOD meeting agenda', 'Coordinate with BOD for monthly meeting items', 'Admin', 'medium', 'todo', DATEADD(DAY, 3, CAST(GETUTCDATE() AS DATE)), 'Staff Officer'),
		('Schedule annual park equipment inspection', 'Contact vendors and schedule maintenance', 'Maintenance', 'medium', 'in-progress', DATEADD(DAY, 10, CAST(GETUTCDATE() AS DATE)), 'Maintenance Staff'),
		('Post February community newsletter', 'Collect articles and publish monthly newsletter', 'Communications', 'low', 'in-progress', DATEADD(DAY, 2, CAST(GETUTCDATE() AS DATE)), 'Communications'),
		('Q1 dues follow-up — 18 households', 'Send reminders and collect outstanding dues', 'Finance', 'high', 'in-progress', DATEADD(DAY, 5, CAST(GETUTCDATE() AS DATE)), 'Finance Staff'),
		('Repaint perimeter fence — Block C', 'Arrange for painting contractor', 'Maintenance', 'medium', 'progress', DATEADD(DAY, 15, CAST(GETUTCDATE() AS DATE)), 'Maintenance Staff');
	PRINT 'Sample tasks inserted';
END
ELSE
BEGIN
	PRINT 'Tasks table already populated';
END;

-- Insert sample announcements if table is empty
IF NOT EXISTS (SELECT 1 FROM [announcements])
BEGIN
	INSERT INTO [announcements] ([title], [body], [category], [posted_by], [status])
	VALUES 
		('Water System Maintenance — March 5', 'Scheduled water system maintenance on March 5, 2026 from 6 AM to 12 PM. Please store water accordingly.', 'Urgent', 'Admin', 'published'),
		('BOD Meeting — March 1, 2026', 'Monthly Board of Directors meeting scheduled for March 1 at 6 PM in the Function Room. All residents welcome.', 'Governance', 'Admin', 'published'),
		('Community Clean-up Drive — February 25', 'Join us for our monthly community clean-up. Meet at the main gate at 7 AM. Bring gloves and water bottles.', 'Community', 'Staff', 'published');
	PRINT 'Sample announcements inserted';
END
ELSE
BEGIN
	PRINT 'Announcements table already populated';
END;

-- Insert sample events if table is empty
IF NOT EXISTS (SELECT 1 FROM [hoa_events])
BEGIN
	INSERT INTO [hoa_events] ([title], [description], [date], [time], [location], [category], [created_by])
	VALUES 
		('BOD Gate Pass Policy Review', 'Quarterly review of gate pass policies and procedures', '2026-02-19', '10:00', 'Admin Office', 'Governance', 'Admin'),
		('Community Clean-up Drive', 'Monthly community maintenance activity', '2026-02-25', '07:00', 'All Blocks', 'Community', 'Staff Officer'),
		('Monthly BOD Meeting', 'Regular Board meeting to discuss HOA matters', '2026-03-01', '18:00', 'Function Room', 'Governance', 'Admin');
	PRINT 'Sample events inserted';
END
ELSE
BEGIN
	PRINT 'Events table already populated';
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
	PRINT 'Sample keywords inserted';
END
ELSE
BEGIN
	PRINT 'Keywords table already populated';
END;

-- ============================================================================
-- SECTION 4: CREATE VIEWS FOR STAFF DASHBOARD (OPTIONAL)
-- ============================================================================

-- View for open incidents
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_NAME = 'v_open_incidents')
BEGIN
	CREATE VIEW [v_open_incidents] AS
	SELECT 
		[id],
		[reference],
		[description],
		[category],
		[priority],
		[status],
		[reporter_name],
		[timestamp],
		[street],
		[detected_keywords]
	FROM [concern_reports]
	WHERE [status] != 'resolved'
	ORDER BY 
		CASE [priority] WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
		[timestamp] DESC;
	PRINT 'View [v_open_incidents] created';
END;

-- View for pending reservations
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_NAME = 'v_pending_reservations')
BEGIN
	CREATE VIEW [v_pending_reservations] AS
	SELECT 
		[id],
		[resident_name],
		[amenity],
		[date],
		[start_time],
		[end_time],
		[purpose],
		[status],
		[submitted_at]
	FROM [reservations]
	WHERE [status] = 'pending'
	ORDER BY [submitted_at] DESC;
	PRINT 'View [v_pending_reservations] created';
END;

-- View for pending approvals (ads & registrations)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_NAME = 'v_pending_approvals')
BEGIN
	CREATE VIEW [v_pending_approvals] AS
	SELECT 
		'Advertisement' AS [type],
		[id],
		[title] AS [name],
		[author],
		[created_at] AS [submitted_at],
		[status]
	FROM [advertisements]
	WHERE [status] = 'pending'
	UNION ALL
	SELECT 
		'Registration' AS [type],
		[id],
		[full_name] AS [name],
		[email] AS [author],
		[submitted_at],
		[status]
	FROM [registrations]
	WHERE [status] = 'pending'
	ORDER BY [submitted_at] DESC;
	PRINT 'View [v_pending_approvals] created';
END;

-- ============================================================================
-- SECTION 5: SUMMARY & VERIFICATION
-- ============================================================================

PRINT '
============================================================================
STAFF DASHBOARD DATABASE SETUP COMPLETE
============================================================================

Tables Created/Verified:
✓ tasks - Task management and kanban board
✓ announcements - Community announcements
✓ hoa_events - Events and calendar
✓ bod_members - Board of Directors members
✓ meeting_records - Meeting documentation
✓ hoa_documents - Forms and documents
✓ contacts - Contact directory
✓ reservations - Amenity reservations
✓ concern_reports - Incident reporting
✓ keyword_dictionary - Keyword analysis
✓ advertisements - Community exchange
✓ registrations - Resident registration
✓ posts - Forum posts
✓ replies - Forum replies
✓ vehicles - Vehicle tracking
✓ pets - Pet registry

Views Created:
✓ v_open_incidents - Open incident reports
✓ v_pending_reservations - Pending reservations
✓ v_pending_approvals - Pending ads & registrations

Sample Data Inserted:
✓ 6 sample tasks
✓ 3 sample announcements
✓ 3 sample events
✓ 26 keyword entries

All staff dashboard tables are ready for use!

To verify table creation, run:
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = ''dbo'' 
ORDER BY TABLE_NAME;

============================================================================
';

-- Quick verification query
SELECT 
	TABLE_NAME,
	'Staff Dashboard' AS Category
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME IN (
	'tasks', 'announcements', 'hoa_events', 'bod_members', 'meeting_records',
	'hoa_documents', 'contacts', 'reservations', 'concern_reports', 
	'keyword_dictionary', 'advertisements', 'registrations', 'posts', 'replies',
	'vehicles', 'pets'
)
ORDER BY TABLE_NAME;
