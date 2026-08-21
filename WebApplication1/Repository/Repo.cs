using WebApplication1.Models;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskModel = WebApplication1.Models.Task;

namespace WebApplication1.Repository
{
    public interface IRepo
    {
        Task<List<UserAccount>> GetAllAsync();
        Task<UserAccount?> GetByIdAsync(int id);
        Task<UserAccount> CreateAsync(UserAccount user);
        Task<bool> UpdateAsync(UserAccount user);
        Task<bool> DeleteAsync(int id);
        Task<UserAccount?> AuthenticateAsync(string username, string password);
        Task<UserAccount?> GetByUsernameAsync(string username);
        Task<bool> SetUserBanAsync(string username, bool isBanned, DateTime? bannedUntil, string? reason);
        System.Threading.Tasks.Task SeedAsync();
        // Forum
        Task<List<Post>> GetPostsAsync();
        Task<Post?> GetPostByIdAsync(int id);
        Task<Post> CreatePostAsync(Post post);
        Task<bool> AddReplyAsync(Reply reply);
        Task<bool> MarkHelpfulAsync(int postId);
        Task<List<Post>> GetPostsByPriorityAsync(string priority);
        Task<bool> UpdatePostAsync(Post post);
        Task<bool> DeletePostAsync(int id);
        Task<bool> DeleteReplyAsync(int id);
        // Vehicles & Pets
        Task<List<Models.Vehicle>> GetVehiclesAsync();
        Task<Models.Vehicle> CreateVehicleAsync(Models.Vehicle vehicle);
        Task<List<Models.Pet>> GetPetsAsync();
        Task<Models.Pet> CreatePetAsync(Models.Pet pet);
        // Concern Reports
        Task<ConcernReport> CreateReportAsync(ConcernReport report);
        Task<List<ConcernReport>> GetReportsAsync();
        Task<List<ConcernReport>> GetReportsByPriorityAsync(string priority);
        Task<bool> UpdateReportAsync(ConcernReport report);
        Task<int> GetMonthlyReportCountAsync(int year, int month);
        Task<ConcernReport?> GetReportByIdAsync(int id);
        Task<bool> UpdateReportStatusAsync(int id, string status, string? comment, string? handledBy);
        // Keywords
        Task<List<KeywordDictionary>> GetKeywordsAsync();
        Task<List<KeywordDictionary>> GetActiveKeywordsAsync();
        Task<KeywordDictionary> CreateKeywordAsync(KeywordDictionary keyword);
        Task<bool> UpdateKeywordAsync(KeywordDictionary keyword);
        Task<bool> DeleteKeywordAsync(int id);
        Task<KeywordDictionary?> GetKeywordByIdAsync(int id);
        // Advertisements
        Task<List<Advertisement>> GetAdvertisementsAsync();
        Task<List<Advertisement>> GetApprovedAdvertisementsAsync();
        Task<List<Advertisement>> GetPendingAdvertisementsAsync();
        Task<Advertisement> CreateAdvertisementAsync(Advertisement ad);
        Task<bool> UpdateAdvertisementAsync(Advertisement ad);
        Task<bool> ApproveAdvertisementAsync(int id, string reviewedBy);
        Task<bool> RejectAdvertisementAsync(int id, string reviewedBy);
        // Registrations
        Task<List<Registration>> GetRegistrationsAsync();
        Task<List<Registration>> GetApprovedRegistrationsAsync();
        Task<List<Registration>> GetPendingRegistrationsAsync();
        Task<Registration> CreateRegistrationAsync(Registration registration);
        Task<bool> ApproveRegistrationAsync(int id, string reviewedBy);
        Task<bool> RejectRegistrationAsync(int id, string reviewedBy, string reason);
        // Reservations
        Task<List<Reservation>> GetReservationsAsync();
        Task<List<Reservation>> GetReservationsByStatusAsync(string status);
        Task<List<Reservation>> GetReservationsByAmenityAsync(string amenity);
        Task<Reservation> CreateReservationAsync(Reservation reservation);
        Task<bool> ApproveReservationAsync(int id, string reviewedBy);
        Task<bool> RejectReservationAsync(int id, string reviewedBy, string reason);
        // Announcements
        Task<List<Announcement>> GetAnnouncementsAsync();
        Task<Announcement> CreateAnnouncementAsync(Announcement a);
        Task<bool> UpdateAnnouncementAsync(Announcement a);
        Task<bool> DeleteAnnouncementAsync(int id);
        // Events
        Task<List<HoaEvent>> GetEventsAsync();
        Task<HoaEvent> CreateEventAsync(HoaEvent e);
        Task<bool> UpdateEventAsync(HoaEvent e);
        Task<bool> DeleteEventAsync(int id);
        // BOD Members
        Task<List<BodMember>> GetBodMembersAsync();
        Task<BodMember> CreateBodMemberAsync(BodMember m);
        Task<bool> UpdateBodMemberAsync(BodMember m);
        Task<bool> DeleteBodMemberAsync(int id);
        // Meeting Records
        Task<List<MeetingRecord>> GetMeetingRecordsAsync();
        Task<MeetingRecord> CreateMeetingRecordAsync(MeetingRecord r);
        Task<bool> UpdateMeetingRecordAsync(MeetingRecord r);
        Task<bool> DeleteMeetingRecordAsync(int id);
        // Documents
        Task<List<HoaDocument>> GetDocumentsAsync();
        Task<HoaDocument> CreateDocumentAsync(HoaDocument d);
        Task<bool> UpdateDocumentAsync(HoaDocument d);
        Task<bool> DeleteDocumentAsync(int id);
        // Contacts
        Task<List<Contact>> GetContactsAsync();
        Task<Contact> CreateContactAsync(Contact c);
        Task<bool> UpdateContactAsync(Contact c);
        Task<bool> DeleteContactAsync(int id);

        // Admin Dashboard - Staff Management
        Task<List<AdminUser>> GetAdminUsersAsync();
        Task<AdminUser?> GetAdminUserByIdAsync(int id);
        Task<AdminUser> CreateAdminUserAsync(AdminUser adminUser);
        Task<bool> UpdateAdminUserAsync(AdminUser adminUser);
        Task<bool> DeleteAdminUserAsync(int id);
        Task<AdminUser?> GetAdminUserByEmailAsync(string email);
        Task<bool> UpdateAdminUserLastLoginAsync(int id, DateTime loginTime, string ipAddress);

