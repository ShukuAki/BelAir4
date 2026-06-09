-- Add missing columns to Posts table
-- Run this script directly against your database to fix the SQL exception

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Posts') AND name = 'Priority')
BEGIN
    ALTER TABLE Posts ADD Priority NVARCHAR(50) NULL DEFAULT 'medium';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Posts') AND name = 'DetectedKeywords')
BEGIN
    ALTER TABLE Posts ADD DetectedKeywords NVARCHAR(MAX) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Posts') AND name = 'IsPublic')
BEGIN
    ALTER TABLE Posts ADD IsPublic BIT NOT NULL DEFAULT 1;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Posts') AND name = 'CreatedAt')
BEGIN
    ALTER TABLE Posts ADD CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE();
END

-- Create registrations table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'registrations')
BEGIN
    CREATE TABLE registrations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(100) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        password NVARCHAR(MAX) NOT NULL,
        resident_type VARCHAR(20) NOT NULL,
        address VARCHAR(500) NOT NULL,
        proof_of_residency_path NVARCHAR(MAX) NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        submitted_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        reviewed_at DATETIME2 NULL,
        reviewed_by VARCHAR(100) NULL,
        rejection_reason NVARCHAR(MAX) NULL
    );
END

-- Create reservations table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'reservations')
BEGIN
    CREATE TABLE reservations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id VARCHAR(100) NULL,
        resident_name VARCHAR(200) NULL,
        amenity VARCHAR(100) NOT NULL,
        date VARCHAR(20) NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        purpose VARCHAR(100) NULL,
        notes NVARCHAR(MAX) NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        submitted_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        reviewed_at DATETIME2 NULL,
        reviewed_by VARCHAR(100) NULL,
        rejection_reason NVARCHAR(MAX) NULL
    );
END
