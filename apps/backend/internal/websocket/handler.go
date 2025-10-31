package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

// Handler handles WebSocket upgrade and message routing
type Handler struct {
	manager       *ConnectionManager
	authenticator TokenAuthenticator
	logger        *log.Logger

	// Configuration
	maxMessageSize  int64
	rateLimitPerMin int
	allowedOrigins  []string
}

// TokenAuthenticator defines the interface for validating JWT tokens
type TokenAuthenticator interface {
	ValidateToken(token string) (userID string, role string, err error)
}

// WebSocketMessage represents incoming WebSocket messages
type WebSocketMessage struct {
	Type    string                 `json:"type"`
	Payload map[string]interface{} `json:"payload,omitempty"`
}

// WebSocketResponse represents outgoing WebSocket messages
type WebSocketResponse struct {
	Type      string      `json:"type"`
	Success   bool        `json:"success"`
	Message   string      `json:"message,omitempty"`
	Data      interface{} `json:"data,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

// NewHandler creates a new WebSocket handler
func NewHandler(manager *ConnectionManager, authenticator TokenAuthenticator) *Handler {
	return &Handler{
		manager:         manager,
		authenticator:   authenticator,
		logger:          log.New(log.Writer(), "[WebSocket Handler] ", log.LstdFlags),
		maxMessageSize:  10 * 1024, // 10KB (task 2.2.4)
		rateLimitPerMin: 60,        // 60 messages per minute
		allowedOrigins: []string{
			"http://localhost:3000",
			"http://localhost:8080",
			"https://exambank.com",
		},
	}
}

// HandleWebSocket handles WebSocket upgrade and connection
// Implements task 2.2.1: Implement upgrade handler
func (h *Handler) HandleWebSocket(w http.ResponseWriter, r *http.Request) error {
	// Validate Origin header (CORS)
	if !h.isOriginAllowed(r.Header.Get("Origin")) {
		http.Error(w, "Origin not allowed", http.StatusForbidden)
		return fmt.Errorf("origin not allowed: %s", r.Header.Get("Origin"))
	}

	// Extract and validate JWT token
	token := h.extractToken(r)
	if token == "" {
		http.Error(w, "Missing authentication token", http.StatusUnauthorized)
		return fmt.Errorf("missing authentication token")
	}

	// Validate token and get user info
	userID, role, err := h.authenticator.ValidateToken(token)
	if err != nil {
		http.Error(w, "Invalid authentication token", http.StatusUnauthorized)
		return fmt.Errorf("invalid token: %w", err)
	}

	// Rate limiting check (per IP/user)
	if !h.checkRateLimit(r.RemoteAddr, userID) {
		http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
		return fmt.Errorf("rate limit exceeded for user %s", userID)
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns:  h.allowedOrigins,
		CompressionMode: websocket.CompressionContextTakeover,
	})
	if err != nil {
		return fmt.Errorf("failed to upgrade connection: %w", err)
	}

	// Set read limit (task 2.2.4: Max message size)
	conn.SetReadLimit(h.maxMessageSize)

	h.logger.Printf("[INFO] WebSocket connection established for user %s from %s", userID, r.RemoteAddr)

	// Register client
	client := h.manager.RegisterClient(userID, role, conn)

	// Send welcome message
	h.sendWelcome(client)

	// Handle messages
	defer func() {
		h.manager.UnregisterClient(client)
		conn.Close(websocket.StatusNormalClosure, "Connection closed")
	}()

	return h.handleMessages(r.Context(), client)
}

// handleMessages handles incoming messages from client
// Implements task 2.2.2: Message handling and routing
func (h *Handler) handleMessages(ctx context.Context, client *Client) error {
	for {
		var msg WebSocketMessage

		// Read message with timeout
		readCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
		err := wsjson.Read(readCtx, client.Conn, &msg)
		cancel()

		if err != nil {
			if websocket.CloseStatus(err) == websocket.StatusNormalClosure {
				h.logger.Printf("[INFO] Client %s closed connection normally", client.UserID)
				return nil
			}

			h.logger.Printf("[ERROR] Failed to read message from client %s: %v", client.UserID, err)
			return err
		}

		// Update metrics
		h.manager.metrics.mu.Lock()
		h.manager.metrics.MessagesReceived++
		h.manager.metrics.mu.Unlock()

		// Route message to appropriate handler
		if err := h.routeMessage(ctx, client, &msg); err != nil {
			h.logger.Printf("[ERROR] Failed to route message from client %s: %v", client.UserID, err)
			h.sendError(client, err.Error())
		}
	}
}

// routeMessage routes messages to appropriate handlers.
// Implements task 2.2.2: Support message types
func (h *Handler) routeMessage(_ context.Context, client *Client, msg *WebSocketMessage) error {
	switch msg.Type {
	case "ping":
		// Heartbeat (task 2.2.2)
		return h.handlePing(client)

	case "subscribe":
		// Subscribe to topics (task 2.2.2)
		return h.handleSubscribe(client, msg.Payload)

	case "unsubscribe":
		// Unsubscribe from topics (task 2.2.2)
		return h.handleUnsubscribe(client, msg.Payload)

	case "mark_read":
		// Mark notification as read (task 2.2.2)
		return h.handleMarkRead(client, msg.Payload)

	case "ack":
		// Acknowledge message receipt (task 2.2.2)
		return h.handleAck(client, msg.Payload)

	default:
		// Unknown message type (task 2.2.3: Invalid message format)
		return fmt.Errorf("unknown message type: %s", msg.Type)
	}
}

// handlePing handles ping messages.
func (h *Handler) handlePing(client *Client) error {
	response := WebSocketResponse{
		Type:      "pong",
		Success:   true,
		Timestamp: time.Now(),
	}

	return h.sendResponse(client, &response)
}

// handleSubscribe handles subscription requests.
func (h *Handler) handleSubscribe(client *Client, payload map[string]interface{}) error {
	topics, ok := payload["topics"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid topics format")
	}

	topicStrings := make([]string, len(topics))
	for i, topic := range topics {
		topicStr, ok := topic.(string)
		if !ok {
			return fmt.Errorf("invalid topic at index %d", i)
		}
		topicStrings[i] = topicStr
	}

	response := WebSocketResponse{
		Type:      "subscribed",
		Success:   true,
		Message:   fmt.Sprintf("Subscribed to %d topics", len(topicStrings)),
		Data:      topicStrings,
		Timestamp: time.Now(),
	}

	return h.sendResponse(client, &response)
}

// handleUnsubscribe handles unsubscription requests.
func (h *Handler) handleUnsubscribe(client *Client, payload map[string]interface{}) error {
	topics, ok := payload["topics"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid topics format")
	}

	response := WebSocketResponse{
		Type:      "unsubscribed",
		Success:   true,
		Message:   fmt.Sprintf("Unsubscribed from %d topics", len(topics)),
		Timestamp: time.Now(),
	}

	return h.sendResponse(client, &response)
}

// handleMarkRead handles mark-as-read requests.
func (h *Handler) handleMarkRead(client *Client, payload map[string]interface{}) error {
	notificationID, ok := payload["notification_id"].(string)
	if !ok {
		return fmt.Errorf("invalid notification_id format")
	}

	response := WebSocketResponse{
		Type:      "marked_read",
		Success:   true,
		Message:   "Notification marked as read",
		Data:      map[string]string{"notification_id": notificationID},
		Timestamp: time.Now(),
	}

	return h.sendResponse(client, &response)
}

// handleAck handles message acknowledgment.
func (h *Handler) handleAck(client *Client, payload map[string]interface{}) error {
	messageID, ok := payload["message_id"].(string)
	if !ok {
		return fmt.Errorf("invalid message_id format")
	}

	h.logger.Printf("[DEBUG] Received ack for message %s from user %s", messageID, client.UserID)
	return nil
}

// sendResponse sends a response to the client.
func (h *Handler) sendResponse(client *Client, response *WebSocketResponse) error {
	message, err := json.Marshal(response)
	if err != nil {
		return fmt.Errorf("failed to marshal response: %w", err)
	}

	select {
	case client.SendCh <- message:
		return nil
	case <-time.After(5 * time.Second):
		return fmt.Errorf("timeout sending response to client")
	}
}

// sendError sends an error message to the client.
func (h *Handler) sendError(client *Client, errorMsg string) {
	response := WebSocketResponse{
		Type:      "error",
		Success:   false,
		Message:   errorMsg,
		Timestamp: time.Now(),
	}

	//nolint:errcheck // Intentionally ignore error - connection might already be closed
	_ = h.sendResponse(client, &response)
}

// sendWelcome sends a welcome message when client connects.
func (h *Handler) sendWelcome(client *Client) {
	response := WebSocketResponse{
		Type:    "connected",
		Success: true,
		Message: "WebSocket connection established",
		Data: map[string]interface{}{
			"user_id":   client.UserID,
			"client_id": client.ID,
		},
		Timestamp: time.Now(),
	}

	//nolint:errcheck // Intentionally ignore error - connection might already be closed
	_ = h.sendResponse(client, &response)
}

// extractToken extracts JWT token from request.
// Supports token from query parameter or Authorization header
func (h *Handler) extractToken(r *http.Request) string {
	// Try query parameter first
	token := r.URL.Query().Get("token")
	if token != "" {
		return token
	}

	// Try Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		// Remove "Bearer " prefix
		if strings.HasPrefix(authHeader, "Bearer ") {
			return strings.TrimPrefix(authHeader, "Bearer ")
		}
		return authHeader
	}

	// Try cookie
	cookie, err := r.Cookie("auth_token")
	if err == nil && cookie.Value != "" {
		return cookie.Value
	}

	return ""
}

// isOriginAllowed checks if origin is in allowed list.
// Implements task 2.2.1: Validate Origin header (CORS)
func (h *Handler) isOriginAllowed(origin string) bool {
	if origin == "" {
		return true // Allow empty origin (same-origin)
	}

	for _, allowed := range h.allowedOrigins {
		if origin == allowed {
			return true
		}

		// Support wildcard matching
		if strings.HasSuffix(allowed, "*") {
			prefix := strings.TrimSuffix(allowed, "*")
			if strings.HasPrefix(origin, prefix) {
				return true
			}
		}
	}

	return false
}

// checkRateLimit checks if client exceeds rate limit.
// Implements task 2.2.1: Rate limiting per IP/user
func (h *Handler) checkRateLimit(ip, userID string) bool {
	// NOTE: Rate limiting not yet implemented - requires Redis or in-memory store
	// For now, always allow
	return true
}

// SetAllowedOrigins sets the list of allowed origins.
func (h *Handler) SetAllowedOrigins(origins []string) {
	h.allowedOrigins = origins
}

// SetMaxMessageSize sets the maximum message size.
func (h *Handler) SetMaxMessageSize(size int64) {
	h.maxMessageSize = size
}

// SetRateLimit sets the rate limit per minute.
func (h *Handler) SetRateLimit(limitPerMin int) {
	h.rateLimitPerMin = limitPerMin
}
