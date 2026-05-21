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

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=localhost;Database=SqBelAir4;User Id=sa;Password=P@ssw0rdSqL;TrustServerCertificate=True");

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

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
