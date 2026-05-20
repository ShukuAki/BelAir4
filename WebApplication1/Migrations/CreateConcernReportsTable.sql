-- SQL Script to create the concern_reports table
-- Run this on your SqBelAir4 database

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='concern_reports' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[concern_reports] (
        [id] INT PRIMARY KEY IDENTITY(1,1),
        [description] NVARCHAR(MAX),
        [category] VARCHAR(100),
        [address] VARCHAR(200),
        [street] VARCHAR(200),
        [additional_location] VARCHAR(500),
        [latitude] FLOAT,
        [longitude] FLOAT,
        [anonymous] BIT NOT NULL DEFAULT 0,
        [reporter_name] VARCHAR(200),
        [reporter_contact] VARCHAR(200),
        [photo] NVARCHAR(MAX),
        [timestamp] DATETIME NOT NULL DEFAULT GETUTCDATE(),
        [reference] VARCHAR(50) UNIQUE
    )
    
    CREATE NONCLUSTERED INDEX [IX_concern_reports_timestamp] 
    ON [dbo].[concern_reports] ([timestamp] DESC)
    
    CREATE NONCLUSTERED INDEX [IX_concern_reports_reference] 
    ON [dbo].[concern_reports] ([reference])
    
    PRINT 'concern_reports table created successfully'
END
ELSE
BEGIN
    PRINT 'concern_reports table already exists'
END