        // Admin Dashboard - Audit Logging
        Task<List<AuditLog>> GetAuditLogsAsync(int? adminUserId = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<AuditLog> LogAuditActionAsync(AuditLog auditLog);
        Task<List<AuditLog>> GetAuditLogsByMonthAsync(int year, int month);
        Task<List<AuditLog>> GetAuditLogsByCategoryAsync(string category);
        Task<int> GetAuditLogCountAsync();

        // Admin Dashboard - Roles & Permissions
        Task<List<AdminRole>> GetAdminRolesAsync();
        Task<AdminRole?> GetAdminRoleByIdAsync(int id);
        Task<AdminRole> CreateAdminRoleAsync(AdminRole role);
        Task<bool> UpdateAdminRoleAsync(AdminRole role);
        Task<bool> DeleteAdminRoleAsync(int id);
        Task<List<Permission>> GetPermissionsAsync();
        Task<Permission?> GetPermissionByIdAsync(int id);
        Task<Permission> CreatePermissionAsync(Permission permission);
        Task<bool> UpdatePermissionAsync(Permission permission);
        Task<bool> DeletePermissionAsync(int id);
        Task<List<RolePermission>> GetRolePermissionsAsync(int roleId);
        Task<RolePermission> AssignPermissionToRoleAsync(RolePermission rolePermission);
        Task<bool> RemovePermissionFromRoleAsync(int roleId, int permissionId);

        // Admin Dashboard - Staff Invitations
        Task<List<StaffInvitation>> GetStaffInvitationsAsync();
        Task<List<StaffInvitation>> GetPendingStaffInvitationsAsync();
        Task<StaffInvitation?> GetStaffInvitationByIdAsync(int id);
        Task<StaffInvitation?> GetStaffInvitationByTokenAsync(string token);
        Task<StaffInvitation> CreateStaffInvitationAsync(StaffInvitation invitation);
        Task<bool> UpdateStaffInvitationStatusAsync(int id, string status);
        Task<bool> ResendStaffInvitationAsync(int id);
        Task<bool> DeleteStaffInvitationAsync(int id);

        // Admin Dashboard - Admin Settings
        Task<List<AdminSetting>> GetAdminSettingsAsync();
        Task<AdminSetting?> GetAdminSettingByKeyAsync(string settingKey);
        Task<AdminSetting> CreateAdminSettingAsync(AdminSetting setting);
        Task<bool> UpdateAdminSettingAsync(AdminSetting setting);
        Task<bool> DeleteAdminSettingAsync(int id);

        // Admin Dashboard - Ban Management
        Task<List<BanRecord>> GetBanRecordsAsync();
        Task<List<BanRecord>> GetActiveBanRecordsAsync();
        Task<BanRecord?> GetBanRecordByIdAsync(int id);
        Task<BanRecord> CreateBanRecordAsync(BanRecord banRecord);
        Task<bool> UpdateBanRecordAsync(BanRecord banRecord);
        Task<bool> UnbanUserAsync(int banRecordId, int unbannedByAdminUserId, string? reason);
        Task<bool> DeleteBanRecordAsync(int id);

        // Admin Dashboard - Backup Management
        Task<List<BackupRecord>> GetBackupRecordsAsync();
        Task<BackupRecord?> GetBackupRecordByIdAsync(int id);
        Task<BackupRecord> CreateBackupRecordAsync(BackupRecord backupRecord);
        Task<bool> UpdateBackupRecordAsync(BackupRecord backupRecord);
        Task<bool> DeleteBackupRecordAsync(int id);

        // Push Notification Subscribers
        Task<List<NotificationSubscriber>> GetSubscribersAsync();
        Task<int> GetActiveSubscriberCountAsync();
        Task<NotificationSubscriber?> GetSubscriberByEmailAsync(string email);
        Task<NotificationSubscriber> CreateSubscriberAsync(NotificationSubscriber subscriber);
        Task<bool> DeactivateSubscriberAsync(int id);
        Task<bool> DeleteSubscriberAsync(int id);

        // Staff Dashboard - Tasks
        Task<List<TaskModel>> GetTasksAsync();
        Task<TaskModel?> GetTaskByIdAsync(int id);
        Task<TaskModel> CreateTaskAsync(TaskModel task);
        Task<bool> UpdateTaskAsync(TaskModel task);
        Task<bool> DeleteTaskAsync(int id);
        Task<List<TaskModel>> GetTasksByStatusAsync(string status);
        Task<List<TaskModel>> GetTasksByCategoryAsync(string category);
        Task<bool> UpdateTaskStatusAsync(int id, string newStatus);

        // Landmarks
        Task<List<Landmark>> GetLandmarksAsync();
        Task<int> CreateLandmarkAsync(Landmark landmark);
        Task<bool> UpdateLandmarkAsync(Landmark landmark);
        Task<bool> DeleteLandmarkAsync(int id);

        // Projects
        Task<List<Project>> GetProjectsAsync();
        Task<int> CreateProjectAsync(Project project);
        Task<bool> UpdateProjectAsync(Project project);
        Task<bool> DeleteProjectAsync(int id);
    }

    public class Repo : IRepo
    {
        private readonly SqBelAir4Context _db;

        public Repo(SqBelAir4Context db)
        {
            _db = db;
        }

        public async Task<List<UserAccount>> GetAllAsync()
        {
            return await _db.UserAccounts
                .AsNoTracking()
                .OrderBy(u => u.Id)
                .ToListAsync();
        }

        public async Task<UserAccount?> GetByIdAsync(int id)
        {
            return await _db.UserAccounts.FindAsync(id);
        }

        public async Task<UserAccount> CreateAsync(UserAccount user)
        {
            _db.UserAccounts.Add(user);
            await _db.SaveChangesAsync();
            return user;
        }

        public async Task<bool> UpdateAsync(UserAccount user)
        {
            var existing = await _db.UserAccounts.FindAsync(user.Id);
            if (existing is null)
                return false;

            existing.Username = user.Username;
            existing.Password = user.Password;
            existing.Type = user.Type;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _db.UserAccounts.FindAsync(id);
            if (existing is null)
                return false;

            _db.UserAccounts.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }

        // Normalize username for comparison. Passwords are still plain-text in this scaffold — replace with hashing for production.
        public async Task<UserAccount?> AuthenticateAsync(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                return null;

            var normalized = username.Trim().ToLowerInvariant();

            return await _db.UserAccounts
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Username.ToLower() == normalized && u.Password == password);
        }

        public async Task<UserAccount?> GetByUsernameAsync(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return null;
            var normalized = username.Trim().ToLowerInvariant();
            return await _db.UserAccounts
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Username.ToLower() == normalized);
        }

        public async Task<bool> SetUserBanAsync(string username, bool isBanned, DateTime? bannedUntil, string? reason)
        {
            if (string.IsNullOrWhiteSpace(username))
                return false;
            var normalized = username.Trim().ToLowerInvariant();
            var user = await _db.UserAccounts.FirstOrDefaultAsync(u => u.Username.ToLower() == normalized);
            if (user is null)
                return false;

            user.IsBanned = isBanned;
            user.BannedUntil = bannedUntil;
            user.BanReason = isBanned ? reason : null;

            await _db.SaveChangesAsync();
            return true;
        }

