-- Migration: incident resolution fields + registration first/last name split
-- Safe to run multiple times (guards with IF NOT EXISTS).

-- ── Incident (concern_reports) resolution + staff comment ──
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('concern_reports') AND name = 'status')
BEGIN
    ALTER TABLE concern_reports ADD status VARCHAR(20) NOT NULL DEFAULT 'open';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('concern_reports') AND name = 'staff_comment')
BEGIN
    ALTER TABLE concern_reports ADD staff_comment NVARCHAR(MAX) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('concern_reports') AND name = 'resolved_by')
BEGIN
    ALTER TABLE concern_reports ADD resolved_by VARCHAR(200) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('concern_reports') AND name = 'resolved_at')
BEGIN
    ALTER TABLE concern_reports ADD resolved_at DATETIME2 NULL;
END

-- ── Registration first/last name split ──
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('registrations') AND name = 'first_name')
BEGIN
    ALTER TABLE registrations ADD first_name VARCHAR(100) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('registrations') AND name = 'last_name')
BEGIN
    ALTER TABLE registrations ADD last_name VARCHAR(100) NULL;
END

-- ── Forum moderation: ban / timeout on user accounts ──
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('userAccounts') AND name = 'is_banned')
BEGIN
    ALTER TABLE userAccounts ADD is_banned BIT NOT NULL DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('userAccounts') AND name = 'banned_until')
BEGIN
    ALTER TABLE userAccounts ADD banned_until DATETIME2 NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('userAccounts') AND name = 'ban_reason')
BEGIN
    ALTER TABLE userAccounts ADD ban_reason VARCHAR(500) NULL;
END

-- Backfill first_name / last_name from existing full_name where empty
-- Only run if both columns exist (use dynamic SQL to avoid parser errors)
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('registrations') AND name = 'first_name')
  AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('registrations') AND name = 'last_name')
BEGIN
    EXEC sp_executesql N'
        UPDATE registrations
        SET
            first_name = CASE
                WHEN CHARINDEX('' '', LTRIM(RTRIM(full_name))) > 0
                    THEN LEFT(LTRIM(RTRIM(full_name)), CHARINDEX('' '', LTRIM(RTRIM(full_name))) - 1)
                ELSE LTRIM(RTRIM(full_name))
            END,
            last_name = CASE
                WHEN CHARINDEX('' '', LTRIM(RTRIM(full_name))) > 0
                    THEN LTRIM(SUBSTRING(LTRIM(RTRIM(full_name)), CHARINDEX('' '', LTRIM(RTRIM(full_name))) + 1, 200))
                ELSE ''''
            END
        WHERE (first_name IS NULL OR first_name = '''') AND full_name IS NOT NULL';
END
