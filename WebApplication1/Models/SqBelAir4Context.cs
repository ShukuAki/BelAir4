using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Models;

public partial class SqBelAir4Context : DbContext
{
    public SqBelAir4Context()
    {
    }

    public SqBelAir4Context(DbContextOptions<SqBelAir4Context> options)
        : base(options)
    {
    }

    public virtual DbSet<UserAccount> UserAccounts { get; set; }
    public virtual DbSet<Post> Posts { get; set; }
    public virtual DbSet<Reply> Replies { get; set; }
    public virtual DbSet<Vehicle> Vehicles { get; set; }
    public virtual DbSet<Pet> Pets { get; set; }
    public virtual DbSet<ConcernReport> ConcernReports { get; set; }
    public virtual DbSet<KeywordDictionary> KeywordDictionaries { get; set; }
    public virtual DbSet<Advertisement> Advertisements { get; set; }
    public virtual DbSet<Registration> Registrations { get; set; }
    public virtual DbSet<Reservation> Reservations { get; set; }
    public virtual DbSet<Announcement> Announcements { get; set; }
    public virtual DbSet<HoaEvent> HoaEvents { get; set; }
    public virtual DbSet<BodMember> BodMembers { get; set; }
    public virtual DbSet<MeetingRecord> MeetingRecords { get; set; }
    public virtual DbSet<HoaDocument> HoaDocuments { get; set; }
    public virtual DbSet<Contact> Contacts { get; set; }
    public virtual DbSet<Landmark> Landmarks { get; set; }
    public virtual DbSet<Project> Projects { get; set; }

    // Admin Dashboard Entities
    public virtual DbSet<AdminUser> AdminUsers { get; set; }
    public virtual DbSet<AuditLog> AuditLogs { get; set; }
    public virtual DbSet<AdminRole> AdminRoles { get; set; }
    public virtual DbSet<Permission> Permissions { get; set; }
    public virtual DbSet<RolePermission> RolePermissions { get; set; }
    public virtual DbSet<AdminSetting> AdminSettings { get; set; }
    public virtual DbSet<StaffInvitation> StaffInvitations { get; set; }
    public virtual DbSet<BanRecord> BanRecords { get; set; }
    public virtual DbSet<BackupRecord> BackupRecords { get; set; }
    public virtual DbSet<NotificationSubscriber> NotificationSubscribers { get; set; }

