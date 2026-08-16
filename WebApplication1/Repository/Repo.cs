using WebApplication1.Models;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

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
        Task SeedAsync();
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
        public async Task SeedAsync()
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
                CREATE TABLE meeting_records (id INT IDENTITY PRIMARY KEY, title VARCHAR(300) NOT NULL, date VARCHAR(20), type VARCHAR(50), file_path NVARCHAR(MAX), uploaded_by VARCHAR(100), uploaded_at DATETIME2 DEFAULT GETUTCDATE());

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
    }
}