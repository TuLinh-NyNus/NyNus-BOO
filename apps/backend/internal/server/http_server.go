package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// HTTPServer represents the HTTP server for REST API using gRPC-Gateway
type HTTPServer struct {
	server   *http.Server
	grpcPort string
}

// NewHTTPServer creates a new HTTP server with gRPC-Gateway
func NewHTTPServer(port string, grpcPort string) *HTTPServer {
	// Create HTTP server
	server := &http.Server{
		Addr:         ":" + port,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	httpServer := &HTTPServer{
		server:   server,
		grpcPort: grpcPort,
	}

	return httpServer
}

// setupGateway configures gRPC-Gateway
func (s *HTTPServer) setupGateway(ctx context.Context) (*runtime.ServeMux, error) {
	// Create gRPC-Gateway mux
	mux := runtime.NewServeMux()

	// gRPC server endpoint
	grpcEndpoint := fmt.Sprintf("localhost:%s", s.grpcPort)

	// Setup connection to gRPC server
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}

	// Register Question service
	err := v1.RegisterQuestionServiceHandlerFromEndpoint(ctx, mux, grpcEndpoint, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to register question service handler: %w", err)
	}

	// Register User service
	err = v1.RegisterUserServiceHandlerFromEndpoint(ctx, mux, grpcEndpoint, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to register user service handler: %w", err)
	}

	return mux, nil
}

// healthCheck handles health check requests
func (s *HTTPServer) healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "healthy", "service": "exam-bank-backend"}`))
}

// corsMiddleware adds CORS headers
func (s *HTTPServer) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// loggingMiddleware logs HTTP requests
func (s *HTTPServer) loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Create a response writer wrapper to capture status code
		wrapper := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(wrapper, r)

		duration := time.Since(start)
		log.Printf("HTTP %s %s - %d - %v", r.Method, r.URL.Path, wrapper.statusCode, duration)
	})
}

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// Start starts the HTTP server with gRPC-Gateway
func (s *HTTPServer) Start() error {
	ctx := context.Background()

	// Setup gRPC-Gateway
	gwmux, err := s.setupGateway(ctx)
	if err != nil {
		return fmt.Errorf("failed to setup gRPC-Gateway: %w", err)
	}

	// Create main HTTP mux
	mux := http.NewServeMux()

	// Add health check endpoint
	mux.HandleFunc("/health", s.healthCheck)

	// Mount gRPC-Gateway under /api/v1/
	mux.Handle("/api/v1/", gwmux)

	// Add CORS and logging middleware
	s.server.Handler = s.corsMiddleware(s.loggingMiddleware(mux))

	log.Printf("🌐 Starting HTTP REST API server on %s...", s.server.Addr)
	log.Printf("📋 Available REST endpoints (via gRPC-Gateway):")
	log.Printf("   🔐 Authentication:")
	log.Printf("   - POST /api/v1/auth/login (User login)")
	log.Printf("   - POST /api/v1/auth/register (User registration)")
	log.Printf("   📚 Questions:")
	log.Printf("   - POST /api/v1/questions/import (Import questions from CSV)")
	log.Printf("   - GET  /api/v1/questions (List questions with pagination)")
	log.Printf("   - GET  /api/v1/questions/{id} (Get single question)")
	log.Printf("   - POST /api/v1/questions (Create question)")
	log.Printf("   👥 Users:")
	log.Printf("   - GET  /api/v1/users (List users)")
	log.Printf("   - GET  /api/v1/users/{id} (Get user)")
	log.Printf("   - GET  /api/v1/users/students (List students)")
	log.Printf("   ❤️ Health:")
	log.Printf("   - GET  /health (Health check)")

	return s.server.ListenAndServe()
}

// Stop gracefully stops the HTTP server
func (s *HTTPServer) Stop(ctx context.Context) error {
	log.Println("🛑 Stopping HTTP server...")
	return s.server.Shutdown(ctx)
}

// GetAddr returns the server address
func (s *HTTPServer) GetAddr() string {
	return s.server.Addr
}
