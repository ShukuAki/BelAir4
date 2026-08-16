-- ============================================================================
-- Laguna BelAir 4 - Admin Dashboard Database Setup Script
-- SQL Server Script for Entity Framework Core Admin Entities
-- ============================================================================

-- Create Admin Roles Table
CREATE TABLE [admin_roles] (
	[id] INT PRIMARY KEY IDENTITY(1,1),
	[name] VARCHAR(100) NOT NULL,
	[description] VARCHAR(500) NOT NULL,
	[is_protected] BIT NOT NULL DEFAULT 0,
	[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[updated_at] DATETIME2 NULL
);

-- Create Permissions Table
CREATE TABLE [permissions] (
	[id] INT PRIMARY KEY IDENTITY(1,1),
	[module] VARCHAR(100) NOT NULL,
	[resource] VARCHAR(100) NOT NULL,
	[action] VARCHAR(50) NOT NULL,
	[permission_key] VARCHAR(100) NOT NULL UNIQUE,
	[description] VARCHAR(500) NOT NULL,
	[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create Role Permissions Table (Junction)
CREATE TABLE [role_permissions] (
	[id] INT PRIMARY KEY IDENTITY(1,1),
	[role_id] INT NOT NULL,
	[permission_id] INT NOT NULL,
	[access_level] VARCHAR(20) NOT NULL DEFAULT 'Full',
	[assigned_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	CONSTRAINT [FK_RolePermissions_AdminRoles_RoleId] FOREIGN KEY ([role_id]) REFERENCES [admin_roles]([id]) ON DELETE CASCADE,
	CONSTRAINT [FK_RolePermissions_Permissions_PermissionId] FOREIGN KEY ([permission_id]) REFERENCES [permissions]([id]) ON DELETE CASCADE,
	CONSTRAINT [UX_RolePermissions_RoleId_PermissionId] UNIQUE ([role_id], [permission_id])
);

-- Create Admin Users Table
CREATE TABLE [admin_users] (
	[id] INT PRIMARY KEY IDENTITY(1,1),
	[name] VARCHAR(200) NOT NULL,
	[email] VARCHAR(200) NOT NULL UNIQUE,
	[phone_number] VARCHAR(20) NULL,
	[role_id] INT NOT NULL,
	[is_active] BIT NOT NULL DEFAULT 1,
	[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[last_login_at] DATETIME2 NULL,
	[ip_address] VARCHAR(50) NULL,
	[status] VARCHAR(20) NOT NULL DEFAULT 'Active',
	[is_suspended] BIT NOT NULL DEFAULT 0,
	[suspended_until] DATETIME2 NULL,
	[suspension_reason] VARCHAR(500) NULL,
	CONSTRAINT [FK_AdminUsers_AdminRoles_RoleId] FOREIGN KEY ([role_id]) REFERENCES [admin_roles]([id])
);

-- Create Audit Logs Table
CREATE TABLE [audit_logs] (
	[id] INT PRIMARY KEY IDENTITY(1,1),
	[admin_user_id] INT NOT NULL,
	[action] VARCHAR(500) NOT NULL,
	[action_category] VARCHAR(50) NOT NULL,
	[target_entity] VARCHAR(100) NOT NULL,
	[target_entity_id] VARCHAR(50) NOT NULL,
	[old_value] NVARCHAR(MAX) NULL,
	[new_value] NVARCHAR(MAX) NULL,
	[timestamp] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[ip_address] VARCHAR(50) NOT NULL,
	[user_agent] VARCHAR(500) NULL,
	[outcome] VARCHAR(20) NOT NULL DEFAULT 'Success',
	[notes] VARCHAR(500) NULL,
	[created_date] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[month] INT NULL,
	[year] INT NULL,
	CONSTRAINT [FK_AuditLogs_AdminUsers_AdminUserId] FOREIGN KEY ([admin_user_id]) REFERENCES [admin_users]([id]) ON DELETE CASCADE,
	INDEX [IX_AuditLogs_Timestamp] ([timestamp]),
	INDEX [IX_AuditLogs_YearMonth] ([year], [month])
);

-- Create Admin Settings Table
CREATE TABLE [admin_settings] (
	[id] INT PRIMARY KEY IDENTITY(1,1),
	[setting_key] VARCHAR(100) NOT NULL UNIQUE,
	[setting_value] NVARCHAR(MAX) NOT NULL,
	[setting_type] VARCHAR(20) NOT NULL DEFAULT 'String',
	[category] VARCHAR(50) NOT NULL DEFAULT 'General',
	[description] VARCHAR(500) NOT NULL,
	[is_editable] BIT NOT NULL DEFAULT 1,
	[is_active] BIT NOT NULL DEFAULT 1,
	[display_order] INT NULL,
	[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[updated_at] DATETIME2 NULL,
	[updated_by_admin_user_id] INT NULL,
	INDEX [UX_AdminSettings_SettingKey] ([setting_key])
);

-- Create Staff Invitations Table
CREATE TABLE [staff_invitations] (
	[id] INT PRIMARY KEY IDENTITY(1,1),
	[full_name] VARCHAR(200) NOT NULL,
	[email_address] VARCHAR(200) NOT NULL,
	[role_id] INT NOT NULL,
	[invited_by_admin_user_id] INT NOT NULL,
	[invitation_token] VARCHAR(500) NOT NULL,
	[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[expires_at] DATETIME2 NOT NULL,
	[accepted_at] DATETIME2 NULL,
	[rejected_at] DATETIME2 NULL,
	[status] VARCHAR(20) NOT NULL DEFAULT 'Pending',
	[personal_message] NVARCHAR(MAX) NULL,
	[resend_count] INT NOT NULL DEFAULT 0,
	[last_resend_at] DATETIME2 NULL,
	CONSTRAINT [FK_StaffInvitations_AdminRoles] FOREIGN KEY ([role_id]) REFERENCES [admin_roles]([id]),
	CONSTRAINT [FK_StaffInvitations_AdminUsers_InvitedBy] FOREIGN KEY ([invited_by_admin_user_id]) REFERENCES [admin_users]([id])
);

-- Create Ban Records Table
CREATE TABLE [ban_records] (
	[id] INT PRIMARY KEY IDENTITY(1,1),
	[account_name] VARCHAR(200) NOT NULL,
	[email] VARCHAR(200) NOT NULL,
	[resident_id] INT NULL,
	[ban_reason] VARCHAR(500) NOT NULL,
	[banned_by_admin_user_id] INT NOT NULL,
	[banned_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[unbanned_at] DATETIME2 NULL,
	[duration] VARCHAR(50) NOT NULL DEFAULT 'Permanent',
	[expires_at] DATETIME2 NULL,
	[status] VARCHAR(20) NOT NULL DEFAULT 'Active',
	[unban_reason] VARCHAR(500) NULL,
	[unbanned_by_admin_user_id] INT NULL,
	CONSTRAINT [FK_BanRecords_AdminUsers_BannedBy] FOREIGN KEY ([banned_by_admin_user_id]) REFERENCES [admin_users]([id]),
	CONSTRAINT [FK_BanRecords_AdminUsers_UnbannedBy] FOREIGN KEY ([unbanned_by_admin_user_id]) REFERENCES [admin_users]([id])
);

-- Create Backup Records Table
CREATE TABLE [backup_records] (
	[id] INT PRIMARY KEY IDENTITY(1,1),
	[backup_id] VARCHAR(50) NOT NULL UNIQUE,
	[backup_type] VARCHAR(20) NOT NULL DEFAULT 'Auto',
	[created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[file_path] VARCHAR(500) NOT NULL,
	[file_size_bytes] BIGINT NOT NULL,
	[status] VARCHAR(20) NOT NULL DEFAULT 'Success',
	[created_by_admin_user_id] INT NULL,
	[error_message] VARCHAR(500) NULL,
	[completed_at] DATETIME2 NULL,
	[restored_at] DATETIME2 NULL,
	[restored_by_admin_user_id] INT NULL,
	[restore_notes] VARCHAR(500) NULL,
	[checksum] VARCHAR(100) NULL,
	CONSTRAINT [FK_BackupRecords_AdminUsers_CreatedBy] FOREIGN KEY ([created_by_admin_user_id]) REFERENCES [admin_users]([id]),
	INDEX [UX_BackupRecords_BackupId] ([backup_id])
);

-- ============================================================================
-- SEED DATA - Initial Admin Roles
-- ============================================================================

-- Insert default roles
INSERT INTO [admin_roles] ([name], [description], [is_protected], [created_at])
VALUES 
	('Admin', 'Full system access — protected', 1, GETUTCDATE()),
	('Staff', 'Operational access — day-to-day tasks', 0, GETUTCDATE());

-- ============================================================================
-- SEED DATA - Permissions
-- ============================================================================

-- Staff Management Permissions
INSERT INTO [permissions] ([module], [resource], [action], [permission_key], [description], [created_at])
VALUES 
	('Staff Management', 'Staff Accounts', 'View', 'staff.view', 'View staff accounts', GETUTCDATE()),
	('Staff Management', 'Staff Accounts', 'Create', 'staff.create', 'Create new staff account', GETUTCDATE()),
	('Staff Management', 'Staff Accounts', 'Edit', 'staff.edit', 'Edit staff account details', GETUTCDATE()),
	('Staff Management', 'Staff Accounts', 'Delete', 'staff.delete', 'Delete staff account', GETUTCDATE());

-- Audit Log Permissions
INSERT INTO [permissions] ([module], [resource], [action], [permission_key], [description], [created_at])
VALUES 
	('Audit Log', 'Audit Log', 'View', 'audit.view', 'View audit log', GETUTCDATE()),
	('Audit Log', 'Audit Log', 'Export', 'audit.export', 'Export audit log', GETUTCDATE());

-- Roles & Permissions
INSERT INTO [permissions] ([module], [resource], [action], [permission_key], [description], [created_at])
VALUES 
	('Roles & Permissions', 'Roles', 'View', 'roles.view', 'View roles', GETUTCDATE()),
	('Roles & Permissions', 'Roles', 'Create', 'roles.create', 'Create new role', GETUTCDATE()),
	('Roles & Permissions', 'Roles', 'Edit', 'roles.edit', 'Edit role', GETUTCDATE()),
	('Roles & Permissions', 'Roles', 'Delete', 'roles.delete', 'Delete role', GETUTCDATE()),
	('Roles & Permissions', 'Permissions', 'View', 'permissions.view', 'View permissions', GETUTCDATE()),
	('Roles & Permissions', 'Permissions', 'Assign', 'permissions.assign', 'Assign permissions to roles', GETUTCDATE());

-- Residents Management
INSERT INTO [permissions] ([module], [resource], [action], [permission_key], [description], [created_at])
VALUES 
	('Resident Management', 'Residents', 'View', 'residents.view', 'View residents', GETUTCDATE()),
	('Resident Management', 'Residents', 'Create', 'residents.create', 'Create resident', GETUTCDATE()),
	('Resident Management', 'Residents', 'Edit', 'residents.edit', 'Edit resident', GETUTCDATE()),
	('Resident Management', 'Residents', 'Delete', 'residents.delete', 'Delete resident', GETUTCDATE()),
	('Resident Management', 'Banned Users', 'View', 'banned.view', 'View banned users', GETUTCDATE()),
	('Resident Management', 'Banned Users', 'Ban', 'banned.ban', 'Ban user', GETUTCDATE()),
	('Resident Management', 'Banned Users', 'Unban', 'banned.unban', 'Unban user', GETUTCDATE());

-- Settings Management
INSERT INTO [permissions] ([module], [resource], [action], [permission_key], [description], [created_at])
VALUES 
	('Settings', 'App Settings', 'View', 'settings.view', 'View app settings', GETUTCDATE()),
	('Settings', 'App Settings', 'Edit', 'settings.edit', 'Edit app settings', GETUTCDATE()),
	('Settings', 'Word Bank', 'View', 'wordbank.view', 'View word bank', GETUTCDATE()),
	('Settings', 'Word Bank', 'Manage', 'wordbank.manage', 'Manage keywords', GETUTCDATE());

-- Data Management
INSERT INTO [permissions] ([module], [resource], [action], [permission_key], [description], [created_at])
VALUES 
	('Data Management', 'Data Export', 'Export', 'export.data', 'Export data', GETUTCDATE()),
	('Data Management', 'Backups', 'View', 'backup.view', 'View backups', GETUTCDATE()),
	('Data Management', 'Backups', 'Create', 'backup.create', 'Create backup', GETUTCDATE()),
	('Data Management', 'Backups', 'Restore', 'backup.restore', 'Restore backup', GETUTCDATE());

-- ============================================================================
-- SEED DATA - Assign All Permissions to Admin Role
-- ============================================================================

INSERT INTO [role_permissions] ([role_id], [permission_id], [access_level], [assigned_at])
SELECT 1, [id], 'Full', GETUTCDATE() FROM [permissions];

-- Assign limited permissions to Staff role
INSERT INTO [role_permissions] ([role_id], [permission_id], [access_level], [assigned_at])
SELECT 2, [id], 'View', GETUTCDATE() FROM [permissions] WHERE [permission_key] IN (
	'staff.view', 'audit.view', 'roles.view', 'permissions.view', 
	'residents.view', 'banned.view', 'settings.view', 'wordbank.view', 'backup.view'
);

-- ============================================================================
-- SEED DATA - Initial Admin Settings
-- ============================================================================

INSERT INTO [admin_settings] ([setting_key], [setting_value], [setting_type], [category], [description], [is_editable], [is_active], [display_order], [created_at])
VALUES 
	('village.name', 'Laguna BelAir 4', 'String', 'General', 'Village name', 1, 1, 1, GETUTCDATE()),
	('hoa.email', 'lba4hoa@email.com', 'String', 'General', 'HOA Email', 1, 1, 2, GETUTCDATE()),
	('hoa.phone', '0495603050', 'String', 'General', 'HOA Phone', 1, 1, 3, GETUTCDATE()),
	('ad.fee', '150', 'Decimal', 'General', 'Advertisement listing fee in PHP', 1, 1, 4, GETUTCDATE()),
	('dues.rate', '200', 'Decimal', 'General', 'Monthly dues rate in PHP', 1, 1, 5, GETUTCDATE()),
	('verification.mode', 'Manual Review (Default)', 'String', 'General', 'Resident verification mode', 1, 1, 6, GETUTCDATE()),
	('forum.enabled', 'true', 'Bool', 'Features', 'Forum feature enabled', 1, 1, 1, GETUTCDATE()),
	('marketplace.enabled', 'true', 'Bool', 'Features', 'Marketplace/Ads feature enabled', 1, 1, 2, GETUTCDATE()),
	('incident.enabled', 'true', 'Bool', 'Features', 'Incident reports feature enabled', 1, 1, 3, GETUTCDATE()),
	('amenity.enabled', 'true', 'Bool', 'Features', 'Amenity reservations feature enabled', 1, 1, 4, GETUTCDATE()),
	('notifications.enabled', 'true', 'Bool', 'Features', 'Push notifications feature enabled', 1, 1, 5, GETUTCDATE()),
	('maintenance.mode', 'false', 'Bool', 'Features', 'Maintenance mode enabled', 1, 1, 6, GETUTCDATE()),
	('twofa.required', 'true', 'Bool', 'Security', 'Two-factor auth required for staff', 1, 1, 1, GETUTCDATE());

-- ============================================================================
-- Summary
-- ============================================================================
-- Database tables created:
-- 1. admin_roles - Admin role definitions
-- 2. permissions - System permissions
-- 3. role_permissions - Role-permission assignments
-- 4. admin_users - Admin staff accounts
-- 5. audit_logs - System action audit trail
-- 6. admin_settings - Application configuration
-- 7. staff_invitations - Pending staff invitations
-- 8. ban_records - User ban history
-- 9. backup_records - Database backup history
--
-- Initial Data Seeded:
-- - 2 default roles (Admin, Staff)
-- - 20+ system permissions
-- - Role permission assignments
-- - 13 application settings
-- ============================================================================
