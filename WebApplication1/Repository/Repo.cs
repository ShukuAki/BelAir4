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
            if (await _db.UserAccounts.AnyAsync())
                return;

            var users = new[]
            {
                new UserAccount { Username = "admin", Password = "admin", Type = 1 },
                new UserAccount { Username = "user", Password = "user", Type = 0 }
            };

            _db.UserAccounts.AddRange(users);
            await _db.SaveChangesAsync();
        }
    }
}