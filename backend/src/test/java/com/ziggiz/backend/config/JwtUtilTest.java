package com.ziggiz.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * UNIT TESTS FOR JwtUtil
 * ======================
 * PHILOSOPHY: Test the JWT utility in complete isolation.
 * JwtUtil has no external dependencies (no database, no HTTP),
 * so we can test it directly without mocking.
 *
 * WHY THIS MATTERS:
 * - JWT tokens are the backbone of authentication
 * - A bug here means either: broken auth or security vulnerability
 * - These tests verify the contract: generate -> parse -> extract
 *
 * TEST NAMING CONVENTION:
 * method_name - scenario - expected_behavior
 * Example: generateToken_withValidInputs_returnsNonEmptyString
 */
class JwtUtilTest {

    // We create a REAL JwtUtil instance - no mocking needed
    // This is called "White Box Testing" - we know the internal config
    private JwtUtil jwtUtil;

    // Test constants - realistic values matching production config
    private static final String TEST_SECRET = "test-secret-key-that-is-long-enough-for-hmac-sha256";
    private static final long TEST_EXPIRATION_MS = 86400000; // 24 hours
    private static final Long TEST_USER_ID = 1L;
    private static final String TEST_EMAIL = "admin@ziggiz.com";
    private static final String TEST_ROLE = "ADMIN";

    @BeforeEach
    void setUp() {
        // Fresh instance for each test - ensures test isolation
        // If one test modifies state, it won't affect others
        jwtUtil = new JwtUtil(TEST_SECRET, TEST_EXPIRATION_MS);
    }

    @Nested
    @DisplayName("generateToken() tests")
    class GenerateTokenTests {

        @Test
        @DisplayName("should return non-empty string for valid inputs")
        void generateToken_withValidInputs_returnsNonEmptyString() {
            // ARRANGE - set up test data
            // (already done in setUp)

            // ACT - call the method under test
            String token = jwtUtil.generateToken(TEST_USER_ID, TEST_EMAIL, TEST_ROLE);

            // ASSERT - verify the result
            assertNotNull(token, "Token should not be null");
            assertFalse(token.isEmpty(), "Token should not be empty");
            // JWT tokens have 3 parts separated by dots: header.payload.signature
            assertTrue(token.split("\\.").length == 3, "Token should have 3 parts (header.payload.signature)");
        }

        @Test
        @DisplayName("should generate different tokens for different users")
        void generateToken_forDifferentUsers_returnsDifferentTokens() {
            // ARRANGE
            String email1 = "user1@example.com";
            String email2 = "user2@example.com";

            // ACT
            String token1 = jwtUtil.generateToken(1L, email1, "CLIENT");
            String token2 = jwtUtil.generateToken(2L, email2, "CLIENT");

            // ASSERT
            assertNotEquals(token1, token2, "Different users should get different tokens");
            // WHY: If two users get the same token, one could impersonate the other
        }

        @Test
        @DisplayName("should generate different tokens for same user at different times")
        void generateToken_forSameUserAtDifferentTimes_returnsDifferentTokens() {
            // ARRANGE & ACT
            // Generate two tokens in rapid succession
            String token1 = jwtUtil.generateToken(TEST_USER_ID, TEST_EMAIL, TEST_ROLE);
            String token2 = jwtUtil.generateToken(TEST_USER_ID, TEST_EMAIL, TEST_ROLE);

            // ASSERT
            // JWT includes 'iat' (issued at) timestamp, so tokens should differ
            // This prevents replay attacks - an old token can't be reused
            assertNotEquals(token1, token2, "Same user should get different tokens (different iat)");
        }
    }

    @Nested
    @DisplayName("parseToken() tests")
    class ParseTokenTests {

        @Test
        @DisplayName("should parse a valid token and return correct claims")
        void parseToken_withValidToken_returnsCorrectClaims() {
            // ARRANGE
            String token = jwtUtil.generateToken(TEST_USER_ID, TEST_EMAIL, TEST_ROLE);

            // ACT
            Claims claims = jwtUtil.parseToken(token);

            // ASSERT
            assertEquals(TEST_EMAIL, claims.getSubject(), "Email should match");
            assertEquals(TEST_USER_ID, claims.get("userId", Long.class), "User ID should match");
            assertEquals(TEST_ROLE, claims.get("role", String.class), "Role should match");
            assertNotNull(claims.getExpiration(), "Expiration should be set");
            assertNotNull(claims.getIssuedAt(), "Issued at should be set");
        }

