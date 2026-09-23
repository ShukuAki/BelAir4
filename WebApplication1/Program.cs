using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Repository;
using WebApplication1.Services;


using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Register DbContext with configuration-based connection string.
builder.Services.AddDbContext<SqBelAir4Context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register repository
builder.Services.AddScoped<IRepo, Repo>();

// Register KeywordAnalysisService for priority detection
builder.Services.AddScoped<IKeywordAnalysisService, KeywordAnalysisService>();

// Register Ollama AI services for keyword extraction and priority determination
builder.Services.AddHttpClient(); // registers IHttpClientFactory
builder.Services.AddHttpClient("ollama", client =>
{
    // Generous timeout: model generation can take a while, but probing
    // unreachable endpoints still fails fast (connection refused / DNS).
    client.Timeout = System.TimeSpan.FromSeconds(120);
});
builder.Services.AddScoped<OllamaAiService>();
builder.Services.AddScoped<HybridAiService>();
builder.Services.AddScoped<IAiAnalysisService>(sp => sp.GetRequiredService<HybridAiService>());

// Session used by login action
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = System.TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// Ensure DB has a seeded admin user (run on startup)
using (var scope = app.Services.CreateScope())
{
    var repo = scope.ServiceProvider.GetRequiredService<IRepo>();
    // Block on the async seed to keep Program.cs simple
    repo.SeedAsync().GetAwaiter().GetResult();

    // Seed permissions and assign to super admin
    PermissionSeeder.SeedPermissionsAsync(repo).GetAwaiter().GetResult();
    PermissionSeeder.AssignDefaultPermissionsToSuperAdminAsync(repo).GetAwaiter().GetResult();
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// Attach security headers to every response.
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    headers["Permissions-Policy"] = "geolocation=(self), camera=(), microphone=()";
    headers["Content-Security-Policy"] =
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
        "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none'";
    await next();
});

app.UseRouting();

// enable session before auth
app.UseSession();

// Enable admin audit logging middleware
app.UseMiddleware<AdminAuditMiddleware>();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();