using Xunit;
using WebApplication1.Models;
using WebApplication1.Services;
using System.Collections.Generic;
using System.Linq;

namespace WebApplication1.Tests.Services
{
    public class KeywordAnalysisServiceTests
    {
        private readonly KeywordAnalysisService _service;

        public KeywordAnalysisServiceTests()
        {
            _service = new KeywordAnalysisService();
        }

        #region DeterminePriority Tests

        [Fact]
        public void DeterminePriority_WithHighSeverityKeyword_ReturnsHigh()
        {
            // Arrange
            var description = "There is a fire emergency at the community center";
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Id = 1, Keyword = "fire", Severity = "high", IsActive = true },
                new KeywordDictionary { Id = 2, Keyword = "emergency", Severity = "high", IsActive = true }
            };

            // Act
            var result = _service.DeterminePriority(description, keywords);

            // Assert
            Assert.Equal("high", result);
        }

        [Fact]
        public void DeterminePriority_WithMediumSeverityKeyword_ReturnsMedium()
        {
            // Arrange
            var description = "The pothole on Maple Street is getting bigger";
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Id = 1, Keyword = "pothole", Severity = "medium", IsActive = true }
            };

            // Act
            var result = _service.DeterminePriority(description, keywords);

            // Assert
            Assert.Equal("medium", result);
        }

        [Fact]
        public void DeterminePriority_WithLowSeverityKeyword_ReturnsLow()
        {
            // Arrange
            var description = "We should add more flowers to the landscaping";
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Id = 1, Keyword = "flowers", Severity = "low", IsActive = true }
            };

            // Act
            var result = _service.DeterminePriority(description, keywords);

            // Assert
            Assert.Equal("low", result);
        }

        [Fact]
        public void DeterminePriority_WithNullDescription_ReturnsMedium()
        {
            // Arrange
            var keywords = new List<KeywordDictionary>();

            // Act
            var result = _service.DeterminePriority(null, keywords);

            // Assert
            Assert.Equal("medium", result);
        }

        [Fact]
        public void DeterminePriority_WithEmptyKeywordList_ReturnsMedium()
        {
            // Arrange
            var description = "Any description";
            var keywords = new List<KeywordDictionary>();

            // Act
            var result = _service.DeterminePriority(description, keywords);

            // Assert
            Assert.Equal("medium", result);
        }

        [Fact]
        public void DeterminePriority_WithMultipleSeverities_ReturnsHighest()
        {
            // Arrange
            var description = "Pothole near fire exit, flooding in garage";
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Id = 1, Keyword = "pothole", Severity = "medium", IsActive = true },
                new KeywordDictionary { Id = 2, Keyword = "flooding", Severity = "high", IsActive = true }
            };

            // Act
            var result = _service.DeterminePriority(description, keywords);

            // Assert
            Assert.Equal("high", result);
        }

        [Fact]
        public void DeterminePriority_WithInactiveKeywords_IgnoresThem()
        {
            // Arrange
            var description = "There is a fire";
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Id = 1, Keyword = "fire", Severity = "high", IsActive = false }
            };

            // Act
            var result = _service.DeterminePriority(description, keywords);

            // Assert
            Assert.Equal("medium", result);
        }

        #endregion

        #region ExtractMatchedKeywords Tests

        [Fact]
        public void ExtractMatchedKeywords_WithMatchingKeywords_ReturnsMatches()
        {
            // Arrange
            var description = "There is a fire and flooding at the community center";
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Id = 1, Keyword = "fire", Severity = "high", IsActive = true },
                new KeywordDictionary { Id = 2, Keyword = "flooding", Severity = "high", IsActive = true }
            };

            // Act
            var result = _service.ExtractMatchedKeywords(description, keywords);

            // Assert
            Assert.NotEmpty(result);
            Assert.Contains("fire", result);
            Assert.Contains("flooding", result);
        }

        [Fact]
        public void ExtractMatchedKeywords_CaseInsensitive_ReturnsMatches()
        {
            // Arrange
            var description = "FIRE at building";
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Id = 1, Keyword = "fire", Severity = "high", IsActive = true }
            };

            // Act
            var result = _service.ExtractMatchedKeywords(description, keywords);

            // Assert
            Assert.Contains("fire", result);
        }

        [Fact]
        public void ExtractMatchedKeywords_NoMatches_ReturnsEmpty()
        {
            // Arrange
            var description = "Everything is fine";
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Id = 1, Keyword = "fire", Severity = "high", IsActive = true }
            };

            // Act
            var result = _service.ExtractMatchedKeywords(description, keywords);

            // Assert
            Assert.Empty(result);
        }

        [Fact]
        public void ExtractMatchedKeywords_WithNullDescription_ReturnsEmpty()
        {
            // Arrange
            var keywords = new List<KeywordDictionary>
            {
                new KeywordDictionary { Id = 1, Keyword = "fire", Severity = "high", IsActive = true }
            };

            // Act
            var result = _service.ExtractMatchedKeywords(null, keywords);

            // Assert
            Assert.Empty(result);
        }

        #endregion

        #region CalculatePriorityScore Tests

        [Fact]
        public void CalculatePriorityScore_HighPriority_Returns3()
        {
            // Act
            var result = _service.CalculatePriorityScore("high");

            // Assert
            Assert.Equal(3.0, result);
        }

        [Fact]
        public void CalculatePriorityScore_MediumPriority_Returns2()
        {
            // Act
            var result = _service.CalculatePriorityScore("medium");

            // Assert
            Assert.Equal(2.0, result);
        }

        [Fact]
        public void CalculatePriorityScore_LowPriority_Returns1()
        {
            // Act
            var result = _service.CalculatePriorityScore("low");

            // Assert
            Assert.Equal(1.0, result);
        }

        [Fact]
        public void CalculatePriorityScore_InvalidPriority_ReturnsMedium()
        {
            // Act
            var result = _service.CalculatePriorityScore("invalid");

            // Assert
            Assert.Equal(2.0, result);
        }

        [Fact]
        public void CalculatePriorityScore_CaseInsensitive_ReturnsCorrectValue()
        {
            // Act
            var result = _service.CalculatePriorityScore("HIGH");

            // Assert
            Assert.Equal(3.0, result);
        }

        #endregion
    }
}