    // Staff Dashboard Entities
    public virtual DbSet<Task> Tasks { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Connection string is configured in Program.cs via DI
        // Do not override with hardcoded connection string
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAccount>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__userAcco__3213E83FEB69C83D");

            entity.ToTable("userAccounts");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Password)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.IsBanned).HasColumnName("is_banned").HasDefaultValue(false);
            entity.Property(e => e.BannedUntil).HasColumnName("banned_until");
            entity.Property(e => e.BanReason).HasMaxLength(500).IsUnicode(false).HasColumnName("ban_reason");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Vehicles");
            entity.ToTable("vehicles");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Type).HasMaxLength(50).IsUnicode(false).HasColumnName("type");
            entity.Property(e => e.Category).HasMaxLength(50).IsUnicode(false).HasColumnName("category");
            entity.Property(e => e.PlateNumber).HasMaxLength(50).IsUnicode(false).HasColumnName("plate_number");
            entity.Property(e => e.Color).HasMaxLength(50).IsUnicode(false).HasColumnName("color");
            entity.Property(e => e.Brand).HasMaxLength(100).IsUnicode(false).HasColumnName("brand");
            entity.Property(e => e.Model).HasMaxLength(100).IsUnicode(false).HasColumnName("model");
            entity.Property(e => e.Year).HasMaxLength(10).IsUnicode(false).HasColumnName("year");
            entity.Property(e => e.Vin).HasMaxLength(100).IsUnicode(false).HasColumnName("vin");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.GuestName).HasMaxLength(200).IsUnicode(false).HasColumnName("guest_name");
            entity.Property(e => e.GuestContact).HasMaxLength(50).IsUnicode(false).HasColumnName("guest_contact");
            entity.Property(e => e.GuestDuration).HasMaxLength(50).IsUnicode(false).HasColumnName("guest_duration");
            entity.Property(e => e.GuestDurationType).HasMaxLength(20).IsUnicode(false).HasColumnName("guest_duration_type");
            entity.Property(e => e.OwnerName).HasMaxLength(200).IsUnicode(false).HasColumnName("owner_name");
            entity.Property(e => e.RegisteredDate).HasMaxLength(50).IsUnicode(false).HasColumnName("registered_date");
        });

        modelBuilder.Entity<Pet>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Pets");
            entity.ToTable("pets");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Type).HasMaxLength(50).IsUnicode(false).HasColumnName("type");
            entity.Property(e => e.Breed).HasMaxLength(100).IsUnicode(false).HasColumnName("breed");
            entity.Property(e => e.Name).HasMaxLength(100).IsUnicode(false).HasColumnName("name");
            entity.Property(e => e.Color).HasMaxLength(100).IsUnicode(false).HasColumnName("color");
            entity.Property(e => e.Age).HasColumnName("age");
            entity.Property(e => e.Gender).HasMaxLength(20).IsUnicode(false).HasColumnName("gender");
            entity.Property(e => e.Vaccinated).HasMaxLength(20).IsUnicode(false).HasColumnName("vaccinated");
            entity.Property(e => e.Microchip).HasMaxLength(20).IsUnicode(false).HasColumnName("microchip");
            entity.Property(e => e.Neutered).HasMaxLength(20).IsUnicode(false).HasColumnName("neutered");
            entity.Property(e => e.Temperament).HasMaxLength(100).IsUnicode(false).HasColumnName("temperament");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.Photo).HasColumnName("photo");
            entity.Property(e => e.OwnerName).HasMaxLength(200).IsUnicode(false).HasColumnName("owner_name");
            entity.Property(e => e.RegisteredDate).HasMaxLength(50).IsUnicode(false).HasColumnName("registered_date");
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Posts");
            entity.ToTable("posts");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Title).HasMaxLength(250).IsUnicode(false).HasColumnName("title");
            entity.Property(e => e.Category).HasMaxLength(100).IsUnicode(false).HasColumnName("category");
            entity.Property(e => e.Status).HasMaxLength(50).IsUnicode(false).HasColumnName("status");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Author).HasMaxLength(100).IsUnicode(false).HasColumnName("author");
            entity.Property(e => e.Date).HasMaxLength(50).IsUnicode(false).HasColumnName("date");
            entity.Property(e => e.Helpful).HasColumnName("helpful");
            entity.Property(e => e.Image).HasColumnName("image");
            entity.Property(e => e.Location).HasMaxLength(200).IsUnicode(false).HasColumnName("location");
        });

        modelBuilder.Entity<Reply>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Replies");
            entity.ToTable("replies");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PostId).HasColumnName("post_id");
            entity.Property(e => e.Name).HasMaxLength(100).IsUnicode(false).HasColumnName("name");
            entity.Property(e => e.IsStaff).HasColumnName("is_staff");
            entity.Property(e => e.Date).HasMaxLength(50).IsUnicode(false).HasColumnName("date");
            entity.Property(e => e.Text).HasColumnName("text");

            entity.HasOne(d => d.Post)
                  .WithMany(p => p.Replies)
                  .HasForeignKey(d => d.PostId)
                  .HasConstraintName("FK_Replies_Posts");
        });

        modelBuilder.Entity<ConcernReport>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_ConcernReports");
            entity.ToTable("concern_reports");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Category).HasMaxLength(100).IsUnicode(false).HasColumnName("category");
            entity.Property(e => e.Address).HasMaxLength(200).IsUnicode(false).HasColumnName("address");
            entity.Property(e => e.Street).HasMaxLength(200).IsUnicode(false).HasColumnName("street");
            entity.Property(e => e.AdditionalLocation).HasMaxLength(500).IsUnicode(false).HasColumnName("additional_location");
            entity.Property(e => e.Latitude).HasColumnName("latitude");
            entity.Property(e => e.Longitude).HasColumnName("longitude");
            entity.Property(e => e.Anonymous).HasColumnName("anonymous");
            entity.Property(e => e.ReporterName).HasMaxLength(200).IsUnicode(false).HasColumnName("reporter_name");
            entity.Property(e => e.ReporterContact).HasMaxLength(200).IsUnicode(false).HasColumnName("reporter_contact");
            entity.Property(e => e.Photo).HasColumnName("photo");
            entity.Property(e => e.Timestamp).HasColumnName("timestamp");
            entity.Property(e => e.Reference).HasMaxLength(50).IsUnicode(false).HasColumnName("reference");
            entity.Property(e => e.Priority).HasMaxLength(20).IsUnicode(false).HasColumnName("priority").HasDefaultValue("medium");
            entity.Property(e => e.DetectedKeywords).HasColumnName("detected_keywords");
            entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(true);
            entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasColumnName("status").HasDefaultValue("open");
            entity.Property(e => e.StaffComment).HasColumnName("staff_comment");
            entity.Property(e => e.ResolvedBy).HasMaxLength(200).IsUnicode(false).HasColumnName("resolved_by");
            entity.Property(e => e.ResolvedAt).HasColumnName("resolved_at");
        });

        modelBuilder.Entity<KeywordDictionary>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_KeywordDictionary");
            entity.ToTable("keyword_dictionary");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Keyword).HasMaxLength(100).IsUnicode(true).HasColumnName("keyword");
            entity.Property(e => e.Severity).HasMaxLength(20).IsUnicode(false).HasColumnName("severity");
            entity.Property(e => e.Category).HasMaxLength(100).IsUnicode(false).HasColumnName("category");
            entity.Property(e => e.Language).HasMaxLength(10).IsUnicode(false).HasColumnName("language");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        });

        modelBuilder.Entity<Advertisement>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Advertisements");
            entity.ToTable("advertisements");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Type).HasMaxLength(50).IsUnicode(false).HasColumnName("type");
            entity.Property(e => e.Title).HasMaxLength(250).IsUnicode(false).HasColumnName("title");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Author).HasMaxLength(200).IsUnicode(false).HasColumnName("author");
            entity.Property(e => e.ContactName).HasMaxLength(200).IsUnicode(false).HasColumnName("contact_name");
            entity.Property(e => e.ContactPhone).HasMaxLength(50).IsUnicode(false).HasColumnName("contact_phone");
            entity.Property(e => e.ContactEmail).HasMaxLength(200).IsUnicode(false).HasColumnName("contact_email");
            entity.Property(e => e.ContactLink).HasMaxLength(500).IsUnicode(false).HasColumnName("contact_link");
            entity.Property(e => e.Price).HasMaxLength(100).IsUnicode(false).HasColumnName("price");
            entity.Property(e => e.Availability).HasMaxLength(200).IsUnicode(false).HasColumnName("availability");
            entity.Property(e => e.Image).HasColumnName("image");
            entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasColumnName("status").HasDefaultValue("pending");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.ReviewedAt).HasColumnName("reviewed_at");
            entity.Property(e => e.ReviewedBy).HasMaxLength(100).IsUnicode(false).HasColumnName("reviewed_by");
        });

        modelBuilder.Entity<Registration>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Registrations");
            entity.ToTable("registrations");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.FirstName).HasMaxLength(100).IsUnicode(false).HasColumnName("first_name");
            entity.Property(e => e.LastName).HasMaxLength(100).IsUnicode(false).HasColumnName("last_name");
            entity.Property(e => e.FullName).HasMaxLength(200).IsUnicode(false).HasColumnName("full_name");
            entity.Property(e => e.Email).HasMaxLength(100).IsUnicode(false).HasColumnName("email");
            entity.Property(e => e.Mobile).HasMaxLength(20).IsUnicode(false).HasColumnName("mobile");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.ResidentType).HasMaxLength(20).IsUnicode(false).HasColumnName("resident_type");
            entity.Property(e => e.Address).HasMaxLength(500).IsUnicode(false).HasColumnName("address");
            entity.Property(e => e.ProofOfResidencyPath).HasColumnName("proof_of_residency_path");
            entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasColumnName("status").HasDefaultValue("pending");
            entity.Property(e => e.SubmittedAt).HasColumnName("submitted_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.ReviewedAt).HasColumnName("reviewed_at");
            entity.Property(e => e.ReviewedBy).HasMaxLength(100).IsUnicode(false).HasColumnName("reviewed_by");
            entity.Property(e => e.RejectionReason).HasColumnName("rejection_reason");
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Reservations");
            entity.ToTable("reservations");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasMaxLength(100).IsUnicode(false).HasColumnName("user_id");
            entity.Property(e => e.ResidentName).HasMaxLength(200).IsUnicode(false).HasColumnName("resident_name");
            entity.Property(e => e.Amenity).HasMaxLength(100).IsUnicode(false).HasColumnName("amenity");
            entity.Property(e => e.Date).HasMaxLength(20).IsUnicode(false).HasColumnName("date");
            entity.Property(e => e.StartTime).HasMaxLength(10).IsUnicode(false).HasColumnName("start_time");
            entity.Property(e => e.EndTime).HasMaxLength(10).IsUnicode(false).HasColumnName("end_time");
            entity.Property(e => e.Purpose).HasMaxLength(100).IsUnicode(false).HasColumnName("purpose");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasColumnName("status").HasDefaultValue("pending");
            entity.Property(e => e.SubmittedAt).HasColumnName("submitted_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.ReviewedAt).HasColumnName("reviewed_at");
            entity.Property(e => e.ReviewedBy).HasMaxLength(100).IsUnicode(false).HasColumnName("reviewed_by");
            entity.Property(e => e.RejectionReason).HasColumnName("rejection_reason");
        });

        modelBuilder.Entity<Announcement>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Announcements");
            entity.ToTable("announcements");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Title).HasMaxLength(300).IsUnicode(false).HasColumnName("title");
            entity.Property(e => e.Body).HasColumnName("body");
            entity.Property(e => e.Category).HasMaxLength(100).IsUnicode(false).HasColumnName("category");
            entity.Property(e => e.PostedBy).HasMaxLength(100).IsUnicode(false).HasColumnName("posted_by");
            entity.Property(e => e.PostedAt).HasColumnName("posted_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasColumnName("status").HasDefaultValue("published");
            entity.Property(e => e.ScheduledAt).HasColumnName("scheduled_at");
        });

        modelBuilder.Entity<HoaEvent>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_HoaEvents");
            entity.ToTable("hoa_events");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Title).HasMaxLength(300).IsUnicode(false).HasColumnName("title");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Date).HasMaxLength(20).IsUnicode(false).HasColumnName("date");
            entity.Property(e => e.Time).HasMaxLength(10).IsUnicode(false).HasColumnName("time");
            entity.Property(e => e.Location).HasMaxLength(200).IsUnicode(false).HasColumnName("location");
            entity.Property(e => e.Category).HasMaxLength(100).IsUnicode(false).HasColumnName("category");
            entity.Property(e => e.CreatedBy).HasMaxLength(100).IsUnicode(false).HasColumnName("created_by");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<BodMember>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_BodMembers");
            entity.ToTable("bod_members");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasMaxLength(200).IsUnicode(false).HasColumnName("name");
            entity.Property(e => e.Position).HasMaxLength(100).IsUnicode(false).HasColumnName("position");
            entity.Property(e => e.Term).HasMaxLength(50).IsUnicode(false).HasColumnName("term");
            entity.Property(e => e.Phone).HasMaxLength(50).IsUnicode(false).HasColumnName("phone");
            entity.Property(e => e.Email).HasMaxLength(200).IsUnicode(false).HasColumnName("email");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<MeetingRecord>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_MeetingRecords");
            entity.ToTable("meeting_records");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Title).HasMaxLength(300).IsUnicode(false).HasColumnName("title");
            entity.Property(e => e.Date).HasMaxLength(20).IsUnicode(false).HasColumnName("date");
            entity.Property(e => e.Time).HasMaxLength(20).IsUnicode(false).HasColumnName("time");
            entity.Property(e => e.Location).HasMaxLength(200).IsUnicode(false).HasColumnName("location");
            entity.Property(e => e.Type).HasMaxLength(50).IsUnicode(false).HasColumnName("type");
            entity.Property(e => e.FilePath).HasColumnName("file_path");
            entity.Property(e => e.UploadedBy).HasMaxLength(100).IsUnicode(false).HasColumnName("uploaded_by");
            entity.Property(e => e.UploadedAt).HasColumnName("uploaded_at").HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<HoaDocument>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_HoaDocuments");
            entity.ToTable("hoa_documents");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasMaxLength(300).IsUnicode(false).HasColumnName("name");
            entity.Property(e => e.Category).HasMaxLength(100).IsUnicode(false).HasColumnName("category");
            entity.Property(e => e.FilePath).HasColumnName("file_path");
            entity.Property(e => e.UploadedBy).HasMaxLength(100).IsUnicode(false).HasColumnName("uploaded_by");
            entity.Property(e => e.UploadedAt).HasColumnName("uploaded_at").HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<Contact>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Contacts");
            entity.ToTable("contacts");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasMaxLength(200).IsUnicode(false).HasColumnName("name");
            entity.Property(e => e.Role).HasMaxLength(100).IsUnicode(false).HasColumnName("role");
            entity.Property(e => e.Phone).HasMaxLength(50).IsUnicode(false).HasColumnName("phone");
            entity.Property(e => e.Email).HasMaxLength(200).IsUnicode(false).HasColumnName("email");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
        });

        // Admin Dashboard Models Configuration
        modelBuilder.Entity<AdminRole>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_AdminRoles");
            entity.ToTable("admin_roles");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasMaxLength(100).IsUnicode(false).HasColumnName("name").IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500).IsUnicode(false).HasColumnName("description");
            entity.Property(e => e.IsProtected).HasColumnName("is_protected").HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasMany(r => r.Users)
                  .WithOne(u => u.Role)
                  .HasForeignKey(u => u.RoleId)
                  .HasConstraintName("FK_AdminUsers_AdminRoles");

            entity.HasMany(r => r.Permissions)
                  .WithOne(rp => rp.Role)
                  .HasForeignKey(rp => rp.RoleId)
                  .HasConstraintName("FK_RolePermissions_AdminRoles");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Permissions");
            entity.ToTable("permissions");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Module).HasMaxLength(100).IsUnicode(false).HasColumnName("module").IsRequired();
            entity.Property(e => e.Resource).HasMaxLength(100).IsUnicode(false).HasColumnName("resource").IsRequired();
            entity.Property(e => e.Action).HasMaxLength(50).IsUnicode(false).HasColumnName("action").IsRequired();
            entity.Property(e => e.PermissionKey).HasMaxLength(100).IsUnicode(false).HasColumnName("permission_key").IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500).IsUnicode(false).HasColumnName("description");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");

            entity.HasMany(p => p.RolePermissions)
                  .WithOne(rp => rp.Permission)
                  .HasForeignKey(rp => rp.PermissionId)
                  .HasConstraintName("FK_RolePermissions_Permissions");
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_RolePermissions");
            entity.ToTable("role_permissions");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.PermissionId).HasColumnName("permission_id");
            entity.Property(e => e.AccessLevel).HasMaxLength(20).IsUnicode(false).HasColumnName("access_level").HasDefaultValue("Full");
            entity.Property(e => e.AssignedAt).HasColumnName("assigned_at").HasDefaultValueSql("GETUTCDATE()");

            entity.HasIndex(e => new { e.RoleId, e.PermissionId })
                  .IsUnique()
                  .HasDatabaseName("UX_RolePermissions_RoleId_PermissionId");

            entity.HasOne(rp => rp.Role)
                  .WithMany(r => r.Permissions)
                  .HasForeignKey(rp => rp.RoleId)
                  .HasConstraintName("FK_RolePermissions_AdminRoles_RoleId");

            entity.HasOne(rp => rp.Permission)
                  .WithMany(p => p.RolePermissions)
                  .HasForeignKey(rp => rp.PermissionId)
                  .HasConstraintName("FK_RolePermissions_Permissions_PermissionId");
        });

        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_AdminUsers");
            entity.ToTable("admin_users");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasMaxLength(200).IsUnicode(false).HasColumnName("name").IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200).IsUnicode(false).HasColumnName("email").IsRequired();
            entity.Property(e => e.PhoneNumber).HasMaxLength(20).IsUnicode(false).HasColumnName("phone_number");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.LastLoginAt).HasColumnName("last_login_at");
            entity.Property(e => e.IPAddress).HasMaxLength(50).IsUnicode(false).HasColumnName("ip_address");
            entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasColumnName("status").HasDefaultValue("Active");
            entity.Property(e => e.IsSuspended).HasColumnName("is_suspended").HasDefaultValue(false);
            entity.Property(e => e.SuspendedUntil).HasColumnName("suspended_until");
            entity.Property(e => e.SuspensionReason).HasMaxLength(500).IsUnicode(false).HasColumnName("suspension_reason");

            entity.HasOne(u => u.Role)
                  .WithMany(r => r.Users)
                  .HasForeignKey(u => u.RoleId)
                  .HasConstraintName("FK_AdminUsers_AdminRoles_RoleId");

            entity.HasMany(u => u.AuditLogs)
                  .WithOne(a => a.AdminUser)
                  .HasForeignKey(a => a.AdminUserId)
                  .HasConstraintName("FK_AuditLogs_AdminUsers");

            entity.HasMany(u => u.SentInvitations)
                  .WithOne(si => si.InvitedByAdminUser)
                  .HasForeignKey(si => si.InvitedByAdminUserId)
                  .HasConstraintName("FK_StaffInvitations_AdminUsers");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_AuditLogs");
            entity.ToTable("audit_logs");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AdminUserId).HasColumnName("admin_user_id");
            entity.Property(e => e.Action).HasMaxLength(500).IsUnicode(false).HasColumnName("action").IsRequired();
            entity.Property(e => e.ActionCategory).HasMaxLength(50).IsUnicode(false).HasColumnName("action_category").IsRequired();
            entity.Property(e => e.TargetEntity).HasMaxLength(100).IsUnicode(false).HasColumnName("target_entity").IsRequired();
            entity.Property(e => e.TargetEntityId).HasMaxLength(50).IsUnicode(false).HasColumnName("target_entity_id").IsRequired();
            entity.Property(e => e.OldValue).HasColumnName("old_value");
            entity.Property(e => e.NewValue).HasColumnName("new_value");
            entity.Property(e => e.Timestamp).HasColumnName("timestamp").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.IPAddress).HasMaxLength(50).IsUnicode(false).HasColumnName("ip_address").IsRequired();
            entity.Property(e => e.UserAgent).HasMaxLength(500).IsUnicode(false).HasColumnName("user_agent");
            entity.Property(e => e.Outcome).HasMaxLength(20).IsUnicode(false).HasColumnName("outcome").HasDefaultValue("Success");
            entity.Property(e => e.Notes).HasMaxLength(500).IsUnicode(false).HasColumnName("notes");
            entity.Property(e => e.CreatedDate).HasColumnName("created_date").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.Month).HasColumnName("month");
            entity.Property(e => e.Year).HasColumnName("year");

            entity.HasOne(a => a.AdminUser)
                  .WithMany(u => u.AuditLogs)
                  .HasForeignKey(a => a.AdminUserId)
                  .HasConstraintName("FK_AuditLogs_AdminUsers_AdminUserId");

            entity.HasIndex(e => e.Timestamp).HasDatabaseName("IX_AuditLogs_Timestamp");
            entity.HasIndex(e => new { e.Year, e.Month }).HasDatabaseName("IX_AuditLogs_YearMonth");
        });

        modelBuilder.Entity<AdminSetting>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_AdminSettings");
            entity.ToTable("admin_settings");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SettingKey).HasMaxLength(100).IsUnicode(false).HasColumnName("setting_key").IsRequired();
            entity.Property(e => e.SettingValue).HasColumnName("setting_value").IsRequired();
            entity.Property(e => e.SettingType).HasMaxLength(20).IsUnicode(false).HasColumnName("setting_type").HasDefaultValue("String");
            entity.Property(e => e.Category).HasMaxLength(50).IsUnicode(false).HasColumnName("category").HasDefaultValue("General");
            entity.Property(e => e.Description).HasMaxLength(500).IsUnicode(false).HasColumnName("description");
            entity.Property(e => e.IsEditable).HasColumnName("is_editable").HasDefaultValue(true);
            entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            entity.Property(e => e.DisplayOrder).HasColumnName("display_order");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UpdatedByAdminUserId).HasColumnName("updated_by_admin_user_id");

            entity.HasIndex(e => e.SettingKey).IsUnique().HasDatabaseName("UX_AdminSettings_SettingKey");
        });

        modelBuilder.Entity<StaffInvitation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_StaffInvitations");
            entity.ToTable("staff_invitations");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.FullName).HasMaxLength(200).IsUnicode(false).HasColumnName("full_name").IsRequired();
            entity.Property(e => e.EmailAddress).HasMaxLength(200).IsUnicode(false).HasColumnName("email_address").IsRequired();
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.InvitedByAdminUserId).HasColumnName("invited_by_admin_user_id");
            entity.Property(e => e.InvitationToken).HasMaxLength(500).IsUnicode(false).HasColumnName("invitation_token").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
            entity.Property(e => e.AcceptedAt).HasColumnName("accepted_at");
            entity.Property(e => e.RejectedAt).HasColumnName("rejected_at");
            entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasColumnName("status").HasDefaultValue("Pending");
            entity.Property(e => e.PersonalMessage).HasColumnName("personal_message");
            entity.Property(e => e.ResendCount).HasColumnName("resend_count").HasDefaultValue(0);
            entity.Property(e => e.LastResendAt).HasColumnName("last_resend_at");

            entity.HasOne(si => si.Role)
                  .WithMany()
                  .HasForeignKey(si => si.RoleId)
                  .HasConstraintName("FK_StaffInvitations_AdminRoles");

            entity.HasOne(si => si.InvitedByAdminUser)
                  .WithMany(u => u.SentInvitations)
                  .HasForeignKey(si => si.InvitedByAdminUserId)
                  .HasConstraintName("FK_StaffInvitations_AdminUsers_InvitedBy");
        });

        modelBuilder.Entity<BanRecord>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_BanRecords");
            entity.ToTable("ban_records");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AccountName).HasMaxLength(200).IsUnicode(false).HasColumnName("account_name").IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200).IsUnicode(false).HasColumnName("email").IsRequired();
            entity.Property(e => e.ResidentId).HasColumnName("resident_id");
            entity.Property(e => e.BanReason).HasMaxLength(500).IsUnicode(false).HasColumnName("ban_reason").IsRequired();
            entity.Property(e => e.BannedByAdminUserId).HasColumnName("banned_by_admin_user_id");
            entity.Property(e => e.BannedAt).HasColumnName("banned_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UnbannedAt).HasColumnName("unbanned_at");
            entity.Property(e => e.Duration).HasMaxLength(50).IsUnicode(false).HasColumnName("duration").HasDefaultValue("Permanent");
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
            entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasColumnName("status").HasDefaultValue("Active");
            entity.Property(e => e.UnbanReason).HasMaxLength(500).IsUnicode(false).HasColumnName("unban_reason");
            entity.Property(e => e.UnbannedByAdminUserId).HasColumnName("unbanned_by_admin_user_id");

            entity.HasOne(b => b.BannedByAdminUser)
                  .WithMany()
                  .HasForeignKey(b => b.BannedByAdminUserId)
                  .HasConstraintName("FK_BanRecords_AdminUsers_BannedBy");

            entity.HasOne(b => b.UnbannedByAdminUser)
                  .WithMany()
                  .HasForeignKey(b => b.UnbannedByAdminUserId)
                  .HasConstraintName("FK_BanRecords_AdminUsers_UnbannedBy")
                  .IsRequired(false);
        });

        modelBuilder.Entity<BackupRecord>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_BackupRecords");
            entity.ToTable("backup_records");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BackupId).HasMaxLength(50).IsUnicode(false).HasColumnName("backup_id").IsRequired();
            entity.Property(e => e.BackupType).HasMaxLength(20).IsUnicode(false).HasColumnName("backup_type").HasDefaultValue("Auto");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.FilePath).HasMaxLength(500).IsUnicode(false).HasColumnName("file_path").IsRequired();
            entity.Property(e => e.FileSizeBytes).HasColumnName("file_size_bytes");
            entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasColumnName("status").HasDefaultValue("Success");
            entity.Property(e => e.CreatedByAdminUserId).HasColumnName("created_by_admin_user_id");
            entity.Property(e => e.ErrorMessage).HasMaxLength(500).IsUnicode(false).HasColumnName("error_message");
            entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
            entity.Property(e => e.RestoredAt).HasColumnName("restored_at");
            entity.Property(e => e.RestoredByAdminUserId).HasColumnName("restored_by_admin_user_id");
            entity.Property(e => e.RestoreNotes).HasMaxLength(500).IsUnicode(false).HasColumnName("restore_notes");
            entity.Property(e => e.Checksum).HasMaxLength(100).IsUnicode(false).HasColumnName("checksum");

            entity.HasOne(b => b.CreatedByAdminUser)
                  .WithMany()
                  .HasForeignKey(b => b.CreatedByAdminUserId)
                  .HasConstraintName("FK_BackupRecords_AdminUsers_CreatedBy")
                  .IsRequired(false);

            entity.HasIndex(e => e.BackupId).IsUnique().HasDatabaseName("UX_BackupRecords_BackupId");
        });

        modelBuilder.Entity<NotificationSubscriber>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_NotificationSubscribers");
            entity.ToTable("notification_subscribers");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ResidentName).HasMaxLength(200).IsUnicode(false).HasColumnName("resident_name");
            entity.Property(e => e.Email).HasMaxLength(200).IsUnicode(false).HasColumnName("email").IsRequired();
            entity.Property(e => e.DeviceInfo).HasMaxLength(300).IsUnicode(false).HasColumnName("device_info");
            entity.Property(e => e.SubscribedAt).HasColumnName("subscribed_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            entity.Property(e => e.UnsubscribedAt).HasColumnName("unsubscribed_at");
            entity.Property(e => e.LastNotifiedAt).HasColumnName("last_notified_at");
            entity.Property(e => e.NotificationsSentCount).HasColumnName("notifications_sent_count").HasDefaultValue(0);

            entity.HasIndex(e => e.Email).IsUnique().HasDatabaseName("UX_NotificationSubscribers_Email");
        });

        // Staff Dashboard - Tasks
        modelBuilder.Entity<Task>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Tasks");
            entity.ToTable("tasks");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Title).HasMaxLength(300).IsUnicode(false).HasColumnName("title").IsRequired();
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Category).HasMaxLength(50).IsUnicode(false).HasColumnName("category").HasDefaultValue("General");
            entity.Property(e => e.Priority).HasMaxLength(20).IsUnicode(false).HasColumnName("priority").HasDefaultValue("medium");
            entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasColumnName("status").HasDefaultValue("todo");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
            entity.Property(e => e.AssignedTo).HasMaxLength(200).IsUnicode(false).HasColumnName("assigned_to");
            entity.Property(e => e.AutoDeleteAfterDays).HasColumnName("auto_delete_after_days");
            entity.Property(e => e.Notes).HasMaxLength(500).IsUnicode(false).HasColumnName("notes");
        });

        // Landmark entity configuration
        modelBuilder.Entity<Landmark>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("landmarks");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasMaxLength(200).IsUnicode(false).HasColumnName("name").IsRequired();
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Category).HasMaxLength(100).IsUnicode(false).HasColumnName("category");
            entity.Property(e => e.Icon).HasMaxLength(100).IsUnicode(false).HasColumnName("icon");
            entity.Property(e => e.Latitude).HasPrecision(10, 8).HasColumnName("latitude");
            entity.Property(e => e.Longitude).HasPrecision(11, 8).HasColumnName("longitude");
            entity.Property(e => e.LocationNotes).HasMaxLength(500).IsUnicode(false).HasColumnName("location_notes");
            entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("GETUTCDATE()");
        });

        // Project entity configuration
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("projects");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Title).HasMaxLength(300).IsUnicode(false).HasColumnName("title").IsRequired();
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Status).HasMaxLength(50).IsUnicode(false).HasColumnName("status").HasDefaultValue("planned");
            entity.Property(e => e.Category).HasMaxLength(100).IsUnicode(false).HasColumnName("category");
            entity.Property(e => e.Location).HasMaxLength(300).IsUnicode(false).HasColumnName("location");
            entity.Property(e => e.Latitude).HasPrecision(10, 8).HasColumnName("latitude");
            entity.Property(e => e.Longitude).HasPrecision(11, 8).HasColumnName("longitude");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.Budget).HasPrecision(18, 2).HasColumnName("budget");
            entity.Property(e => e.ContactPerson).HasMaxLength(200).IsUnicode(false).HasColumnName("contact_person");
            entity.Property(e => e.ContactPhone).HasMaxLength(20).IsUnicode(false).HasColumnName("contact_phone");
            entity.Property(e => e.BeforePhotoUrl).HasColumnName("before_photo_url");
            entity.Property(e => e.AfterPhotoUrl).HasColumnName("after_photo_url");
            entity.Property(e => e.ProgressPercentage).HasColumnName("progress_percentage").HasDefaultValue(0);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("GETUTCDATE()");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
