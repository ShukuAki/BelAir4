using Microsoft.AspNetCore.Mvc;
using WebApplication1.Repository;
using WebApplication1.Models;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [WebApplication1.Filters.UserTypeAuthorize(3)] // Admin only
    public class AdminController : ControllerBase
    {
        private readonly IRepo _repo;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IRepo repo, ILogger<AdminController> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        private string GetClientIpAddress()
        {
            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        #region Staff Management

        [HttpGet("staff")]
        public async Task<IActionResult> GetStaff()
        {
            try
            {
                var staff = await _repo.GetAdminUsersAsync();

                // Project to DTOs to avoid circular reference
                var staffDtos = staff.Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Email,
                    s.PhoneNumber,
                    s.RoleId,
                    RoleName = s.Role?.Name,
                    s.IsActive,
                    s.CreatedAt,
                    s.LastLoginAt,
                    s.IPAddress,
                    s.Status,
                    s.IsSuspended,
                    s.SuspendedUntil,
                    s.SuspensionReason
                }).ToList();

                return Ok(staffDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching staff");
                return BadRequest(new { error = "Failed to fetch staff" });
            }
        }

        [HttpGet("staff/{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            try
            {
                var staff = await _repo.GetAdminUserByIdAsync(id);
                if (staff is null)
                    return NotFound(new { error = "Staff not found" });
                return Ok(staff);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching staff");
                return BadRequest();
            }
        }

        [HttpPost("staff")]
        public async Task<IActionResult> CreateStaff([FromBody] AdminUser adminUser)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var created = await _repo.CreateAdminUserAsync(adminUser);
                return CreatedAtAction(nameof(GetStaffById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating staff");
                return BadRequest(new { error = "Failed to create staff" });
            }
        }

        [HttpPut("staff/{id}")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] AdminUser adminUser)
        {
            try
            {
                adminUser.Id = id;
                var success = await _repo.UpdateAdminUserAsync(adminUser);
                if (!success)
                    return NotFound();
                return Ok(new { message = "Staff updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating staff");
                return BadRequest();
            }
        }

        [HttpDelete("staff/{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            try
            {
                var success = await _repo.DeleteAdminUserAsync(id);
                if (!success)
                    return NotFound();
                return Ok(new { message = "Staff deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting staff");
                return BadRequest();
            }
        }

        #endregion

        #region Audit Log

        [HttpGet("audit-log")]
        public async Task<IActionResult> GetAuditLog(
            [FromQuery] int? adminUserId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var logs = await _repo.GetAuditLogsAsync(adminUserId, fromDate, toDate);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching audit log");
                return BadRequest();
            }
        }

        [HttpGet("audit-log/category/{category}")]
        public async Task<IActionResult> GetAuditLogByCategory(string category)
        {
            try
            {
                var logs = await _repo.GetAuditLogsByCategoryAsync(category);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching audit log");
                return BadRequest();
            }
        }

        [HttpPost("audit-log")]
        public async Task<IActionResult> LogAuditAction([FromBody] AuditLog auditLog)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                auditLog.IPAddress = GetClientIpAddress();
                auditLog.UserAgent = HttpContext.Request.Headers["User-Agent"].ToString();

                var created = await _repo.LogAuditActionAsync(auditLog);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging audit action");
                return BadRequest();
            }
        }

        #endregion

        #region Roles & Permissions

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            try
            {
                var roles = await _repo.GetAdminRolesAsync();

                // Project to DTOs to avoid circular reference
                var rolesDtos = roles.Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Description,
                    r.IsProtected,
                    r.CreatedAt,
                    r.UpdatedAt,
                    Permissions = (r.Permissions ?? Enumerable.Empty<RolePermission>()).Select(rp => new
                    {
                        rp.PermissionId,
                        PermissionKey = rp.Permission?.PermissionKey,
                        PermissionModule = rp.Permission?.Module,
                        PermissionResource = rp.Permission?.Resource,
                        PermissionAction = rp.Permission?.Action,
                        rp.AccessLevel,
                        rp.AssignedAt
                    }).ToList()
                }).ToList();

                return Ok(rolesDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching roles");
                return BadRequest();
            }
        }

        [HttpGet("roles/{id}")]
        public async Task<IActionResult> GetRoleById(int id)
        {
            try
            {
                var role = await _repo.GetAdminRoleByIdAsync(id);
                if (role is null)
                    return NotFound();
                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching role");
                return BadRequest();
            }
        }

        [HttpPost("roles")]
        public async Task<IActionResult> CreateRole([FromBody] AdminRole role)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var created = await _repo.CreateAdminRoleAsync(role);
                return CreatedAtAction(nameof(GetRoleById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating role");
                return BadRequest();
            }
        }

        [HttpPut("roles/{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] AdminRole role)
        {
            try
            {
                role.Id = id;
                var success = await _repo.UpdateAdminRoleAsync(role);
                if (!success)
                    return NotFound();
                return Ok(new { message = "Role updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role");
                return BadRequest();
            }
        }

        [HttpDelete("roles/{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            try
            {
                var success = await _repo.DeleteAdminRoleAsync(id);
                if (!success)
                    return NotFound();
                return Ok(new { message = "Role deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role");
                return BadRequest();
            }
        }

        [HttpGet("permissions")]
        public async Task<IActionResult> GetPermissions()
        {
            try
            {
                var permissions = await _repo.GetPermissionsAsync();
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching permissions");
                return BadRequest();
            }
        }

        [HttpPost("roles/{roleId}/permissions")]
        public async Task<IActionResult> AssignPermissionToRole(int roleId, [FromBody] RolePermission rolePermission)
        {
            try
            {
                rolePermission.RoleId = roleId;
                var created = await _repo.AssignPermissionToRoleAsync(rolePermission);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning permission");
                return BadRequest();
            }
        }

        [HttpDelete("roles/{roleId}/permissions/{permissionId}")]
        public async Task<IActionResult> RemovePermissionFromRole(int roleId, int permissionId)
        {
            try
            {
                var success = await _repo.RemovePermissionFromRoleAsync(roleId, permissionId);
                if (!success)
                    return NotFound();
                return Ok(new { message = "Permission removed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing permission");
                return BadRequest();
            }
        }

        #endregion

        #region Staff Invitations

        [HttpGet("invitations")]
        public async Task<IActionResult> GetInvitations()
        {
            try
            {
                var invitations = await _repo.GetStaffInvitationsAsync();
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching invitations");
                return BadRequest();
            }
        }

        [HttpGet("invitations/pending")]
        public async Task<IActionResult> GetPendingInvitations()
        {
            try
            {
                var invitations = await _repo.GetPendingStaffInvitationsAsync();
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching pending invitations");
                return BadRequest();
            }
        }

        [HttpPost("invitations")]
        public async Task<IActionResult> CreateInvitation([FromBody] StaffInvitation invitation)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                invitation.InvitationToken = Guid.NewGuid().ToString("N");
                var created = await _repo.CreateStaffInvitationAsync(invitation);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating invitation");
                return BadRequest();
            }
        }

        [HttpPut("invitations/{id}/resend")]
        public async Task<IActionResult> ResendInvitation(int id)
        {
            try
            {
                var success = await _repo.ResendStaffInvitationAsync(id);
                if (!success)
                    return NotFound();
                return Ok(new { message = "Invitation resent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resending invitation");
                return BadRequest();
            }
        }

        [HttpDelete("invitations/{id}")]
        public async Task<IActionResult> DeleteInvitation(int id)
        {
            try
            {
                var success = await _repo.DeleteStaffInvitationAsync(id);
                if (!success)
                    return NotFound();
                return Ok(new { message = "Invitation deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting invitation");
                return BadRequest();
            }
        }

        #endregion

        #region Settings

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var settings = await _repo.GetAdminSettingsAsync();
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching settings");
                return BadRequest();
            }
        }

        [HttpGet("settings/{key}")]
        public async Task<IActionResult> GetSettingByKey(string key)
        {
            try
            {
                var setting = await _repo.GetAdminSettingByKeyAsync(key);
                if (setting is null)
                    return NotFound();
                return Ok(setting);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching setting");
                return BadRequest();
            }
        }

        [HttpPost("settings")]
        public async Task<IActionResult> CreateSetting([FromBody] AdminSetting setting)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var created = await _repo.CreateAdminSettingAsync(setting);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating setting");
                return BadRequest();
            }
        }

        [HttpPut("settings/{id}")]
        public async Task<IActionResult> UpdateSetting(int id, [FromBody] AdminSetting setting)
        {
            try
            {
                setting.Id = id;
                var success = await _repo.UpdateAdminSettingAsync(setting);
                if (!success)
                    return NotFound();
                return Ok(new { message = "Setting updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating setting");
                return BadRequest();
            }
        }

        #endregion

        #region Ban Management

        [HttpGet("bans")]
        public async Task<IActionResult> GetBans()
        {
            try
            {
                var bans = await _repo.GetBanRecordsAsync();
                return Ok(bans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching bans");
                return BadRequest();
            }
        }

        [HttpGet("bans/active")]
        public async Task<IActionResult> GetActiveBans()
        {
            try
            {
                var bans = await _repo.GetActiveBanRecordsAsync();
                return Ok(bans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching active bans");
                return BadRequest();
            }
        }

        [HttpPost("bans")]
        public async Task<IActionResult> CreateBan([FromBody] BanRecord ban)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var created = await _repo.CreateBanRecordAsync(ban);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating ban");
                return BadRequest();
            }
        }

        [HttpPut("bans/{id}/unban")]
        public async Task<IActionResult> UnbanUser(int id, [FromBody] UnbanRequest request)
        {
            try
            {
                var success = await _repo.UnbanUserAsync(id, request.UnbannedByAdminUserId, request.Reason);
                if (!success)
                    return NotFound();
                return Ok(new { message = "User unbanned successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unbanning user");
                return BadRequest();
            }
        }

        #endregion

        #region Backups

        [HttpGet("backups")]
        public async Task<IActionResult> GetBackups()
        {
            try
            {
                var backups = await _repo.GetBackupRecordsAsync();
                return Ok(backups);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching backups");
                return BadRequest();
            }
        }

        [HttpPost("backups")]
        public async Task<IActionResult> CreateBackup([FromBody] BackupRecord backup)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var created = await _repo.CreateBackupRecordAsync(backup);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating backup record");
                return BadRequest();
            }
        }

        [HttpPut("backups/{id}")]
        public async Task<IActionResult> UpdateBackup(int id, [FromBody] BackupRecord backup)
        {
            try
            {
                backup.Id = id;
                var success = await _repo.UpdateBackupRecordAsync(backup);
                if (!success)
                    return NotFound();
                return Ok(new { message = "Backup updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating backup");
                return BadRequest();
            }
        }

        #endregion

        #region Residents Management

        [HttpGet("residents")]
        public async Task<IActionResult> GetResidents()
        {
            try
            {
                var residents = await _repo.GetAllAsync(); // Get all userAccounts
                var registrations = await _repo.GetRegistrationsAsync();

                // Combine resident data
                var residentData = residents
                    .Where(u => u.Type == 1) // Type 1 = residents
                    .Select(u => {
                        var reg = registrations.FirstOrDefault(r => r.Email == u.Username);
                        return new
                        {
                            u.Id,
                            Username = u.Username,
                            FullName = reg?.FullName ?? u.Username,
                            Email = u.Username,
                            Mobile = reg?.Mobile,
                            Address = reg?.Address,
                            ResidentType = reg?.ResidentType,
                            Status = u.IsBanned ? "Banned" : "Active",
                            u.IsBanned,
                            BanReason = u.BanReason,
                            BannedUntil = u.BannedUntil,
                            VerifiedAt = reg?.ReviewedAt,
                            RegisteredAt = reg?.SubmittedAt
                        };
                    })
                    .ToList();

                return Ok(new { success = true, data = residentData });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching residents");
                return StatusCode(500, new { success = false, error = "Failed to fetch residents" });
            }
        }

        [HttpPost("residents/{id}/ban")]
        public async Task<IActionResult> BanResident(int id, [FromBody] BanResidentRequest request)
        {
            try
            {
                var user = await _repo.GetByIdAsync(id);
                if (user == null || user.Type != 1)
                    return NotFound(new { success = false, error = "Resident not found" });

                user.IsBanned = true;
                user.BanReason = request.Reason ?? "Violation of community guidelines";
                user.BannedUntil = request.BannedUntil;

                var success = await _repo.UpdateAsync(user);
                if (success)
                {
                    // Log the ban action
                    await _repo.LogAuditActionAsync(new AuditLog
                    {
                        AdminUserId = request.BannedByAdminId ?? 0,
                        Action = "Banned Resident",
                        TargetEntity = "UserAccount",
                        TargetEntityId = id.ToString(),
                        ActionCategory = "Moderation",
                        Outcome = "Success",
                        Notes = $"Reason: {request.Reason}",
                        IPAddress = GetClientIpAddress()
                    });

                    return Ok(new { success = true, message = "Resident banned successfully" });
                }
                return StatusCode(500, new { success = false, error = "Failed to ban resident" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error banning resident");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("residents/{id}/unban")]
        public async Task<IActionResult> UnbanResident(int id)
        {
            try
            {
                var user = await _repo.GetByIdAsync(id);
                if (user == null || user.Type != 1)
                    return NotFound(new { success = false, error = "Resident not found" });

                user.IsBanned = false;
                user.BanReason = null;
                user.BannedUntil = null;

                var success = await _repo.UpdateAsync(user);
                if (success)
                {
                    await _repo.LogAuditActionAsync(new AuditLog
                    {
                        Action = "Unbanned Resident",
                        TargetEntity = "UserAccount",
                        TargetEntityId = id.ToString(),
                        ActionCategory = "Moderation",
                        Outcome = "Success",
                        IPAddress = GetClientIpAddress()
                    });

                    return Ok(new { success = true, message = "Resident unbanned successfully" });
                }
                return StatusCode(500, new { success = false, error = "Failed to unban resident" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unbanning resident");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        #endregion

        #region Data Export

        [HttpGet("export/{dataset}")]
        public async Task<IActionResult> ExportDataset(string dataset, [FromQuery] string format = "CSV")
        {
            try
            {
                var data = dataset.ToLower() switch
                {
                    "residents" => await ExportResidents(format),
                    "incidents" => await ExportIncidents(format),
                    "auditlog" => await ExportAuditLog(format),
                    "staff" => await ExportStaffActivity(format),
                    _ => null
                };

                if (data == null)
                    return BadRequest(new { success = false, error = "Invalid dataset" });

                var contentType = format.ToUpper() switch
                {
                    "CSV" => "text/csv",
                    "XLSX" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "PDF" => "application/pdf",
                    _ => "text/csv"
                };

                var fileName = $"{dataset}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{format.ToLower()}";
                return File(data, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting dataset: {Dataset}", dataset);
                return StatusCode(500, new { success = false, error = "Export failed" });
            }
        }

        private async System.Threading.Tasks.Task<byte[]> ExportResidents(string format)
        {
            var residents = await _repo.GetAllAsync();
            var registrations = await _repo.GetRegistrationsAsync();

            var data = residents
                .Where(u => u.Type == 1)
                .Select(u => {
                    var reg = registrations.FirstOrDefault(r => r.Email == u.Username);
                    return new {
                        Username = u.Username,
                        FullName = reg?.FullName ?? u.Username,
                        Email = u.Username,
                        Mobile = reg?.Mobile,
                        Address = reg?.Address,
                        ResidentType = reg?.ResidentType,
                        Status = u.IsBanned ? "Banned" : "Active",
                        RegisteredAt = reg?.SubmittedAt,
                        VerifiedAt = reg?.ReviewedAt
                    };
                }).ToList();

            return format.ToUpper() == "CSV" ? ConvertToCsv(data) : ConvertToCsv(data); // Simplified - both return CSV
        }

        private async System.Threading.Tasks.Task<byte[]> ExportIncidents(string format)
        {
            var reports = await _repo.GetReportsAsync();
            var data = reports.Select(r => new {
                r.Id,
                r.Description,
                r.Category,
                r.Priority,
                r.Status,
                Address = r.Address,
                Street = r.Street,
                ReporterName = r.ReporterName,
                ReporterContact = r.ReporterContact,
                r.Timestamp,
                r.ResolvedAt,
                r.ResolvedBy,
                StaffComment = r.StaffComment
            }).ToList();

            return ConvertToCsv(data);
        }

        private async System.Threading.Tasks.Task<byte[]> ExportAuditLog(string format)
        {
            var logs = await _repo.GetAuditLogsAsync();
            var data = logs.Select(log => new {
                log.Id,
                AdminUser = log.AdminUser?.Name ?? "System",
                log.Action,
                log.ActionCategory,
                log.TargetEntity,
                log.TargetEntityId,
                log.Timestamp,
                log.IPAddress,
                log.Outcome,
                log.Notes
            }).ToList();

            return ConvertToCsv(data);
        }

        private async System.Threading.Tasks.Task<byte[]> ExportStaffActivity(string format)
        {
            var staff = await _repo.GetAdminUsersAsync();
            var logs = await _repo.GetAuditLogsAsync();

            var data = staff.Select(s => {
                var userLogs = logs.Where(l => l.AdminUserId == s.Id).ToList();
                return new {
                    s.Name,
                    s.Email,
                    Role = s.Role?.Name ?? "N/A",
                    s.LastLoginAt,
                    TotalActions = userLogs.Count,
                    SuccessfulActions = userLogs.Count(l => l.Outcome == "Success"),
                    FailedActions = userLogs.Count(l => l.Outcome == "Failed"),
                    s.Status
                };
            }).ToList();

            return ConvertToCsv(data);
        }

        private byte[] ConvertToCsv<T>(List<T> data)
        {
            if (!data.Any())
                return System.Text.Encoding.UTF8.GetBytes("No data available");

            var sb = new System.Text.StringBuilder();
            var properties = typeof(T).GetProperties();

            // Header
            sb.AppendLine(string.Join(",", properties.Select(p => p.Name)));

            // Rows
            foreach (var item in data)
            {
                var values = properties.Select(p => {
                    var value = p.GetValue(item)?.ToString() ?? "";
                    // Escape commas and quotes in CSV
                    if (value.Contains(",") || value.Contains("\""))
                        value = $"\"{value.Replace("\"", "\"\"")}\"";
                    return value;
                });
                sb.AppendLine(string.Join(",", values));
            }

            return System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        }

        #endregion
    }

    // Helper DTOs
    public class BanResidentRequest
    {
        public string? Reason { get; set; }
        public DateTime? BannedUntil { get; set; }
        public int? BannedByAdminId { get; set; }
    }

    public class UnbanRequest
    {
        public int UnbannedByAdminUserId { get; set; }
        public string? Reason { get; set; }
    }
}
