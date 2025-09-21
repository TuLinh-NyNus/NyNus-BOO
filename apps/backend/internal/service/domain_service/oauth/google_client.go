package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"google.golang.org/api/idtoken"
)

// GoogleClient handles Google OAuth operations
type GoogleClient struct {
	clientID     string
	clientSecret string
	redirectURI  string
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

// NewGoogleClient creates a new Google OAuth client
func NewGoogleClient(clientID, clientSecret, redirectURI string) *GoogleClient {
	return &GoogleClient{
		clientID:     clientID,
		clientSecret: clientSecret,
		redirectURI:  redirectURI,
	}
}

// VerifyIDToken verifies a Google ID token and returns user info
func (c *GoogleClient) VerifyIDToken(ctx context.Context, idToken string) (*GoogleUserInfo, error) {
	// Use Google's idtoken package to verify
	payload, err := idtoken.Validate(ctx, idToken, c.clientID)
	if err != nil {
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

	return userInfo, nil
}

// ExchangeCodeForToken exchanges an authorization code for tokens
func (c *GoogleClient) ExchangeCodeForToken(ctx context.Context, code string) (*TokenResponse, error) {
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
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// Make request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token exchange failed: %s", string(body))
	}

	// Parse response
	var tokenResp TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}

	return &tokenResp, nil
}

// GetUserInfo fetches user information using an access token
func (c *GoogleClient) GetUserInfo(ctx context.Context, accessToken string) (*GoogleUserInfo, error) {
	// Google's userinfo endpoint
	userInfoURL := "https://www.googleapis.com/oauth2/v2/userinfo"

	// Create request
	req, err := http.NewRequestWithContext(ctx, "GET", userInfoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	// Make request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get user info: %s", string(body))
	}

	// Parse response
	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to decode user info: %w", err)
	}

	return &userInfo, nil
}

// RefreshAccessToken refreshes an access token using a refresh token
func (c *GoogleClient) RefreshAccessToken(ctx context.Context, refreshToken string) (*TokenResponse, error) {
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
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// Make request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to refresh token: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token refresh failed: %s", string(body))
	}

	// Parse response
	var tokenResp TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}

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
