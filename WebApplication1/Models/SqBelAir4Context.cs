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

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
