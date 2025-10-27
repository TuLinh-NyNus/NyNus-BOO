package server

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"exam-bank-system/apps/backend/internal/redis"
	"exam-bank-system/apps/backend/internal/websocket"
)

// WebSocketServer represents the WebSocket server
// Implements task 2.3.1: Create WebSocket server struct
type WebSocketServer struct {
	manager     *websocket.ConnectionManager
	handler     *websocket.Handler
	redisPubSub *redis.PubSubClient
	server      *http.Server
	logger      *log.Logger
	
	// Configuration
	port           string
	shutdownTimeout time.Duration
}

// WebSocketServerConfig holds WebSocket server configuration
type WebSocketServerConfig struct {
	Port            string
	AllowedOrigins  []string
	MaxMessageSize  int64
	RateLimit       int
	ShutdownTimeout time.Duration
}

// NewWebSocketServer creates a new WebSocket server
func NewWebSocketServer(
	manager *websocket.ConnectionManager,
	handler *websocket.Handler,
	redisPubSub *redis.PubSubClient,
	config *WebSocketServerConfig,
) *WebSocketServer {
	if config == nil {
		config = &WebSocketServerConfig{
			Port:            "8081",
			ShutdownTimeout: 30 * time.Second,
		}
	}
	
	// Configure handler
	if len(config.AllowedOrigins) > 0 {
		handler.SetAllowedOrigins(config.AllowedOrigins)
	}
	if config.MaxMessageSize > 0 {
		handler.SetMaxMessageSize(config.MaxMessageSize)
	}
	if config.RateLimit > 0 {
		handler.SetRateLimit(config.RateLimit)
	}
	
	return &WebSocketServer{
		manager:         manager,
		handler:         handler,
		redisPubSub:     redisPubSub,
		logger:          log.New(log.Writer(), "[WebSocket Server] ", log.LstdFlags),
		port:            config.Port,
		shutdownTimeout: config.ShutdownTimeout,
	}
}

// Start starts the WebSocket server
func (s *WebSocketServer) Start() error {
	// Setup HTTP routes
	mux := http.NewServeMux()
	
	// WebSocket endpoint (task 2.3.2: Route setup)
	mux.HandleFunc("/api/v1/ws/notifications", func(w http.ResponseWriter, r *http.Request) {
		if err := s.handler.HandleWebSocket(w, r); err != nil {
			s.logger.Printf("[ERROR] WebSocket handler error: %v", err)
		}
	})
	
	// Health check endpoint (task 2.3.2)
	mux.HandleFunc("/api/v1/ws/health", s.handleHealth)
	
	// Metrics endpoint (task 2.3.4)
	mux.HandleFunc("/api/v1/ws/metrics", s.handleMetrics)
	
	// Create HTTP server
	s.server = &http.Server{
		Addr:         ":" + s.port,
		Handler:      s.addCORS(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}
	
	s.logger.Printf("[INFO] Starting WebSocket server on port %s", s.port)
	
	// Start connection manager
	go s.manager.Run()
	
	// Start HTTP server
	if err := s.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("failed to start WebSocket server: %w", err)
	}
	
	return nil
}

// Shutdown gracefully shuts down the WebSocket server
// Implements task 2.3.3: Graceful shutdown
func (s *WebSocketServer) Shutdown() error {
	s.logger.Printf("[INFO] Shutting down WebSocket server")
	
	// Create shutdown context with timeout (task 2.3.3: Timeout 30s)
	ctx, cancel := context.WithTimeout(context.Background(), s.shutdownTimeout)
	defer cancel()
	
	// Stop accepting new connections
	if err := s.server.Shutdown(ctx); err != nil {
		s.logger.Printf("[ERROR] HTTP server shutdown error: %v", err)
	}
	
	// Close all WebSocket connections (task 2.3.3)
	if err := s.manager.Stop(); err != nil {
		s.logger.Printf("[ERROR] Connection manager stop error: %v", err)
	}
	
	// Unsubscribe from Redis (task 2.3.3)
	if s.redisPubSub != nil {
		if err := s.redisPubSub.Stop(); err != nil {
			s.logger.Printf("[ERROR] Redis Pub/Sub stop error: %v", err)
		}
	}
	
	s.logger.Printf("[INFO] WebSocket server shutdown complete")
	return nil
}

// handleHealth handles health check requests
func (s *WebSocketServer) handleHealth(w http.ResponseWriter, r *http.Request) {
	health := map[string]interface{}{
		"status":              "healthy",
		"timestamp":           time.Now().Format(time.RFC3339),
		"active_connections":  s.manager.GetConnectionCount(),
		"redis_pubsub_active": s.redisPubSub != nil && s.redisPubSub.IsSubscribed(),
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	
	if err := json.NewEncoder(w).Encode(health); err != nil {
		s.logger.Printf("[ERROR] Failed to encode health response: %v", err)
	}
}

// handleMetrics handles metrics requests
// Implements task 2.3.4: Logging và monitoring
func (s *WebSocketServer) handleMetrics(w http.ResponseWriter, r *http.Request) {
	metrics := s.manager.GetMetrics()
	
	// Format as Prometheus-style metrics
	prometheusMetrics := fmt.Sprintf(`# HELP websocket_connections_total Total WebSocket connections established
# TYPE websocket_connections_total counter
websocket_connections_total %d

# HELP websocket_connections_active Currently active WebSocket connections
# TYPE websocket_connections_active gauge
websocket_connections_active %d

# HELP websocket_messages_sent_total Total messages sent to clients
# TYPE websocket_messages_sent_total counter
websocket_messages_sent_total %d

# HELP websocket_messages_received_total Total messages received from clients
# TYPE websocket_messages_received_total counter
websocket_messages_received_total %d

# HELP websocket_errors_total Total WebSocket errors
# TYPE websocket_errors_total counter
websocket_errors_total %d
`,
		metrics.TotalConnections,
		metrics.ActiveConnections,
		metrics.MessagesSent,
		metrics.MessagesReceived,
		metrics.Errors,
	)
	
	w.Header().Set("Content-Type", "text/plain; version=0.0.4")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(prometheusMetrics))
}

// addCORS adds CORS headers to HTTP handler
// Implements task 2.3.2: CORS configuration
func (s *WebSocketServer) addCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow specific origins
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		}
		
		// Handle preflight
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

// GetConnectionCount returns the number of active connections
func (s *WebSocketServer) GetConnectionCount() int {
	return s.manager.GetConnectionCount()
}

// BroadcastToUser broadcasts a message to a specific user
func (s *WebSocketServer) BroadcastToUser(userID string, message []byte) error {
	return s.manager.BroadcastToUser(userID, message)
}

// BroadcastToAll broadcasts a message to all connected users
func (s *WebSocketServer) BroadcastToAll(message []byte) error {
	return s.manager.BroadcastToAll(message)
}

// BroadcastToRole broadcasts a message to all users with a specific role
func (s *WebSocketServer) BroadcastToRole(role string, message []byte) error {
	return s.manager.BroadcastToRole(role, message)
}