        // Simple seeding example to trigger DB operations on startup or as-needed.
        public async System.Threading.Tasks.Task SeedAsync()
        {
            if (!await _db.UserAccounts.AnyAsync())
            if (!await _db.UserAccounts.AnyAsync())
            {
                var users = new[]
                {
                    new UserAccount { Username = "admin", Password = "admin", Type = 1 },
                    new UserAccount { Username = "user", Password = "user", Type = 0 }
                };
                _db.UserAccounts.AddRange(users);
            }

            await _db.SaveChangesAsync();

            // Ensure new tables exist (idempotent IF NOT EXISTS)
            await _db.Database.ExecuteSqlRawAsync(@"
                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='announcements')
                CREATE TABLE announcements (id INT IDENTITY PRIMARY KEY, title VARCHAR(300) NOT NULL, body NVARCHAR(MAX), category VARCHAR(100), posted_by VARCHAR(100), posted_at DATETIME2 DEFAULT GETUTCDATE(), status VARCHAR(20) DEFAULT 'published', scheduled_at DATETIME2);

                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='hoa_events')
                CREATE TABLE hoa_events (id INT IDENTITY PRIMARY KEY, title VARCHAR(300) NOT NULL, description NVARCHAR(MAX), date VARCHAR(20), time VARCHAR(10), location VARCHAR(200), category VARCHAR(100), created_by VARCHAR(100), created_at DATETIME2 DEFAULT GETUTCDATE());

                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='bod_members')
                CREATE TABLE bod_members (id INT IDENTITY PRIMARY KEY, name VARCHAR(200) NOT NULL, position VARCHAR(100), term VARCHAR(50), phone VARCHAR(50), email VARCHAR(200), created_at DATETIME2 DEFAULT GETUTCDATE());

                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='meeting_records')
                CREATE TABLE meeting_records (id INT IDENTITY PRIMARY KEY, title VARCHAR(300) NOT NULL, date VARCHAR(20), time VARCHAR(20), location VARCHAR(200), type VARCHAR(50), file_path NVARCHAR(MAX), uploaded_by VARCHAR(100), uploaded_at DATETIME2 DEFAULT GETUTCDATE());

                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='meeting_records' AND COLUMN_NAME='time')
                ALTER TABLE meeting_records ADD time VARCHAR(20) NULL;

                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='meeting_records' AND COLUMN_NAME='location')
                ALTER TABLE meeting_records ADD location VARCHAR(200) NULL;

                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='hoa_documents')
                CREATE TABLE hoa_documents (id INT IDENTITY PRIMARY KEY, name VARCHAR(300) NOT NULL, category VARCHAR(100), file_path NVARCHAR(MAX), uploaded_by VARCHAR(100), uploaded_at DATETIME2 DEFAULT GETUTCDATE());

                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='contacts')
                CREATE TABLE contacts (id INT IDENTITY PRIMARY KEY, name VARCHAR(200) NOT NULL, role VARCHAR(100), phone VARCHAR(50), email VARCHAR(200), created_at DATETIME2 DEFAULT GETUTCDATE());
            ");
        }

        // Forum methods
        public async Task<List<Post>> GetPostsAsync()
        {
            return await _db.Posts
                .AsNoTracking()
                .Include(p => p.Replies)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
        }

        public async Task<Post?> GetPostByIdAsync(int id)
        {
            return await _db.Posts
                .Include(p => p.Replies)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Post> CreatePostAsync(Post post)
        {
            if (post.Replies == null) post.Replies = new System.Collections.Generic.List<Reply>();
            _db.Posts.Add(post);
            await _db.SaveChangesAsync();
            return post;
        }

        // Vehicles & Pets
        public async Task<List<Models.Vehicle>> GetVehiclesAsync()
        {
            return await _db.Vehicles
                .AsNoTracking()
                .OrderByDescending(v => v.Id)
                .ToListAsync();
        }

        public async Task<Models.Vehicle> CreateVehicleAsync(Models.Vehicle vehicle)
        {
            _db.Add(vehicle);
            await _db.SaveChangesAsync();
            return vehicle;
        }

        public async Task<List<Models.Pet>> GetPetsAsync()
        {
            return await _db.Pets
                .AsNoTracking()
                .OrderByDescending(p => p.Id)
                .ToListAsync();
        }

        public async Task<Models.Pet> CreatePetAsync(Models.Pet pet)
        {
            _db.Add(pet);
            await _db.SaveChangesAsync();
            return pet;
        }

        public async Task<bool> AddReplyAsync(Reply reply)
        {
            var post = await _db.Posts.FindAsync(reply.PostId);
            if (post is null) return false;
            _db.Replies.Add(reply);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkHelpfulAsync(int postId)
        {
            var post = await _db.Posts.FindAsync(postId);
            if (post is null) return false;
            post.Helpful += 1;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<Post>> GetPostsByPriorityAsync(string priority)
        {
            return await _db.Posts
                .AsNoTracking()
                .Where(p => p.Priority == priority)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdatePostAsync(Post post)
        {
            var existing = await _db.Posts.FindAsync(post.Id);
            if (existing is null) return false;

            existing.Title = post.Title;
            existing.Category = post.Category;
            existing.Status = post.Status;
            existing.Description = post.Description;
            existing.Author = post.Author;
            existing.Image = post.Image;
            existing.Location = post.Location;
            existing.Priority = post.Priority;
            existing.DetectedKeywords = post.DetectedKeywords;
            existing.IsPublic = post.IsPublic;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePostAsync(int id)
        {
            var post = await _db.Posts
                .Include(p => p.Replies)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (post is null) return false;

            if (post.Replies != null && post.Replies.Count > 0)
                _db.Replies.RemoveRange(post.Replies);
            _db.Posts.Remove(post);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteReplyAsync(int id)
        {
            var reply = await _db.Replies.FindAsync(id);
            if (reply is null) return false;
            _db.Replies.Remove(reply);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<ConcernReport> CreateReportAsync(ConcernReport report)
        {
            _db.ConcernReports.Add(report);
            await _db.SaveChangesAsync();
            return report;
        }

        public async Task<List<ConcernReport>> GetReportsAsync()
        {
            return await _db.ConcernReports
                .AsNoTracking()
                .OrderByDescending(r => r.Timestamp)
                .ToListAsync();
        }

        public async Task<List<ConcernReport>> GetReportsByPriorityAsync(string priority)
        {
            return await _db.ConcernReports
                .AsNoTracking()
                .Where(r => r.Priority == priority)
                .OrderByDescending(r => r.Timestamp)
                .ToListAsync();
        }

        public async Task<bool> UpdateReportAsync(ConcernReport report)
        {
            var existing = await _db.ConcernReports.FindAsync(report.Id);
            if (existing is null)
                return false;

            existing.Priority = report.Priority;
            existing.DetectedKeywords = report.DetectedKeywords;
            existing.Status = report.Status;
            existing.StaffComment = report.StaffComment;
            existing.ResolvedBy = report.ResolvedBy;
            existing.ResolvedAt = report.ResolvedAt;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetMonthlyReportCountAsync(int year, int month)
        {
            return await _db.ConcernReports
                .AsNoTracking()
                .CountAsync(r => r.Timestamp.Year == year && r.Timestamp.Month == month);
        }

        public async Task<ConcernReport?> GetReportByIdAsync(int id)
        {
            return await _db.ConcernReports.FindAsync(id);
        }

        public async Task<bool> UpdateReportStatusAsync(int id, string status, string? comment, string? handledBy)
        {
            var existing = await _db.ConcernReports.FindAsync(id);
            if (existing is null)
                return false;

            existing.Status = status;
            if (comment != null)
                existing.StaffComment = comment;

            if (string.Equals(status, "resolved", StringComparison.OrdinalIgnoreCase))
            {
                existing.ResolvedBy = handledBy;
                existing.ResolvedAt = DateTime.Now;
            }

            await _db.SaveChangesAsync();
            return true;
        }

        // Keyword Dictionary methods
        public async Task<List<KeywordDictionary>> GetKeywordsAsync()
        {
            return await _db.KeywordDictionaries
                .AsNoTracking()
                .OrderBy(k => k.Severity)
                .ThenBy(k => k.Keyword)
                .ToListAsync();
        }

        public async Task<List<KeywordDictionary>> GetActiveKeywordsAsync()
        {
            return await _db.KeywordDictionaries
                .AsNoTracking()
                .Where(k => k.IsActive)
                .OrderBy(k => k.Severity)
                .ThenBy(k => k.Keyword)
                .ToListAsync();
        }

        public async Task<KeywordDictionary> CreateKeywordAsync(KeywordDictionary keyword)
        {
            keyword.CreatedAt = DateTime.UtcNow;
            keyword.UpdatedAt = DateTime.UtcNow;
            _db.KeywordDictionaries.Add(keyword);
            await _db.SaveChangesAsync();
            return keyword;
        }

        public async Task<bool> UpdateKeywordAsync(KeywordDictionary keyword)
        {
            var existing = await _db.KeywordDictionaries.FindAsync(keyword.Id);
            if (existing is null)
                return false;

            existing.Keyword = keyword.Keyword;
            existing.Severity = keyword.Severity;
            existing.Category = keyword.Category;
            existing.Language = keyword.Language;
            existing.Description = keyword.Description;
            existing.IsActive = keyword.IsActive;
            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteKeywordAsync(int id)
        {
            var keyword = await _db.KeywordDictionaries.FindAsync(id);
            if (keyword is null)
                return false;

            _db.KeywordDictionaries.Remove(keyword);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<KeywordDictionary?> GetKeywordByIdAsync(int id)
        {
            return await _db.KeywordDictionaries.FindAsync(id);
        }

        // Advertisements
        public async Task<List<Advertisement>> GetAdvertisementsAsync()
        {
            return await _db.Advertisements
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Advertisement>> GetApprovedAdvertisementsAsync()
        {
            return await _db.Advertisements
                .Where(a => a.Status == "approved")
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Advertisement>> GetPendingAdvertisementsAsync()
        {
            return await _db.Advertisements
                .Where(a => a.Status == "pending")
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<Advertisement> CreateAdvertisementAsync(Advertisement ad)
        {
            ad.CreatedAt = DateTime.UtcNow;
            ad.Status = "pending";
            _db.Advertisements.Add(ad);
            await _db.SaveChangesAsync();
            return ad;
        }

        public async Task<bool> UpdateAdvertisementAsync(Advertisement ad)
        {
            var existing = await _db.Advertisements.FindAsync(ad.Id);
            if (existing is null)
                return false;

            existing.Type = ad.Type;
            existing.Title = ad.Title;
            existing.Description = ad.Description;
            existing.Author = ad.Author;
            existing.ContactName = ad.ContactName;
            existing.ContactPhone = ad.ContactPhone;
            existing.ContactEmail = ad.ContactEmail;
            existing.ContactLink = ad.ContactLink;
            existing.Price = ad.Price;
            existing.Availability = ad.Availability;
            existing.Image = ad.Image;
            existing.Status = ad.Status;
            existing.ReviewedAt = ad.ReviewedAt;
            existing.ReviewedBy = ad.ReviewedBy;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApproveAdvertisementAsync(int id, string reviewedBy)
        {
            var ad = await _db.Advertisements.FindAsync(id);
            if (ad is null)
                return false;

            ad.Status = "approved";
            ad.ReviewedAt = DateTime.UtcNow;
            ad.ReviewedBy = reviewedBy;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectAdvertisementAsync(int id, string reviewedBy)
        {
            var ad = await _db.Advertisements.FindAsync(id);
            if (ad is null)
                return false;

            ad.Status = "rejected";
            ad.ReviewedAt = DateTime.UtcNow;
            ad.ReviewedBy = reviewedBy;
            await _db.SaveChangesAsync();
            return true;
        }

        // Registrations
        public async Task<List<Registration>> GetRegistrationsAsync()
        {
            return await _db.Registrations
                .AsNoTracking()
                .OrderByDescending(r => r.SubmittedAt)
                .ToListAsync();
        }

        public async Task<List<Registration>> GetPendingRegistrationsAsync()
        {
            return await _db.Registrations
                .AsNoTracking()
                .Where(r => r.Status == "pending")
                .OrderByDescending(r => r.SubmittedAt)
                .ToListAsync();
        }

        public async Task<List<Registration>> GetApprovedRegistrationsAsync()
        {
            return await _db.Registrations
                .AsNoTracking()
                .Where(r => r.Status == "approved")
                .OrderByDescending(r => r.SubmittedAt)
                .ToListAsync();
        }

        public async Task<Registration> CreateRegistrationAsync(Registration registration)
        {
            registration.SubmittedAt = DateTime.UtcNow;
            registration.Status = "pending";
            _db.Registrations.Add(registration);
            await _db.SaveChangesAsync();
            return registration;
        }

        public async Task<bool> ApproveRegistrationAsync(int id, string reviewedBy)
        {
            var registration = await _db.Registrations.FindAsync(id);
            if (registration is null)
            {
                Console.WriteLine($"Registration with ID {id} not found");
                return false;
            }

            Console.WriteLine($"Found registration: {registration.FullName}, Status: {registration.Status}");

            registration.Status = "approved";
            registration.ReviewedAt = DateTime.UtcNow;
            registration.ReviewedBy = reviewedBy;

            // Create user account from approved registration
            var user = new UserAccount
            {
                Username = registration.Email,
                Password = registration.Password,
                Type = 1 // Regular member
            };
            _db.UserAccounts.Add(user);

            Console.WriteLine($"Saving changes to database...");
            await _db.SaveChangesAsync();
            Console.WriteLine($"Changes saved successfully");
            return true;
        }

        public async Task<bool> RejectRegistrationAsync(int id, string reviewedBy, string reason)
        {
            var registration = await _db.Registrations.FindAsync(id);
            if (registration is null)
                return false;

            registration.Status = "rejected";
            registration.ReviewedAt = DateTime.UtcNow;
            registration.ReviewedBy = reviewedBy;
            registration.RejectionReason = reason;

            await _db.SaveChangesAsync();
            return true;
        }

        // Reservations
        public async Task<List<Reservation>> GetReservationsAsync()
        {
            return await _db.Reservations
                .AsNoTracking()
                .OrderByDescending(r => r.SubmittedAt)
                .ToListAsync();
        }

        public async Task<List<Reservation>> GetReservationsByStatusAsync(string status)
        {
            return await _db.Reservations
                .AsNoTracking()
                .Where(r => r.Status == status)
                .OrderByDescending(r => r.SubmittedAt)
                .ToListAsync();
        }

        public async Task<List<Reservation>> GetReservationsByAmenityAsync(string amenity)
        {
            return await _db.Reservations
                .AsNoTracking()
                .Where(r => r.Amenity == amenity && (r.Status == "pending" || r.Status == "approved"))
                .ToListAsync();
        }

        public async Task<Reservation> CreateReservationAsync(Reservation reservation)
        {
            reservation.Status = "pending";
            reservation.SubmittedAt = DateTime.UtcNow;
            _db.Reservations.Add(reservation);
            await _db.SaveChangesAsync();
            return reservation;
        }

        public async Task<bool> ApproveReservationAsync(int id, string reviewedBy)
        {
            var reservation = await _db.Reservations.FindAsync(id);
            if (reservation is null) return false;

            reservation.Status = "approved";
            reservation.ReviewedAt = DateTime.UtcNow;
            reservation.ReviewedBy = reviewedBy;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectReservationAsync(int id, string reviewedBy, string reason)
        {
            var reservation = await _db.Reservations.FindAsync(id);
            if (reservation is null) return false;

            reservation.Status = "rejected";
            reservation.ReviewedAt = DateTime.UtcNow;
            reservation.ReviewedBy = reviewedBy;
            reservation.RejectionReason = reason;

            await _db.SaveChangesAsync();
            return true;
        }

        // ── Announcements ──────────────────────────────────────────
        public async Task<List<Announcement>> GetAnnouncementsAsync() =>
            await _db.Announcements.AsNoTracking().OrderByDescending(a => a.PostedAt).ToListAsync();

        public async Task<Announcement> CreateAnnouncementAsync(Announcement a)
        { a.PostedAt = DateTime.UtcNow; _db.Announcements.Add(a); await _db.SaveChangesAsync(); return a; }

        public async Task<bool> UpdateAnnouncementAsync(Announcement a)
        { _db.Announcements.Update(a); return await _db.SaveChangesAsync() > 0; }

        public async Task<bool> DeleteAnnouncementAsync(int id)
        { var e = await _db.Announcements.FindAsync(id); if (e is null) return false; _db.Announcements.Remove(e); return await _db.SaveChangesAsync() > 0; }

        // ── Events ────────────────────────────────────────────────
        public async Task<List<HoaEvent>> GetEventsAsync() =>
            await _db.HoaEvents.AsNoTracking().OrderBy(e => e.Date).ToListAsync();

        public async Task<HoaEvent> CreateEventAsync(HoaEvent e)
        { e.CreatedAt = DateTime.UtcNow; _db.HoaEvents.Add(e); await _db.SaveChangesAsync(); return e; }

        public async Task<bool> UpdateEventAsync(HoaEvent e)
        { _db.HoaEvents.Update(e); return await _db.SaveChangesAsync() > 0; }

        public async Task<bool> DeleteEventAsync(int id)
        { var e = await _db.HoaEvents.FindAsync(id); if (e is null) return false; _db.HoaEvents.Remove(e); return await _db.SaveChangesAsync() > 0; }

        // ── BOD Members ───────────────────────────────────────────
        public async Task<List<BodMember>> GetBodMembersAsync() =>
            await _db.BodMembers.AsNoTracking().OrderBy(m => m.Name).ToListAsync();

        public async Task<BodMember> CreateBodMemberAsync(BodMember m)
        { m.CreatedAt = DateTime.UtcNow; _db.BodMembers.Add(m); await _db.SaveChangesAsync(); return m; }

        public async Task<bool> UpdateBodMemberAsync(BodMember m)
        { _db.BodMembers.Update(m); return await _db.SaveChangesAsync() > 0; }

        public async Task<bool> DeleteBodMemberAsync(int id)
        { var e = await _db.BodMembers.FindAsync(id); if (e is null) return false; _db.BodMembers.Remove(e); return await _db.SaveChangesAsync() > 0; }

        // ── Meeting Records ───────────────────────────────────────
        public async Task<List<MeetingRecord>> GetMeetingRecordsAsync() =>
            await _db.MeetingRecords.AsNoTracking().OrderByDescending(r => r.UploadedAt).ToListAsync();

        public async Task<MeetingRecord> CreateMeetingRecordAsync(MeetingRecord r)
        { r.UploadedAt = DateTime.UtcNow; _db.MeetingRecords.Add(r); await _db.SaveChangesAsync(); return r; }

        public async Task<bool> UpdateMeetingRecordAsync(MeetingRecord r)
        { _db.MeetingRecords.Update(r); return await _db.SaveChangesAsync() > 0; }

        public async Task<bool> DeleteMeetingRecordAsync(int id)
        { var e = await _db.MeetingRecords.FindAsync(id); if (e is null) return false; _db.MeetingRecords.Remove(e); return await _db.SaveChangesAsync() > 0; }

        // ── Documents ─────────────────────────────────────────────
        public async Task<List<HoaDocument>> GetDocumentsAsync() =>
            await _db.HoaDocuments.AsNoTracking().OrderBy(d => d.Name).ToListAsync();

        public async Task<HoaDocument> CreateDocumentAsync(HoaDocument d)
        { d.UploadedAt = DateTime.UtcNow; _db.HoaDocuments.Add(d); await _db.SaveChangesAsync(); return d; }

        public async Task<bool> UpdateDocumentAsync(HoaDocument d)
        { _db.HoaDocuments.Update(d); return await _db.SaveChangesAsync() > 0; }

        public async Task<bool> DeleteDocumentAsync(int id)
        { var e = await _db.HoaDocuments.FindAsync(id); if (e is null) return false; _db.HoaDocuments.Remove(e); return await _db.SaveChangesAsync() > 0; }

        // ── Contacts ──────────────────────────────────────────────
        public async Task<List<Contact>> GetContactsAsync() =>
            await _db.Contacts.AsNoTracking().OrderBy(c => c.Name).ToListAsync();

        public async Task<Contact> CreateContactAsync(Contact c)
        { c.CreatedAt = DateTime.UtcNow; _db.Contacts.Add(c); await _db.SaveChangesAsync(); return c; }

        public async Task<bool> UpdateContactAsync(Contact c)
        { _db.Contacts.Update(c); return await _db.SaveChangesAsync() > 0; }

        public async Task<bool> DeleteContactAsync(int id)
        { var e = await _db.Contacts.FindAsync(id); if (e is null) return false; _db.Contacts.Remove(e); return await _db.SaveChangesAsync() > 0; }

        // ── ADMIN DASHBOARD - Staff Management ─────────────────────
        public async Task<List<AdminUser>> GetAdminUsersAsync() =>
            await _db.AdminUsers.AsNoTracking()
                .Include(u => u.Role)
                .OrderBy(u => u.Name)
                .ToListAsync();

        public async Task<AdminUser?> GetAdminUserByIdAsync(int id) =>
            await _db.AdminUsers.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);

        public async Task<AdminUser> CreateAdminUserAsync(AdminUser adminUser)
        {
            adminUser.CreatedAt = DateTime.UtcNow;
            _db.AdminUsers.Add(adminUser);
            await _db.SaveChangesAsync();
            return adminUser;
        }

        public async Task<bool> UpdateAdminUserAsync(AdminUser adminUser)
        {
            var existing = await _db.AdminUsers.FindAsync(adminUser.Id);
            if (existing is null) return false;

            existing.Name = adminUser.Name;
            existing.Email = adminUser.Email;
            existing.PhoneNumber = adminUser.PhoneNumber;
            existing.RoleId = adminUser.RoleId;
            existing.IsActive = adminUser.IsActive;
            existing.Status = adminUser.Status;
            existing.IsSuspended = adminUser.IsSuspended;
            existing.SuspendedUntil = adminUser.SuspendedUntil;
            existing.SuspensionReason = adminUser.SuspensionReason;

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAdminUserAsync(int id)
        {
            var existing = await _db.AdminUsers.FindAsync(id);
            if (existing is null) return false;
            _db.AdminUsers.Remove(existing);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<AdminUser?> GetAdminUserByEmailAsync(string email) =>
            await _db.AdminUsers.Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

        public async Task<bool> UpdateAdminUserLastLoginAsync(int id, DateTime loginTime, string ipAddress)
        {
            var user = await _db.AdminUsers.FindAsync(id);
            if (user is null) return false;
            user.LastLoginAt = loginTime;
            user.IPAddress = ipAddress;
            return await _db.SaveChangesAsync() > 0;
        }

        // ── ADMIN DASHBOARD - Audit Logging ────────────────────────
        public async Task<List<AuditLog>> GetAuditLogsAsync(int? adminUserId = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _db.AuditLogs.AsNoTracking()
                .Include(a => a.AdminUser)
                .AsQueryable();

            if (adminUserId.HasValue)
                query = query.Where(a => a.AdminUserId == adminUserId);

            if (fromDate.HasValue)
                query = query.Where(a => a.Timestamp >= fromDate);

            if (toDate.HasValue)
                query = query.Where(a => a.Timestamp <= toDate);

            return await query.OrderByDescending(a => a.Timestamp).Take(1000).ToListAsync();
        }

        public async Task<AuditLog> LogAuditActionAsync(AuditLog auditLog)
        {
            auditLog.Timestamp = DateTime.UtcNow;
            auditLog.CreatedDate = DateTime.UtcNow;
            auditLog.Month = DateTime.UtcNow.Month;
            auditLog.Year = DateTime.UtcNow.Year;
            _db.AuditLogs.Add(auditLog);
            await _db.SaveChangesAsync();
            return auditLog;
        }

        public async Task<List<AuditLog>> GetAuditLogsByMonthAsync(int year, int month) =>
            await _db.AuditLogs.AsNoTracking()
                .Include(a => a.AdminUser)
                .Where(a => a.Year == year && a.Month == month)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();

        public async Task<List<AuditLog>> GetAuditLogsByCategoryAsync(string category) =>
            await _db.AuditLogs.AsNoTracking()
                .Include(a => a.AdminUser)
                .Where(a => a.ActionCategory == category)
                .OrderByDescending(a => a.Timestamp)
                .Take(500)
                .ToListAsync();

        public async Task<int> GetAuditLogCountAsync() =>
            await _db.AuditLogs.CountAsync();

        // ── ADMIN DASHBOARD - Roles & Permissions ──────────────────
        public async Task<List<AdminRole>> GetAdminRolesAsync() =>
            await _db.AdminRoles.AsNoTracking()
                .Include(r => r.Permissions)
                .OrderBy(r => r.Name)
                .ToListAsync();

        public async Task<AdminRole?> GetAdminRoleByIdAsync(int id) =>
            await _db.AdminRoles.Include(r => r.Permissions)
                .FirstOrDefaultAsync(r => r.Id == id);

        public async Task<AdminRole> CreateAdminRoleAsync(AdminRole role)
        {
            role.CreatedAt = DateTime.UtcNow;
            _db.AdminRoles.Add(role);
            await _db.SaveChangesAsync();
            return role;
        }

        public async Task<bool> UpdateAdminRoleAsync(AdminRole role)
        {
            var existing = await _db.AdminRoles.FindAsync(role.Id);
            if (existing is null || existing.IsProtected) return false;

            existing.Name = role.Name;
            existing.Description = role.Description;
            existing.UpdatedAt = DateTime.UtcNow;

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAdminRoleAsync(int id)
        {
            var existing = await _db.AdminRoles.FindAsync(id);
            if (existing is null || existing.IsProtected) return false;
            _db.AdminRoles.Remove(existing);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<List<Permission>> GetPermissionsAsync() =>
            await _db.Permissions.AsNoTracking().OrderBy(p => p.Module).ThenBy(p => p.Resource).ToListAsync();

        public async Task<Permission?> GetPermissionByIdAsync(int id) =>
            await _db.Permissions.FirstOrDefaultAsync(p => p.Id == id);

        public async Task<Permission> CreatePermissionAsync(Permission permission)
        {
            permission.CreatedAt = DateTime.UtcNow;
            _db.Permissions.Add(permission);
            await _db.SaveChangesAsync();
            return permission;
        }

        public async Task<bool> UpdatePermissionAsync(Permission permission)
        {
            var existing = await _db.Permissions.FindAsync(permission.Id);
            if (existing is null) return false;

            existing.Module = permission.Module;
            existing.Resource = permission.Resource;
            existing.Action = permission.Action;
            existing.Description = permission.Description;

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeletePermissionAsync(int id)
        {
            var existing = await _db.Permissions.FindAsync(id);
            if (existing is null) return false;
            _db.Permissions.Remove(existing);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<List<RolePermission>> GetRolePermissionsAsync(int roleId) =>
            await _db.RolePermissions.AsNoTracking()
                .Include(rp => rp.Permission)
                .Where(rp => rp.RoleId == roleId)
                .OrderBy(rp => rp.Permission!.Module)
                .ToListAsync();

        public async Task<RolePermission> AssignPermissionToRoleAsync(RolePermission rolePermission)
        {
            rolePermission.AssignedAt = DateTime.UtcNow;
            _db.RolePermissions.Add(rolePermission);
            await _db.SaveChangesAsync();
            return rolePermission;
        }

        public async Task<bool> RemovePermissionFromRoleAsync(int roleId, int permissionId)
        {
            var rolePermission = await _db.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);
            if (rolePermission is null) return false;
            _db.RolePermissions.Remove(rolePermission);
            return await _db.SaveChangesAsync() > 0;
        }

        // ── ADMIN DASHBOARD - Staff Invitations ────────────────────
        public async Task<List<StaffInvitation>> GetStaffInvitationsAsync() =>
            await _db.StaffInvitations.AsNoTracking()
                .Include(si => si.Role)
                .Include(si => si.InvitedByAdminUser)
                .OrderByDescending(si => si.CreatedAt)
                .ToListAsync();

        public async Task<List<StaffInvitation>> GetPendingStaffInvitationsAsync() =>
            await _db.StaffInvitations.AsNoTracking()
                .Include(si => si.Role)
                .Where(si => si.Status == "Pending" && si.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(si => si.CreatedAt)
                .ToListAsync();

        public async Task<StaffInvitation?> GetStaffInvitationByIdAsync(int id) =>
            await _db.StaffInvitations
                .Include(si => si.Role)
                .Include(si => si.InvitedByAdminUser)
                .FirstOrDefaultAsync(si => si.Id == id);

        public async Task<StaffInvitation?> GetStaffInvitationByTokenAsync(string token) =>
            await _db.StaffInvitations
                .Include(si => si.Role)
                .FirstOrDefaultAsync(si => si.InvitationToken == token);

        public async Task<StaffInvitation> CreateStaffInvitationAsync(StaffInvitation invitation)
        {
            invitation.CreatedAt = DateTime.UtcNow;
            invitation.ExpiresAt = DateTime.UtcNow.AddDays(7);
            invitation.Status = "Pending";
            _db.StaffInvitations.Add(invitation);
            await _db.SaveChangesAsync();
            return invitation;
        }

        public async Task<bool> UpdateStaffInvitationStatusAsync(int id, string status)
        {
            var invitation = await _db.StaffInvitations.FindAsync(id);
            if (invitation is null) return false;

            invitation.Status = status;
            if (status == "Accepted")
                invitation.AcceptedAt = DateTime.UtcNow;
            else if (status == "Rejected")
                invitation.RejectedAt = DateTime.UtcNow;

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> ResendStaffInvitationAsync(int id)
        {
            var invitation = await _db.StaffInvitations.FindAsync(id);
            if (invitation is null) return false;

            invitation.ResendCount++;
            invitation.LastResendAt = DateTime.UtcNow;
            invitation.ExpiresAt = DateTime.UtcNow.AddDays(7);

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteStaffInvitationAsync(int id)
        {
            var invitation = await _db.StaffInvitations.FindAsync(id);
            if (invitation is null) return false;
            _db.StaffInvitations.Remove(invitation);
            return await _db.SaveChangesAsync() > 0;
        }

        // ── ADMIN DASHBOARD - Admin Settings ───────────────────────
        public async Task<List<AdminSetting>> GetAdminSettingsAsync() =>
            await _db.AdminSettings.AsNoTracking()
                .Where(s => s.IsActive)
                .OrderBy(s => s.Category)
                .ThenBy(s => s.DisplayOrder)
                .ToListAsync();

        public async Task<AdminSetting?> GetAdminSettingByKeyAsync(string settingKey) =>
            await _db.AdminSettings.FirstOrDefaultAsync(s => s.SettingKey == settingKey);

        public async Task<AdminSetting> CreateAdminSettingAsync(AdminSetting setting)
        {
            setting.CreatedAt = DateTime.UtcNow;
            _db.AdminSettings.Add(setting);
            await _db.SaveChangesAsync();
            return setting;
        }

        public async Task<bool> UpdateAdminSettingAsync(AdminSetting setting)
        {
            var existing = await _db.AdminSettings.FindAsync(setting.Id);
            if (existing is null || !existing.IsEditable) return false;

            existing.SettingValue = setting.SettingValue;
            existing.UpdatedAt = DateTime.UtcNow;

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAdminSettingAsync(int id)
        {
            var existing = await _db.AdminSettings.FindAsync(id);
            if (existing is null) return false;
            _db.AdminSettings.Remove(existing);
            return await _db.SaveChangesAsync() > 0;
        }

        // ── ADMIN DASHBOARD - Ban Management ───────────────────────
        public async Task<List<BanRecord>> GetBanRecordsAsync() =>
            await _db.BanRecords.AsNoTracking()
                .Include(b => b.BannedByAdminUser)
                .Include(b => b.UnbannedByAdminUser)
                .OrderByDescending(b => b.BannedAt)
                .ToListAsync();

        public async Task<List<BanRecord>> GetActiveBanRecordsAsync() =>
            await _db.BanRecords.AsNoTracking()
                .Include(b => b.BannedByAdminUser)
                .Where(b => b.Status == "Active" && (b.ExpiresAt == null || b.ExpiresAt > DateTime.UtcNow))
                .OrderByDescending(b => b.BannedAt)
                .ToListAsync();

        public async Task<BanRecord?> GetBanRecordByIdAsync(int id) =>
            await _db.BanRecords
                .Include(b => b.BannedByAdminUser)
                .Include(b => b.UnbannedByAdminUser)
                .FirstOrDefaultAsync(b => b.Id == id);

        public async Task<BanRecord> CreateBanRecordAsync(BanRecord banRecord)
        {
            banRecord.BannedAt = DateTime.UtcNow;
            banRecord.Status = "Active";
            _db.BanRecords.Add(banRecord);
            await _db.SaveChangesAsync();
            return banRecord;
        }

        public async Task<bool> UpdateBanRecordAsync(BanRecord banRecord)
        {
            var existing = await _db.BanRecords.FindAsync(banRecord.Id);
            if (existing is null) return false;

            existing.BanReason = banRecord.BanReason;
            existing.Duration = banRecord.Duration;
            existing.ExpiresAt = banRecord.ExpiresAt;

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> UnbanUserAsync(int banRecordId, int unbannedByAdminUserId, string? reason)
        {
            var banRecord = await _db.BanRecords.FindAsync(banRecordId);
            if (banRecord is null) return false;

            banRecord.Status = "Lifted";
            banRecord.UnbannedAt = DateTime.UtcNow;
            banRecord.UnbannedByAdminUserId = unbannedByAdminUserId;
            banRecord.UnbanReason = reason;

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteBanRecordAsync(int id)
        {
            var existing = await _db.BanRecords.FindAsync(id);
            if (existing is null) return false;
            _db.BanRecords.Remove(existing);
            return await _db.SaveChangesAsync() > 0;
        }

        // ── ADMIN DASHBOARD - Backup Management ────────────────────
        public async Task<List<BackupRecord>> GetBackupRecordsAsync() =>
            await _db.BackupRecords.AsNoTracking()
                .Include(b => b.CreatedByAdminUser)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

        public async Task<BackupRecord?> GetBackupRecordByIdAsync(int id) =>
            await _db.BackupRecords
                .Include(b => b.CreatedByAdminUser)
                .FirstOrDefaultAsync(b => b.Id == id);

        public async Task<BackupRecord> CreateBackupRecordAsync(BackupRecord backupRecord)
        {
            backupRecord.CreatedAt = DateTime.UtcNow;
            _db.BackupRecords.Add(backupRecord);
            await _db.SaveChangesAsync();
            return backupRecord;
        }

        public async Task<bool> UpdateBackupRecordAsync(BackupRecord backupRecord)
        {
            var existing = await _db.BackupRecords.FindAsync(backupRecord.Id);
            if (existing is null) return false;

            existing.Status = backupRecord.Status;
            existing.ErrorMessage = backupRecord.ErrorMessage;
            existing.CompletedAt = backupRecord.CompletedAt;

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteBackupRecordAsync(int id)
        {
            var existing = await _db.BackupRecords.FindAsync(id);
            if (existing is null) return false;
            _db.BackupRecords.Remove(existing);
            return await _db.SaveChangesAsync() > 0;
        }

        // ── ADMIN DASHBOARD - Push Notification Subscribers ────────────────────
        public async Task<List<NotificationSubscriber>> GetSubscribersAsync() =>
            await _db.NotificationSubscribers.AsNoTracking()
                .OrderByDescending(s => s.SubscribedAt)
                .ToListAsync();

        public async Task<int> GetActiveSubscriberCountAsync() =>
            await _db.NotificationSubscribers.CountAsync(s => s.IsActive);

        public async Task<NotificationSubscriber?> GetSubscriberByEmailAsync(string email) =>
            await _db.NotificationSubscribers.FirstOrDefaultAsync(s => s.Email == email);

        public async Task<NotificationSubscriber> CreateSubscriberAsync(NotificationSubscriber subscriber)
        {
            subscriber.SubscribedAt = DateTime.UtcNow;
            subscriber.IsActive = true;
            _db.NotificationSubscribers.Add(subscriber);
            await _db.SaveChangesAsync();
            return subscriber;
        }

        public async Task<bool> DeactivateSubscriberAsync(int id)
        {
            var existing = await _db.NotificationSubscribers.FindAsync(id);
            if (existing is null) return false;
            existing.IsActive = false;
            existing.UnsubscribedAt = DateTime.UtcNow;
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteSubscriberAsync(int id)
        {
            var existing = await _db.NotificationSubscribers.FindAsync(id);
            if (existing is null) return false;
            _db.NotificationSubscribers.Remove(existing);
            return await _db.SaveChangesAsync() > 0;
        }

        // ── STAFF DASHBOARD - Tasks ────────────────────
        public async Task<List<TaskModel>> GetTasksAsync() =>
            await _db.Tasks.AsNoTracking()
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

        public async Task<TaskModel?> GetTaskByIdAsync(int id) =>
            await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id);

        public async Task<TaskModel> CreateTaskAsync(TaskModel task)
        {
            task.CreatedAt = DateTime.UtcNow;
            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();
            return task;
        }

        public async Task<bool> UpdateTaskAsync(TaskModel task)
        {
            var existing = await _db.Tasks.FindAsync(task.Id);
            if (existing is null) return false;

            existing.Title = task.Title;
            existing.Description = task.Description;
            existing.Category = task.Category;
            existing.Priority = task.Priority;
            existing.Status = task.Status;
            existing.DueDate = task.DueDate;
            existing.CompletedAt = task.CompletedAt;
            existing.AssignedTo = task.AssignedTo;
            existing.AutoDeleteAfterDays = task.AutoDeleteAfterDays;
            existing.Notes = task.Notes;

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteTaskAsync(int id)
        {
            var existing = await _db.Tasks.FindAsync(id);
            if (existing is null) return false;
            _db.Tasks.Remove(existing);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<List<TaskModel>> GetTasksByStatusAsync(string status) =>
            await _db.Tasks.AsNoTracking()
                .Where(t => t.Status == status)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

        public async Task<List<TaskModel>> GetTasksByCategoryAsync(string category) =>
            await _db.Tasks.AsNoTracking()
                .Where(t => t.Category == category)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

        public async Task<bool> UpdateTaskStatusAsync(int id, string newStatus)
        {
            var existing = await _db.Tasks.FindAsync(id);
            if (existing is null) return false;

            existing.Status = newStatus;
            if (newStatus == "done")
                existing.CompletedAt = DateTime.UtcNow;

            return await _db.SaveChangesAsync() > 0;
        }

        // ── Landmarks ─────────────────────────────────────────────
        public async Task<List<Landmark>> GetLandmarksAsync() =>
            await _db.Landmarks.AsNoTracking()
                .Where(l => l.IsActive)
                .OrderBy(l => l.Name)
                .ToListAsync();

        public async Task<int> CreateLandmarkAsync(Landmark landmark)
        {
            _db.Landmarks.Add(landmark);
            await _db.SaveChangesAsync();
            return landmark.Id;
        }

        public async Task<bool> UpdateLandmarkAsync(Landmark landmark)
        {
            var existing = await _db.Landmarks.FindAsync(landmark.Id);
            if (existing is null) return false;

            existing.Name = landmark.Name;
            existing.Description = landmark.Description;
            existing.Category = landmark.Category;
            existing.Icon = landmark.Icon;
            existing.Latitude = landmark.Latitude;
            existing.Longitude = landmark.Longitude;
            existing.LocationNotes = landmark.LocationNotes;
            existing.IsActive = landmark.IsActive;
            existing.UpdatedAt = DateTime.UtcNow;

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteLandmarkAsync(int id)
        {
            var landmark = await _db.Landmarks.FindAsync(id);
            if (landmark is null) return false;
            _db.Landmarks.Remove(landmark);
            return await _db.SaveChangesAsync() > 0;
        }

        // ── Projects ───────────────────────────────────────────────
        public async Task<List<Project>> GetProjectsAsync() =>
            await _db.Projects.AsNoTracking()
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

        public async Task<int> CreateProjectAsync(Project project)
        {
            _db.Projects.Add(project);
            await _db.SaveChangesAsync();
            return project.Id;
        }

        public async Task<bool> UpdateProjectAsync(Project project)
        {
            var existing = await _db.Projects.FindAsync(project.Id);
            if (existing is null) return false;

            existing.Title = project.Title;
            existing.Description = project.Description;
            existing.Status = project.Status;
            existing.Category = project.Category;
            existing.Location = project.Location;
            existing.Latitude = project.Latitude;
            existing.Longitude = project.Longitude;
            existing.StartDate = project.StartDate;
            existing.EndDate = project.EndDate;
            existing.Budget = project.Budget;
            existing.ContactPerson = project.ContactPerson;
            existing.ContactPhone = project.ContactPhone;
            existing.BeforePhotoUrl = project.BeforePhotoUrl;
            existing.AfterPhotoUrl = project.AfterPhotoUrl;
            existing.ProgressPercentage = project.ProgressPercentage;
            existing.UpdatedAt = DateTime.UtcNow;

            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteProjectAsync(int id)
        {
            var project = await _db.Projects.FindAsync(id);
            if (project is null) return false;
            _db.Projects.Remove(project);
            return await _db.SaveChangesAsync() > 0;
        }
    }
}
