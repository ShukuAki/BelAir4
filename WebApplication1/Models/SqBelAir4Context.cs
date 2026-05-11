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

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=DESKTOP-SV4QTVS;Database=SqBelAir4;User Id=sa;Password=P@ssw0rdSqL;TrustServerCertificate=True");

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

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
