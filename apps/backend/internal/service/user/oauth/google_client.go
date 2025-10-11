package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
	"google.golang.org/api/idtoken"
)

// GoogleClient handles Google OAuth operations với validation và logging
//
// Business Logic:
// - Verify Google ID tokens
// - Exchange authorization codes for tokens
// - Fetch user information from Google
// - Refresh access tokens
// - Generate OAuth authorization URLs
type GoogleClient struct {
	clientID     string
	clientSecret string
	redirectURI  string
	logger       *logrus.Logger
}

// GoogleUserInfo represents user information from Google
type GoogleUserInfo struct {
	ID            string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Locale        string `json:"locale"`
}

// TokenResponse from Google OAuth
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
	IDToken      string `json:"id_token"`
	Scope        string `json:"scope"`
}

// NewGoogleClient creates a new Google OAuth client với logger
//
// Parameters:
//   - clientID: Google OAuth client ID
//   - clientSecret: Google OAuth client secret
//   - redirectURI: OAuth redirect URI
//   - logger: Logger instance (optional, will create default if nil)
//
// Returns:
//   - *GoogleClient: Configured Google client instance
func NewGoogleClient(clientID, clientSecret, redirectURI string, logger *logrus.Logger) *GoogleClient {
	// Create default logger if not provided
	if logger == nil {
		logger = logrus.New()
		logger.SetLevel(logrus.InfoLevel)
		logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
		})
	}

	return &GoogleClient{
		clientID:     clientID,
		clientSecret: clientSecret,
		redirectURI:  redirectURI,
		logger:       logger,
	}
}

// VerifyIDToken verifies a Google ID token and returns user info với validation và logging
//
// Business Logic:
// - Validate ID token với Google's idtoken package
// - Extract user information từ token claims
// - Return user info hoặc error
//
// Parameters:
//   - ctx: Context với timeout và cancellation
//   - idToken: Google ID token từ frontend
//
// Returns:
//   - *GoogleUserInfo: User information từ Google
//   - error: Validation error hoặc network error
func (c *GoogleClient) VerifyIDToken(ctx context.Context, idToken string) (*GoogleUserInfo, error) {
	// Validate input
	if idToken == "" {
		c.logger.Error("Empty ID token provided")
		return nil, fmt.Errorf("ID token cannot be empty")
	}

	c.logger.WithFields(logrus.Fields{
		"operation": "VerifyIDToken",
	}).Debug("Verifying Google ID token")

	// Use Google's idtoken package to verify
	payload, err := idtoken.Validate(ctx, idToken, c.clientID)
	if err != nil {
		c.logger.WithFields(logrus.Fields{
			"operation": "VerifyIDToken",
			"error":     err.Error(),
		}).Error("Failed to validate ID token")
		return nil, fmt.Errorf("failed to validate ID token: %w", err)
	}

	// Extract user info from payload
	userInfo := &GoogleUserInfo{}

	if sub, ok := payload.Claims["sub"].(string); ok {
		userInfo.ID = sub
	}
	if email, ok := payload.Claims["email"].(string); ok {
		userInfo.Email = email
	}
	if emailVerified, ok := payload.Claims["email_verified"].(bool); ok {
		userInfo.EmailVerified = emailVerified
	}
	if name, ok := payload.Claims["name"].(string); ok {
		userInfo.Name = name
	}
	if picture, ok := payload.Claims["picture"].(string); ok {
		userInfo.Picture = picture
	}
	if givenName, ok := payload.Claims["given_name"].(string); ok {
		userInfo.GivenName = givenName
	}
	if familyName, ok := payload.Claims["family_name"].(string); ok {
		userInfo.FamilyName = familyName
	}
	if locale, ok := payload.Claims["locale"].(string); ok {
		userInfo.Locale = locale
	}

	c.logger.WithFields(logrus.Fields{
		"operation": "VerifyIDToken",
		"email":     userInfo.Email,
		"google_id": userInfo.ID,
	}).Info("ID token verified successfully")

	return userInfo, nil
}

