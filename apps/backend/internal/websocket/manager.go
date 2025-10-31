package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"nhooyr.io/websocket"
)

// Client represents a WebSocket client connection
type Client struct {
	ID       string
	UserID   string
	Role     string
	Conn     *websocket.Conn
	SendCh   chan []byte
	mu       sync.RWMutex
	lastPing time.Time
}

// ConnectionManager manages all WebSocket connections
// Implements task 2.1.1: Create ConnectionManager struct
type ConnectionManager struct {
	// connections maps userID to client connection
	connections map[string]*Client

	// mu protects the connections map
	mu sync.RWMutex

	// register channel for new client connections
	register chan *Client

	// unregister channel for client disconnections
	unregister chan *Client

	// broadcast channel for broadcasting messages to all clients
	broadcast chan []byte

	// userBroadcast channel for broadcasting to specific user
	userBroadcast chan *UserMessage

	// roleBroadcast channel for broadcasting to specific role
	roleBroadcast chan *RoleMessage

	// logger for logging
	logger *log.Logger

	// ctx for graceful shutdown
	ctx    context.Context
	cancel context.CancelFunc

	// metrics
	metrics *ConnectionMetrics
}

// UserMessage represents a message targeted to a specific user
type UserMessage struct {
	UserID  string
	Message []byte
}

// RoleMessage represents a message targeted to a specific role
type RoleMessage struct {
	Role    string
	Message []byte
}

// ConnectionMetrics tracks connection statistics
type ConnectionMetrics struct {
	mu                sync.RWMutex
	TotalConnections  int64
	ActiveConnections int64
	MessagesSent      int64
	MessagesReceived  int64
	Errors            int64
}

// NewConnectionManager creates a new connection manager
func NewConnectionManager() *ConnectionManager {
	ctx, cancel := context.WithCancel(context.Background())

	return &ConnectionManager{
		connections:   make(map[string]*Client),
		register:      make(chan *Client, 10),
		unregister:    make(chan *Client, 10),
		broadcast:     make(chan []byte, 100),
		userBroadcast: make(chan *UserMessage, 100),
		roleBroadcast: make(chan *RoleMessage, 100),
		logger:        log.New(log.Writer(), "[WebSocket Manager] ", log.LstdFlags),
		ctx:           ctx,
		cancel:        cancel,
		metrics:       &ConnectionMetrics{},
	}
}

// RegisterClient registers a new client connection
// Implements task 2.1.2: Connection lifecycle - RegisterClient
func (m *ConnectionManager) RegisterClient(userID, role string, conn *websocket.Conn) *Client {
	client := &Client{
		ID:       fmt.Sprintf("%s-%d", userID, time.Now().UnixNano()),
		UserID:   userID,
		Role:     role,
		Conn:     conn,
		SendCh:   make(chan []byte, 256),
		lastPing: time.Now(),
	}

	m.register <- client

	return client
}

// UnregisterClient unregisters a client connection
// Implements task 2.1.2: Connection lifecycle - UnregisterClient
func (m *ConnectionManager) UnregisterClient(client *Client) {
	if client != nil {
		m.unregister <- client
	}
}

// GetConnection retrieves a connection by user ID
// Implements task 2.1.2: Connection lifecycle - GetConnection
func (m *ConnectionManager) GetConnection(userID string) (*Client, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	client, exists := m.connections[userID]
	return client, exists
}

// GetConnectionCount returns the number of active connections
// Implements task 2.1.2: Connection lifecycle - GetConnectionCount
func (m *ConnectionManager) GetConnectionCount() int {
	m.mu.RLock()
	defer m.mu.RUnlock()

	return len(m.connections)
}

// BroadcastToUser sends a message to a specific user
// Implements task 2.1.3: Message broadcasting - BroadcastToUser
func (m *ConnectionManager) BroadcastToUser(userID string, message []byte) error {
	if userID == "" {
		return fmt.Errorf("userID cannot be empty")
	}

	if len(message) == 0 {
		return fmt.Errorf("message cannot be empty")
	}

	select {
	case m.userBroadcast <- &UserMessage{UserID: userID, Message: message}:
		return nil
	case <-time.After(5 * time.Second):
		return fmt.Errorf("timeout sending message to user %s", userID)
	}
}

// BroadcastToAll sends a message to all connected clients
// Implements task 2.1.3: Message broadcasting - BroadcastToAll
func (m *ConnectionManager) BroadcastToAll(message []byte) error {
	if len(message) == 0 {
		return fmt.Errorf("message cannot be empty")
	}

	select {
	case m.broadcast <- message:
		return nil
	case <-time.After(5 * time.Second):
		return fmt.Errorf("timeout broadcasting message to all")
	}
}

