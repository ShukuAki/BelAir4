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
                return Ok(staff);
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
                return Ok(roles);
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
    }

    // Helper DTOs
    public class UnbanRequest
    {
        public int UnbannedByAdminUserId { get; set; }
        public string? Reason { get; set; }
    }
}
