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
        Task SeedAsync();
        // Forum
        Task<List<Post>> GetPostsAsync();
        Task<Post?> GetPostByIdAsync(int id);
        Task<Post> CreatePostAsync(Post post);
        Task<bool> AddReplyAsync(Reply reply);
        Task<bool> MarkHelpfulAsync(int postId);
        // Vehicles & Pets
        Task<List<Models.Vehicle>> GetVehiclesAsync();
        Task<Models.Vehicle> CreateVehicleAsync(Models.Vehicle vehicle);
        Task<List<Models.Pet>> GetPetsAsync();
        Task<Models.Pet> CreatePetAsync(Models.Pet pet);
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

        // Simple seeding example to trigger DB operations on startup or as-needed.
        public async Task SeedAsync()
        {
            if (!await _db.UserAccounts.AnyAsync())
            {
                var users = new[]
                {
                    new UserAccount { Username = "admin", Password = "admin", Type = 1 },
                    new UserAccount { Username = "user", Password = "user", Type = 0 }
                };
                _db.UserAccounts.AddRange(users);
            }

            // No forum/forum post seeding here. Forum data is persisted only in the database and
            // should not be initialized from code. Remove any hard-coded forum sample data.

            await _db.SaveChangesAsync();
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
    }
}