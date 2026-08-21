using WebApplication1.Models;
using WebApplication1.Repository;
using System;
using System.Collections.Generic;
using System.Linq;

namespace WebApplication1.Services
{
    public static class PermissionSeeder
    {
        public static async System.Threading.Tasks.Task SeedPermissionsAsync(IRepo repo)
        {
            var existingPermissions = await repo.GetPermissionsAsync();
            if (existingPermissions.Any())
            {
                return; // Already seeded
            }

            var permissions = new List<Permission>
            {
                // Staff Management
                new Permission { Module = "Staff", Resource = "Users", Action = "View", PermissionKey = "staff.view" },
                new Permission { Module = "Staff", Resource = "Users", Action = "Create", PermissionKey = "staff.create" },
                new Permission { Module = "Staff", Resource = "Users", Action = "Edit", PermissionKey = "staff.edit" },
                new Permission { Module = "Staff", Resource = "Users", Action = "Delete", PermissionKey = "staff.delete" },
                new Permission { Module = "Staff", Resource = "Users", Action = "Manage", PermissionKey = "staff.manage" },

                // Roles & Permissions
                new Permission { Module = "Roles", Resource = "Roles", Action = "View", PermissionKey = "roles.view" },
                new Permission { Module = "Roles", Resource = "Roles", Action = "Create", PermissionKey = "roles.create" },
                new Permission { Module = "Roles", Resource = "Roles", Action = "Edit", PermissionKey = "roles.edit" },
                new Permission { Module = "Roles", Resource = "Roles", Action = "Delete", PermissionKey = "roles.delete" },
                new Permission { Module = "Roles", Resource = "Permissions", Action = "Assign", PermissionKey = "roles.assign" },
                new Permission { Module = "Roles", Resource = "Permissions", Action = "Revoke", PermissionKey = "roles.revoke" },

                // Audit Log
                new Permission { Module = "Audit", Resource = "Logs", Action = "View", PermissionKey = "audit.view" },
                new Permission { Module = "Audit", Resource = "Logs", Action = "Export", PermissionKey = "audit.export" },

                // Residents Management
                new Permission { Module = "Residents", Resource = "Accounts", Action = "View", PermissionKey = "residents.view" },
                new Permission { Module = "Residents", Resource = "Accounts", Action = "Ban", PermissionKey = "residents.ban" },
                new Permission { Module = "Residents", Resource = "Accounts", Action = "Unban", PermissionKey = "residents.unban" },
                new Permission { Module = "Residents", Resource = "Accounts", Action = "Manage", PermissionKey = "residents.manage" },

                // Settings
                new Permission { Module = "Settings", Resource = "Config", Action = "View", PermissionKey = "settings.view" },
                new Permission { Module = "Settings", Resource = "Config", Action = "Edit", PermissionKey = "settings.edit" },

                // Backups
                new Permission { Module = "Backups", Resource = "Database", Action = "View", PermissionKey = "backups.view" },
                new Permission { Module = "Backups", Resource = "Database", Action = "Create", PermissionKey = "backups.create" },
                new Permission { Module = "Backups", Resource = "Database", Action = "Restore", PermissionKey = "backups.restore" },

                // Content Management
                new Permission { Module = "Content", Resource = "Announcements", Action = "Manage", PermissionKey = "content.announcements" },
                new Permission { Module = "Content", Resource = "Events", Action = "Manage", PermissionKey = "content.events" },
                new Permission { Module = "Content", Resource = "Documents", Action = "Manage", PermissionKey = "content.documents" },
                new Permission { Module = "Content", Resource = "Keywords", Action = "Manage", PermissionKey = "content.keywords" },

                // Integrations
                new Permission { Module = "Integrations", Resource = "Services", Action = "View", PermissionKey = "integrations.view" },
                new Permission { Module = "Integrations", Resource = "Services", Action = "Configure", PermissionKey = "integrations.configure" },

                // Data Export
                new Permission { Module = "Data", Resource = "Export", Action = "Execute", PermissionKey = "data.export" },
            };

            foreach (var permission in permissions)
            {
                await repo.CreatePermissionAsync(permission);
            }
        }

        public static async System.Threading.Tasks.Task AssignDefaultPermissionsToSuperAdminAsync(IRepo repo)
        {
            var roles = await repo.GetAdminRolesAsync();
            var superAdminRole = roles.FirstOrDefault(r => r.IsProtected == true);

            if (superAdminRole == null)
            {
                return; // No super admin role found
            }

            var permissions = await repo.GetPermissionsAsync();
            var existingRolePermissions = await repo.GetRolePermissionsAsync(superAdminRole.Id);

            foreach (var permission in permissions)
            {
                if (!existingRolePermissions.Any(rp => rp.PermissionId == permission.Id))
                {
                    await repo.AssignPermissionToRoleAsync(new RolePermission
                    {
                        RoleId = superAdminRole.Id,
                        PermissionId = permission.Id,
                        AccessLevel = "Full"
                    });
                }
            }
        }
    }
}
