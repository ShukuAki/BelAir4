using Xunit;
using Moq;
using WebApplication1.Controllers;
using WebApplication1.Repository;
using WebApplication1.Services;
using WebApplication1.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebApplication1.Tests.Controllers
{
    public class HomeControllerUnitTests
    {
        private readonly Mock<IRepo> _mockRepo;
        private readonly Mock<IAiAnalysisService> _mockAiService;
        private readonly Mock<ILogger<HomeController>> _mockLogger;
        private readonly HomeController _controller;

        public HomeControllerUnitTests()
        {
            _mockRepo = new Mock<IRepo>();
            _mockAiService = new Mock<IAiAnalysisService>();
            _mockLogger = new Mock<ILogger<HomeController>>();
            _controller = new HomeController(_mockRepo.Object, _mockAiService.Object, _mockLogger.Object);

            // Setup default HttpContext
            var httpContext = new DefaultHttpContext();
            var session = new Mock<ISession>();
            httpContext.Session = session.Object;
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };
        }

        #region Authentication Tests

        [Fact]
        public void Login_Get_ReturnsLoginView()
        {
            // Act
            var result = _controller.login();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(viewResult);
        }

        [Fact]
        public async Task Login_Post_WithValidCredentials_RedirectsToDashboard()
        {
            // Arrange
            var user = new UserAccount 
            { 
                Id = 1, 
                Username = "testuser", 
                Type = 1,
                Password = "password123"
            };
            _mockRepo.Setup(r => r.AuthenticateAsync("testuser", "password123"))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.Login("testuser", "password123");

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal("Index", redirectResult.ActionName);
        }

        [Fact]
        public async Task Login_Post_WithInvalidCredentials_ReturnsLoginViewWithError()
        {
            // Arrange
            _mockRepo.Setup(r => r.AuthenticateAsync("testuser", "wrongpassword"))
                .ReturnsAsync((UserAccount?)null);

            // Act
            var result = await _controller.Login("testuser", "wrongpassword");

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.False(_controller.ModelState.IsValid);
        }

        [Fact]
        public async Task Login_Post_WithEmptyUsername_ReturnError()
        {
            // Act
            var result = await _controller.Login("", "password");

            // Assert
            Assert.False(_controller.ModelState.IsValid);
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(viewResult);
        }

        [Fact]
        public async Task Login_Post_AdminUser_RedirectsToAdminDashboard()
        {
            // Arrange
            var adminUser = new UserAccount 
            { 
                Id = 3, 
                Username = "admin", 
                Type = 3,
                Password = "adminpass"
            };
            _mockRepo.Setup(r => r.AuthenticateAsync("admin", "adminpass"))
                .ReturnsAsync(adminUser);

            // Act
            var result = await _controller.Login("admin", "adminpass");

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal("adminDashboard", redirectResult.ActionName);
        }

        [Fact]
        public async Task Login_Post_StaffUser_RedirectsToStaffDashboard()
        {
            // Arrange
            var staffUser = new UserAccount 
            { 
                Id = 2, 
                Username = "staff", 
                Type = 2,
                Password = "staffpass"
            };
            _mockRepo.Setup(r => r.AuthenticateAsync("staff", "staffpass"))
                .ReturnsAsync(staffUser);

            // Act
            var result = await _controller.Login("staff", "staffpass");

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal("staffDashboard", redirectResult.ActionName);
        }

        #endregion

        #region Page Route Tests

        [Fact]
        public void Index_ReturnsView()
        {
            // Act
            var result = _controller.Index();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(viewResult);
        }

        [Fact]
        public void AboutLagunaBelAir_ReturnsView()
        {
            // Act
            var result = _controller.aboutLagunaBelAir();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(viewResult);
        }

        [Fact]
        public void Forums_ReturnsView()
        {
            // Act
            var result = _controller.forums();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(viewResult);
        }

        [Fact]
        public void ReportConcerns_ReturnsView()
        {
            // Act
            var result = _controller.reportConcerns();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(viewResult);
        }

        #endregion

        #region Authorization Tests

        [Fact]
        public void StaffDashboard_ReturnsView()
        {
            // Act
            var result = _controller.staffDashboard();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(viewResult);
        }

        #endregion
    }

    public class ApiControllerUnitTests
    {
        private readonly Mock<IRepo> _mockRepo;
        private readonly Mock<IKeywordAnalysisService> _mockKeywordService;
        private readonly Mock<IAiAnalysisService> _mockAiService;
        private readonly Mock<ILogger<ApiController>> _mockLogger;
        private readonly ApiController _controller;

        public ApiControllerUnitTests()
        {
            _mockRepo = new Mock<IRepo>();
            _mockKeywordService = new Mock<IKeywordAnalysisService>();
            _mockAiService = new Mock<IAiAnalysisService>();
            _mockLogger = new Mock<ILogger<ApiController>>();
            _controller = new ApiController(_mockRepo.Object, _mockKeywordService.Object, _mockAiService.Object, _mockLogger.Object);
        }

        #region Keyword API Tests

        [Fact]
        public async Task GetKeywords_ReturnsOkWithData()
        {
            // Arrange
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Id = 1, Keyword = "fire", Severity = "high" }
            };
            _mockRepo.Setup(r => r.GetKeywordsAsync()).ReturnsAsync(keywords);

            // Act
            var result = await _controller.GetKeywords();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetActiveKeywords_ReturnsOnlyActiveKeywords()
        {
            // Arrange
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Id = 1, Keyword = "fire", Severity = "high", IsActive = true }
            };
            _mockRepo.Setup(r => r.GetActiveKeywordsAsync()).ReturnsAsync(keywords);

            // Act
            var result = await _controller.GetActiveKeywords();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        #endregion
    }
}