// ExchangeCodeForToken exchanges an authorization code for tokens với validation và logging
//
// Business Logic:
// - Exchange authorization code for access_token và refresh_token
// - Call Google's token endpoint
// - Return tokens hoặc error
//
// Parameters:
//   - ctx: Context với timeout và cancellation
//   - code: Authorization code từ OAuth callback
//
// Returns:
//   - *TokenResponse: Tokens từ Google (access_token, refresh_token, id_token)
//   - error: Network error hoặc validation error
func (c *GoogleClient) ExchangeCodeForToken(ctx context.Context, code string) (*TokenResponse, error) {
	// Validate input
	if code == "" {
		c.logger.Error("Empty authorization code provided")
		return nil, fmt.Errorf("authorization code cannot be empty")
	}

	c.logger.WithFields(logrus.Fields{
		"operation": "ExchangeCodeForToken",
	}).Debug("Exchanging authorization code for tokens")

	// Prepare request to Google's token endpoint
	tokenURL := "https://oauth2.googleapis.com/token"

	// Create form data
	formData := fmt.Sprintf(
		"code=%s&client_id=%s&client_secret=%s&redirect_uri=%s&grant_type=authorization_code",
		code, c.clientID, c.clientSecret, c.redirectURI,
	)

	// Create HTTP request with form data
	req, err := http.NewRequestWithContext(ctx, "POST", tokenURL, strings.NewReader(formData))
	if err != nil {
		c.logger.WithFields(logrus.Fields{
			"operation": "ExchangeCodeForToken",
			"error":     err.Error(),
		}).Error("Failed to create HTTP request")
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// Make request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.logger.WithFields(logrus.Fields{
			"operation": "ExchangeCodeForToken",
			"error":     err.Error(),
		}).Error("Failed to exchange code")
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		c.logger.WithFields(logrus.Fields{
			"operation":   "ExchangeCodeForToken",
			"status_code": resp.StatusCode,
			"response":    string(body),
		}).Error("Token exchange failed")
		return nil, fmt.Errorf("token exchange failed: %s", string(body))
	}

	// Parse response
	var tokenResp TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		c.logger.WithFields(logrus.Fields{
			"operation": "ExchangeCodeForToken",
			"error":     err.Error(),
		}).Error("Failed to decode token response")
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}

	c.logger.WithFields(logrus.Fields{
		"operation":  "ExchangeCodeForToken",
		"expires_in": tokenResp.ExpiresIn,
	}).Info("Authorization code exchanged successfully")

	return &tokenResp, nil
}

// GetUserInfo fetches user information using an access token với validation và logging
//
// Business Logic:
// - Fetch user information từ Google's userinfo endpoint
// - Use access token để authenticate
// - Return user info hoặc error
//
// Parameters:
//   - ctx: Context với timeout và cancellation
//   - accessToken: Google access token
//
// Returns:
//   - *GoogleUserInfo: User information từ Google
//   - error: Network error hoặc validation error
func (c *GoogleClient) GetUserInfo(ctx context.Context, accessToken string) (*GoogleUserInfo, error) {
	// Validate input
	if accessToken == "" {
		c.logger.Error("Empty access token provided")
		return nil, fmt.Errorf("access token cannot be empty")
	}

	c.logger.WithFields(logrus.Fields{
		"operation": "GetUserInfo",
	}).Debug("Fetching user info from Google")

	// Google's userinfo endpoint
	userInfoURL := "https://www.googleapis.com/oauth2/v2/userinfo"

	// Create request
	req, err := http.NewRequestWithContext(ctx, "GET", userInfoURL, nil)
	if err != nil {
		c.logger.WithFields(logrus.Fields{
			"operation": "GetUserInfo",
			"error":     err.Error(),
		}).Error("Failed to create HTTP request")
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	// Make request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.logger.WithFields(logrus.Fields{
			"operation": "GetUserInfo",
			"error":     err.Error(),
		}).Error("Failed to get user info")
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		c.logger.WithFields(logrus.Fields{
			"operation":   "GetUserInfo",
			"status_code": resp.StatusCode,
			"response":    string(body),
		}).Error("Failed to get user info")
		return nil, fmt.Errorf("failed to get user info: %s", string(body))
	}

	// Parse response
	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		c.logger.WithFields(logrus.Fields{
			"operation": "GetUserInfo",
			"error":     err.Error(),
		}).Error("Failed to decode user info")
		return nil, fmt.Errorf("failed to decode user info: %w", err)
	}

	c.logger.WithFields(logrus.Fields{
		"operation": "GetUserInfo",
		"email":     userInfo.Email,
		"google_id": userInfo.ID,
	}).Info("User info fetched successfully")

	return &userInfo, nil
}