// BroadcastToRole sends a message to all clients with a specific role
// Implements task 2.1.3: Message broadcasting - BroadcastToRole
func (m *ConnectionManager) BroadcastToRole(role string, message []byte) error {
	if role == "" {
		return fmt.Errorf("role cannot be empty")
	}

	if len(message) == 0 {
		return fmt.Errorf("message cannot be empty")
	}

	select {
	case m.roleBroadcast <- &RoleMessage{Role: role, Message: message}:
		return nil
	case <-time.After(5 * time.Second):
		return fmt.Errorf("timeout broadcasting message to role %s", role)
	}
}

// Run starts the connection manager
// Implements task 2.1.4: Handle concurrent access with channels
func (m *ConnectionManager) Run() {
	m.logger.Printf("[INFO] Connection manager started")

	// Start heartbeat checker
	go m.heartbeatChecker()

	for {
		select {
		case <-m.ctx.Done():
			m.logger.Printf("[INFO] Connection manager stopping")
			return

		case client := <-m.register:
			m.handleRegister(client)

		case client := <-m.unregister:
			m.handleUnregister(client)

		case message := <-m.broadcast:
			m.handleBroadcast(message)

		case userMsg := <-m.userBroadcast:
			m.handleUserBroadcast(userMsg)

		case roleMsg := <-m.roleBroadcast:
			m.handleRoleBroadcast(roleMsg)
		}
	}
}

// handleRegister handles client registration
func (m *ConnectionManager) handleRegister(client *Client) {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Close existing connection for the same user
	if existing, exists := m.connections[client.UserID]; exists {
		m.logger.Printf("[WARN] Closing existing connection for user %s", client.UserID)
		close(existing.SendCh)
		if existing.Conn != nil {
			_ = existing.Conn.Close(websocket.StatusNormalClosure, "New connection established")
		}
	}

	m.connections[client.UserID] = client

	// Update metrics
	m.metrics.mu.Lock()
	m.metrics.TotalConnections++
	m.metrics.ActiveConnections = int64(len(m.connections))
	m.metrics.mu.Unlock()

	m.logger.Printf("[INFO] Client registered: userID=%s, total_connections=%d",
		client.UserID, len(m.connections))

	// Start client writer goroutine
	go m.clientWriter(client)
}

// handleUnregister handles client unregistration.
func (m *ConnectionManager) handleUnregister(client *Client) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.connections[client.UserID]; exists {
		delete(m.connections, client.UserID)
		close(client.SendCh)

		// Update metrics
		m.metrics.mu.Lock()
		m.metrics.ActiveConnections = int64(len(m.connections))
		m.metrics.mu.Unlock()

		m.logger.Printf("[INFO] Client unregistered: userID=%s, remaining_connections=%d",
			client.UserID, len(m.connections))
	}
}

// handleBroadcast sends message to all connected clients.
func (m *ConnectionManager) handleBroadcast(message []byte) {
	m.mu.RLock()
	clients := make([]*Client, 0, len(m.connections))
	for _, client := range m.connections {
		clients = append(clients, client)
	}
	m.mu.RUnlock()

	for _, client := range clients {
		select {
		case client.SendCh <- message:
			// Message queued successfully
		default:
			m.logger.Printf("[WARN] Failed to queue broadcast message for user %s (channel full)", client.UserID)
		}
	}

	m.logger.Printf("[DEBUG] Broadcast message sent to %d clients", len(clients))
}

// handleUserBroadcast sends message to a specific user.
func (m *ConnectionManager) handleUserBroadcast(userMsg *UserMessage) {
	m.mu.RLock()
	client, exists := m.connections[userMsg.UserID]
	m.mu.RUnlock()

	if !exists {
		m.logger.Printf("[WARN] User %s not connected, message dropped", userMsg.UserID)
		return
	}

	select {
	case client.SendCh <- userMsg.Message:
		m.logger.Printf("[DEBUG] Message sent to user %s", userMsg.UserID)
	default:
		m.logger.Printf("[WARN] Failed to queue message for user %s (channel full)", userMsg.UserID)
	}
}

// handleRoleBroadcast sends message to all users with a specific role.
func (m *ConnectionManager) handleRoleBroadcast(roleMsg *RoleMessage) {
	m.mu.RLock()
	clients := make([]*Client, 0)
	for _, client := range m.connections {
		if client.Role == roleMsg.Role {
			clients = append(clients, client)
		}
	}
	m.mu.RUnlock()

	for _, client := range clients {
		select {
		case client.SendCh <- roleMsg.Message:
			// Message queued successfully
		default:
			m.logger.Printf("[WARN] Failed to queue role broadcast for user %s (channel full)", client.UserID)
		}
	}

	m.logger.Printf("[DEBUG] Role broadcast sent to %d clients (role=%s)", len(clients), roleMsg.Role)
}

