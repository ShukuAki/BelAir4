using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public class AdminRole
{
    public int Id { get; set; }

    public string Name { get; set; } = null!; // e.g., "Admin", "Staff", "Security Officer"

    public string Description { get; set; } = null!;

    public bool IsProtected { get; set; } = false; // Admin role cannot be edited/deleted

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<AdminUser> Users { get; set; } = new List<AdminUser>();

    public ICollection<RolePermission> Permissions { get; set; } = new List<RolePermission>();
}

public class Permission
{
    public int Id { get; set; }

    public string Module { get; set; } = null!; // e.g., "Staff Management", "Residents", "Settings"

    public string Resource { get; set; } = null!; // e.g., "Staff Accounts", "Roles", "App Settings"

    public string Action { get; set; } = null!; // e.g., "View", "Create", "Edit", "Delete"

    public string PermissionKey { get; set; } = null!; // Unique key like "staff.create" or "residents.delete"

    public string Description { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class RolePermission
{
    public int Id { get; set; }

    public int RoleId { get; set; }

    public AdminRole? Role { get; set; }

    public int PermissionId { get; set; }

    public Permission? Permission { get; set; }

    public string AccessLevel { get; set; } = "Full"; // Full, View, None

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}