        @Test
        @DisplayName("should throw exception for invalid token")
        void parseToken_withInvalidToken_throwsException() {
            // ARRANGE
            String invalidToken = "invalid.token.here";

            // ACT & ASSERT
            // We expect an exception - this is "Negative Testing"
            // We test that the system correctly rejects bad input
            assertThrows(MalformedJwtException.class, () -> {
                jwtUtil.parseToken(invalidToken);
            }, "Invalid token should throw MalformedJwtException");
        }

        @Test
        @DisplayName("should throw exception for empty string")
        void parseToken_withEmptyString_throwsException() {
            // ARRANGE
            String emptyToken = "";

            // ACT & ASSERT
            assertThrows(Exception.class, () -> {
                jwtUtil.parseToken(emptyToken);
            }, "Empty token should throw exception");
        }
    }

    @Nested
    @DisplayName("isValid() tests")
    class IsValidTests {

        @Test
        @DisplayName("should return true for valid non-expired token")
        void isValid_withValidToken_returnsTrue() {
            // ARRANGE
            String token = jwtUtil.generateToken(TEST_USER_ID, TEST_EMAIL, TEST_ROLE);

            // ACT
            boolean isValid = jwtUtil.isValid(token);

            // ASSERT
            assertTrue(isValid, "Valid token should return true");
        }

        @Test
        @DisplayName("should return false for expired token")
        void isValid_withExpiredToken_returnsFalse() {
            // ARRANGE
            // Create JwtUtil with 0ms expiration - token expires immediately
            JwtUtil expiredJwtUtil = new JwtUtil(TEST_SECRET, 0);
            String token = expiredJwtUtil.generateToken(TEST_USER_ID, TEST_EMAIL, TEST_ROLE);

            // ACT
            boolean isValid = jwtUtil.isValid(token);

            // ASSERT
            assertFalse(isValid, "Expired token should return false");
            // WHY THIS MATTERS: If expired tokens are accepted,
            // attackers can use stolen tokens forever
        }

        @Test
        @DisplayName("should return false for tampered token")
        void isValid_withTamperedToken_returnsFalse() {
            // ARRANGE
            String token = jwtUtil.generateToken(TEST_USER_ID, TEST_EMAIL, TEST_ROLE);
            // Tamper with the token by changing a character
            String tamperedToken = token.substring(0, token.length() - 5) + "XXXXX";

            // ACT
            boolean isValid = jwtUtil.isValid(tamperedToken);

            // ASSERT
            assertFalse(isValid, "Tampered token should return false");
            // WHY THIS MATTERS: If tampered tokens are accepted,
            // anyone could modify tokens to change their claims
        }
    }

    @Nested
    @DisplayName("getEmail() tests")
    class GetEmailTests {

        @Test
        @DisplayName("should extract correct email from token")
        void getEmail_fromValidToken_returnsCorrectEmail() {
            // ARRANGE
            String token = jwtUtil.generateToken(TEST_USER_ID, TEST_EMAIL, TEST_ROLE);

            // ACT
            String email = jwtUtil.getEmail(token);

            // ASSERT
            assertEquals(TEST_EMAIL, email, "Email should match the one used to generate token");
        }
    }

    @Nested
    @DisplayName("getRole() tests")
    class GetRoleTests {

        @Test
        @DisplayName("should extract correct role from token")
        void getRole_fromValidToken_returnsCorrectRole() {
            // ARRANGE
            String token = jwtUtil.generateToken(TEST_USER_ID, TEST_EMAIL, TEST_ROLE);

            // ACT
            String role = jwtUtil.getRole(token);

            // ASSERT
            assertEquals(TEST_ROLE, role, "Role should match the one used to generate token");
        }

        @Test
        @DisplayName("should extract CLIENT role correctly")
        void getRole_fromClientToken_returnsCLIENT() {
            // ARRANGE
            String clientRole = "CLIENT";
            String token = jwtUtil.generateToken(TEST_USER_ID, TEST_EMAIL, clientRole);

            // ACT
            String role = jwtUtil.getRole(token);

            // ASSERT
            assertEquals(clientRole, role, "CLIENT role should be extracted correctly");
        }
    }

    @Nested
    @DisplayName("getUserId() tests")
    class GetUserIdTests {

        @Test
        @DisplayName("should extract correct user ID from token")
        void getUserId_fromValidToken_returnsCorrectId() {
            // ARRANGE
            String token = jwtUtil.generateToken(TEST_USER_ID, TEST_EMAIL, TEST_ROLE);

            // ACT
            Long userId = jwtUtil.getUserId(token);

            // ASSERT
            assertEquals(TEST_USER_ID, userId, "User ID should match the one used to generate token");
        }
    }
}