// clientWriter handles sending messages to a client.
func (m *ConnectionManager) clientWriter(client *Client) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case message, ok := <-client.SendCh:
			if !ok {
				// Channel closed, exit
				return
			}

			if client.Conn == nil {
				m.logger.Printf("[WARN] No WebSocket connection for user %s, dropping message", client.UserID)
				continue
			}

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			err := client.Conn.Write(ctx, websocket.MessageText, message)
			cancel()

			if err != nil {
				m.logger.Printf("[ERROR] Failed to write to client %s: %v", client.UserID, err)
				m.UnregisterClient(client)
				return
			}

			// Update metrics
			m.metrics.mu.Lock()
			m.metrics.MessagesSent++
			m.metrics.mu.Unlock()

		case <-ticker.C:
			// Send ping (implements task 2.1.5: Heartbeat/ping-pong)
			if client.Conn == nil {
				m.logger.Printf("[WARN] No WebSocket connection for user %s, skipping heartbeat", client.UserID)
				continue
			}

			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			err := client.Conn.Ping(ctx)
			cancel()

			if err != nil {
				m.logger.Printf("[WARN] Ping failed for client %s: %v", client.UserID, err)
				m.UnregisterClient(client)
				return
			}

			client.mu.Lock()
			client.lastPing = time.Now()
			client.mu.Unlock()
		}
	}
}

// heartbeatChecker checks for dead connections.
// Implements task 2.1.5: Auto-disconnect dead connections
func (m *ConnectionManager) heartbeatChecker() {
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-m.ctx.Done():
			return
		case <-ticker.C:
			m.checkDeadConnections()
		}
	}
}

// checkDeadConnections disconnects clients that haven't responded to ping.
func (m *ConnectionManager) checkDeadConnections() {
	m.mu.RLock()
	clients := make([]*Client, 0, len(m.connections))
	for _, client := range m.connections {
		clients = append(clients, client)
	}
	m.mu.RUnlock()

	now := time.Now()
	deadTimeout := 90 * time.Second // 90 seconds without ping = dead

	for _, client := range clients {
		client.mu.RLock()
		lastPing := client.lastPing
		client.mu.RUnlock()

		if now.Sub(lastPing) > deadTimeout {
			m.logger.Printf("[WARN] Dead connection detected for user %s, disconnecting", client.UserID)
			m.UnregisterClient(client)
			if client.Conn != nil {
				_ = client.Conn.Close(websocket.StatusGoingAway, "Connection timeout")
			}
		}
	}
}

// Stop gracefully stops the connection manager.
// Implements task 2.1.4: Graceful shutdown handling
func (m *ConnectionManager) Stop() error {
	m.logger.Printf("[INFO] Stopping connection manager")

	// Cancel context to stop Run loop
	m.cancel()

	// Close all connections
	m.mu.Lock()
	clients := make([]*Client, 0, len(m.connections))
	for _, client := range m.connections {
		clients = append(clients, client)
	}
	m.mu.Unlock()

	for _, client := range clients {
		close(client.SendCh)
		if client.Conn != nil {
			_ = client.Conn.Close(websocket.StatusNormalClosure, "Server shutting down")
		}
	}

	// Clear connections
	m.mu.Lock()
	m.connections = make(map[string]*Client)
	m.mu.Unlock()

	m.logger.Printf("[INFO] Connection manager stopped")
	return nil
}

// GetMetrics returns current connection metrics.
// Implements task 2.1.4: Connection metrics tracking
func (m *ConnectionManager) GetMetrics() ConnectionMetrics {
	m.metrics.mu.RLock()
	defer m.metrics.mu.RUnlock()

	return ConnectionMetrics{
		TotalConnections:  m.metrics.TotalConnections,
		ActiveConnections: m.metrics.ActiveConnections,
		MessagesSent:      m.metrics.MessagesSent,
		MessagesReceived:  m.metrics.MessagesReceived,
		Errors:            m.metrics.Errors,
	}
}

// GetAllConnections returns all active connections (for monitoring).
func (m *ConnectionManager) GetAllConnections() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()

	userIDs := make([]string, 0, len(m.connections))
	for userID := range m.connections {
		userIDs = append(userIDs, userID)
	}

	return userIDs
}

// SendJSON sends a JSON-encoded message to a user.
func (m *ConnectionManager) SendJSON(userID string, v interface{}) error {
	message, err := json.Marshal(v)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	return m.BroadcastToUser(userID, message)
}

// BroadcastJSON sends a JSON-encoded message to all users.
func (m *ConnectionManager) BroadcastJSON(v interface{}) error {
	message, err := json.Marshal(v)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	return m.BroadcastToAll(message)
}