// RefreshAccessToken refreshes an access token using a refresh token với validation và logging
//
// Business Logic:
// - Refresh access token using refresh token
// - Call Google's token endpoint
// - Return new tokens hoặc error
//
// Parameters:
//   - ctx: Context với timeout và cancellation
//   - refreshToken: Google refresh token
//
// Returns:
//   - *TokenResponse: New tokens từ Google (access_token, refresh_token)
//   - error: Network error hoặc validation error
func (c *GoogleClient) RefreshAccessToken(ctx context.Context, refreshToken string) (*TokenResponse, error) {
	// Validate input
	if refreshToken == "" {
		c.logger.Error("Empty refresh token provided")
		return nil, fmt.Errorf("refresh token cannot be empty")
	}

	c.logger.WithFields(logrus.Fields{
		"operation": "RefreshAccessToken",
	}).Debug("Refreshing access token")

	// Google's token endpoint
	tokenURL := "https://oauth2.googleapis.com/token"

	// Create form data
	formData := fmt.Sprintf(
		"refresh_token=%s&client_id=%s&client_secret=%s&grant_type=refresh_token",
		refreshToken, c.clientID, c.clientSecret,
	)

	// Create HTTP request with form data
	req, err := http.NewRequestWithContext(ctx, "POST", tokenURL, strings.NewReader(formData))
	if err != nil {
		c.logger.WithFields(logrus.Fields{
			"operation": "RefreshAccessToken",
			"error":     err.Error(),
		}).Error("Failed to create HTTP request")
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// Make request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.logger.WithFields(logrus.Fields{
			"operation": "RefreshAccessToken",
			"error":     err.Error(),
		}).Error("Failed to refresh token")
		return nil, fmt.Errorf("failed to refresh token: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		c.logger.WithFields(logrus.Fields{
			"operation":   "RefreshAccessToken",
			"status_code": resp.StatusCode,
			"response":    string(body),
		}).Error("Token refresh failed")
		return nil, fmt.Errorf("token refresh failed: %s", string(body))
	}

	// Parse response
	var tokenResp TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		c.logger.WithFields(logrus.Fields{
			"operation": "RefreshAccessToken",
			"error":     err.Error(),
		}).Error("Failed to decode token response")
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}

	c.logger.WithFields(logrus.Fields{
		"operation":  "RefreshAccessToken",
		"expires_in": tokenResp.ExpiresIn,
	}).Info("Access token refreshed successfully")

	return &tokenResp, nil
}

// GetAuthURL generates the Google OAuth authorization URL
func (c *GoogleClient) GetAuthURL(state string) string {
	return fmt.Sprintf(
		"https://accounts.google.com/o/oauth2/v2/auth?"+
			"client_id=%s&"+
			"redirect_uri=%s&"+
			"response_type=code&"+
			"scope=openid%%20email%%20profile&"+
			"state=%s&"+
			"access_type=offline&"+
			"prompt=consent",
		c.clientID,
		c.redirectURI,
		state,
	)
}

// ValidateState validates the state parameter to prevent CSRF attacks
func (c *GoogleClient) ValidateState(state, expectedState string) error {
	if state != expectedState {
		return fmt.Errorf("invalid state parameter")
	}
	return nil
}
