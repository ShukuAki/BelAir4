using Xunit;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repository;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace WebApplication1.Tests.Integration
{
    public class RepositoryIntegrationTests : IAsyncLifetime
    {
        private readonly SqBelAir4Context _context;
        private readonly Repo _repo;

        public RepositoryIntegrationTests()
        {
            var options = new DbContextOptionsBuilder<SqBelAir4Context>()
                .UseInMemoryDatabase(databaseName: $"TestDb_{System.Guid.NewGuid()}")
                .Options;

            _context = new SqBelAir4Context(options);
            _repo = new Repo(_context);
        }

        public async Task InitializeAsync()
        {
            // Seed test data
            await _context.SaveChangesAsync();
        }

        public async Task DisposeAsync()
        {
            await _context.DisposeAsync();
        }

        #region UserAccount Tests

        [Fact]
        public async Task AuthenticateAsync_WithValidCredentials_ReturnsUser()
        {
            // Arrange
            var user = new UserAccount 
            { 
                Username = "testuser", 
                Password = "hashedPassword123",
                Type = 1,
                IsBanned = false
            };
            _context.UserAccounts.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repo.AuthenticateAsync("testuser", "hashedPassword123");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("testuser", result.Username);
        }

        [Fact]
        public async Task AuthenticateAsync_WithInvalidPassword_ReturnsNull()
        {
            // Arrange
            var user = new UserAccount 
            { 
                Username = "testuser", 
                Password = "correctPassword",
                Type = 1,
                IsBanned = false
            };
            _context.UserAccounts.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repo.AuthenticateAsync("testuser", "wrongPassword");

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetByUsernameAsync_WithExistingUser_ReturnsUser()
        {
            // Arrange
            var user = new UserAccount 
            { 
                Username = "existinguser", 
                Password = "password",
                Type = 1,
                IsBanned = false
            };
            _context.UserAccounts.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repo.GetByUsernameAsync("existinguser");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("existinguser", result.Username);
        }

        [Fact]
        public async Task SetUserBanAsync_BansUser_Successfully()
        {
            // Arrange
            var user = new UserAccount 
            { 
                Username = "banneduser", 
                Password = "password",
                Type = 1,
                IsBanned = false
            };
            _context.UserAccounts.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repo.SetUserBanAsync("banneduser", true, null, "Violation");

            // Assert
            Assert.True(result);
            var bannedUser = await _repo.GetByUsernameAsync("banneduser");
            Assert.True(bannedUser?.IsBanned);
        }

        #endregion

        #region Forum Tests

        [Fact]
        public async Task CreatePostAsync_CreatesPost_Successfully()
        {
            // Arrange
            var post = new Post
            {
                Title = "Water pressure issue",
                Description = "Low water pressure on Block A",
                Category = "Infrastructure",
                Author = "testuser",
                Status = "open",
                Priority = "medium",
                IsPublic = true,
                CreatedAt = System.DateTime.UtcNow
            };

            // Act
            var result = await _repo.CreatePostAsync(post);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Id > 0);
            var retrieved = await _repo.GetPostByIdAsync(result.Id);
            Assert.NotNull(retrieved);
        }

        [Fact]
        public async Task GetPostsAsync_ReturnsAllPosts()
        {
            // Arrange
            var posts = new List<Post>
            {
                new Post { Title = "Post 1", Author = "user1", Description = "Desc 1", Status = "open", IsPublic = true, CreatedAt = System.DateTime.UtcNow },
                new Post { Title = "Post 2", Author = "user2", Description = "Desc 2", Status = "open", IsPublic = true, CreatedAt = System.DateTime.UtcNow }
            };
            _context.Posts.AddRange(posts);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repo.GetPostsAsync();

            // Assert
            Assert.True(result.Count >= 2);
        }

        [Fact]
        public async Task AddReplyAsync_AddsReply_Successfully()
        {
            // Arrange
            var post = new Post { Title = "Test", Author = "user", Description = "Desc", Status = "open", IsPublic = true, CreatedAt = System.DateTime.UtcNow };
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            var reply = new Reply
            {
                PostId = post.Id,
                Name = "replier",
                Text = "Great idea",
                Date = System.DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                IsStaff = false
            };

            // Act
            var result = await _repo.AddReplyAsync(reply);

            // Assert
            Assert.True(result);
            var retrieved = await _repo.GetPostByIdAsync(post.Id);
            Assert.NotEmpty(retrieved?.Replies ?? new List<Reply>());
        }

        #endregion

        #region Concern Report Tests

        [Fact]
        public async Task CreateReportAsync_CreatesReport_Successfully()
        {
            // Arrange
            var report = new ConcernReport
            {
                Description = "Flooding in parking lot",
                Category = "Infrastructure",
                Address = "Main Street",
                Priority = "high",
                Status = "open",
                Timestamp = System.DateTime.UtcNow,
                Anonymous = false,
                IsPublic = true
            };

            // Act
            var result = await _repo.CreateReportAsync(report);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Id > 0);
        }

        [Fact]
        public async Task UpdateReportStatusAsync_UpdatesStatus_Successfully()
        {
            // Arrange
            var report = new ConcernReport
            {
                Description = "Issue",
                Category = "Maintenance",
                Status = "open",
                Timestamp = System.DateTime.UtcNow,
                IsPublic = true
            };
            _context.ConcernReports.Add(report);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repo.UpdateReportStatusAsync(report.Id, "in-progress", "Working on it", "staff1");

            // Assert
            Assert.True(result);
            var updated = await _repo.GetReportByIdAsync(report.Id);
            Assert.Equal("in-progress", updated?.Status);
        }

        [Fact]
        public async Task GetReportsByPriorityAsync_FiltersByPriority()
        {
            // Arrange
            var reports = new List<ConcernReport>
            {
                new ConcernReport { Description = "High priority", Priority = "high", Status = "open", Timestamp = System.DateTime.UtcNow, IsPublic = true },
                new ConcernReport { Description = "Low priority", Priority = "low", Status = "open", Timestamp = System.DateTime.UtcNow, IsPublic = true }
            };
            _context.ConcernReports.AddRange(reports);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repo.GetReportsByPriorityAsync("high");

            // Assert
            Assert.True(result.Any());
            Assert.All(result, r => Assert.Equal("high", r.Priority));
        }

        #endregion

        #region Keyword Dictionary Tests

        [Fact]
        public async Task CreateKeywordAsync_CreatesKeyword_Successfully()
        {
            // Arrange
            var keyword = new KeywordDictionary
            {
                Keyword = "fire",
                Severity = "high",
                IsActive = true
            };

            // Act
            var result = await _repo.CreateKeywordAsync(keyword);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Id > 0);
        }

        [Fact]
        public async Task GetActiveKeywordsAsync_ReturnsOnlyActiveKeywords()
        {
            // Arrange
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Keyword = "fire", Severity = "high", IsActive = true },
                new KeywordDictionary { Keyword = "test", Severity = "low", IsActive = false }
            };
            _context.KeywordDictionaries.AddRange(keywords);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repo.GetActiveKeywordsAsync();

            // Assert
            Assert.NotEmpty(result);
            Assert.All(result, k => Assert.True(k.IsActive));
        }

        #endregion

        #region Reservation Tests

        [Fact]
        public async Task CreateReservationAsync_CreatesReservation_Successfully()
        {
            // Arrange
            var reservation = new Reservation
            {
                Amenity = "Community Center",
                Date = "2025-02-15",
                StartTime = "14:00",
                EndTime = "16:00",
                UserId = "testuser",
                Status = "pending"
            };

            // Act
            var result = await _repo.CreateReservationAsync(reservation);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Id > 0);
        }

        [Fact]
        public async Task GetReservationsByStatusAsync_FiltersByStatus()
        {
            // Arrange
            var reservations = new List<Reservation>
            {
                new Reservation { Amenity = "Gym", Date = "2025-02-15", Status = "pending", UserId = "user1" },
                new Reservation { Amenity = "Pool", Date = "2025-02-16", Status = "approved", UserId = "user2" }
            };
            _context.Reservations.AddRange(reservations);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repo.GetReservationsByStatusAsync("approved");

            // Assert
            Assert.NotEmpty(result);
            Assert.All(result, r => Assert.Equal("approved", r.Status));
        }

        #endregion

        #region Vehicle Tests

        [Fact]
        public async Task CreateVehicleAsync_CreatesVehicle_Successfully()
        {
            // Arrange
            var vehicle = new Vehicle
            {
                Type = "Car",
                Brand = "Honda",
                Model = "Civic",
                PlateNumber = "ABC123",
                Color = "Blue",
                Year = "2022"
            };

            // Act
            var result = await _repo.CreateVehicleAsync(vehicle);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Id > 0);
        }

        #endregion

        #region Pet Tests

        [Fact]
        public async Task CreatePetAsync_CreatesPet_Successfully()
        {
            // Arrange
            var pet = new Pet
            {
                Type = "Dog",
                Breed = "Golden Retriever",
                Name = "Max",
                Age = 3,
                Vaccinated = "Yes"
            };

            // Act
            var result = await _repo.CreatePetAsync(pet);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Id > 0);
        }

        #endregion
    }
}
