-- ============================================================
-- Landmarks table setup for the Community Map feature
-- Matches the EF Core entity configuration in SqBelAir4Context
-- (table "landmarks", snake_case columns).
-- Safe to run multiple times.
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'landmarks')
BEGIN
	CREATE TABLE dbo.landmarks
	(
		id              INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_landmarks PRIMARY KEY,
		name            VARCHAR(200)  NOT NULL,
		description     NVARCHAR(MAX) NULL,
		category        VARCHAR(100)  NULL,
		icon            VARCHAR(100)  NULL,
		latitude        DECIMAL(10,8) NOT NULL DEFAULT (0),
		longitude       DECIMAL(11,8) NOT NULL DEFAULT (0),
		location_notes  VARCHAR(500)  NULL,
		is_active       BIT           NOT NULL CONSTRAINT DF_landmarks_is_active DEFAULT (1),
		created_at      DATETIME2     NOT NULL CONSTRAINT DF_landmarks_created_at DEFAULT (GETUTCDATE()),
		updated_at      DATETIME2     NOT NULL CONSTRAINT DF_landmarks_updated_at DEFAULT (GETUTCDATE())
	);
END
GO

-- Optional seed data (only when the table is empty)
IF NOT EXISTS (SELECT 1 FROM dbo.landmarks)
BEGIN
	INSERT INTO dbo.landmarks (name, description, category, icon, latitude, longitude, location_notes, is_active)
	VALUES
		('HOA Office',        'Main administration office',       'Building',  'fa-building',          14.30000000, 121.10000000, 'Near the main gate', 1),
		('Basketball Court',  'Community basketball court',       'Court',     'fa-basketball-ball',   14.30100000, 121.10100000, NULL,                 1),
		('Main Gate',         'Primary entrance and security',    'Gate',      'fa-door-open',         14.29900000, 121.09900000, '24/7 security',      1),
		('Clubhouse',         'Community clubhouse and function hall', 'Facility', 'fa-house-user',    14.30050000, 121.10050000, NULL,                 1);
END
GO
