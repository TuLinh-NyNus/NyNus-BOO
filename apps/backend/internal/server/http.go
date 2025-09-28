package server

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/rs/cors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"

	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
)

// HTTPServer wraps the gRPC-Gateway server
type HTTPServer struct {
	httpPort string
	grpcPort string
	mux      *runtime.ServeMux
}

// NewHTTPServer creates a new HTTP server with gRPC-Gateway
func NewHTTPServer(httpPort, grpcPort string) *HTTPServer {
	// Create gRPC-Gateway mux with custom settings
	mux := runtime.NewServeMux(
		// Pass auth header to gRPC
		runtime.WithIncomingHeaderMatcher(func(key string) (string, bool) {
			switch strings.ToLower(key) {
			case "authorization":
				return key, true
			default:
				return runtime.DefaultHeaderMatcher(key)
			}
		}),
		// Pass metadata from context
		runtime.WithMetadata(func(ctx context.Context, req *http.Request) metadata.MD {
			md := metadata.New(nil)
			if auth := req.Header.Get("Authorization"); auth != "" {
				md.Set("authorization", auth)
			}
			return md
		}),
		// Enable CORS headers in responses
		runtime.WithOutgoingHeaderMatcher(func(key string) (string, bool) {
			switch strings.ToLower(key) {
			case "access-control-allow-origin",
				"access-control-allow-methods",
				"access-control-allow-headers",
				"access-control-allow-credentials",
				"access-control-max-age":
				return key, true
			default:
				return runtime.DefaultHeaderMatcher(key)
			}
		}),
	)

	return &HTTPServer{
		httpPort: httpPort,
		grpcPort: grpcPort,
		mux:      mux,
	}
}

// Start starts the HTTP server
func (s *HTTPServer) Start() error {
	ctx := context.Background()

	// Create gRPC client connection
	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	}

	grpcEndpoint := fmt.Sprintf("localhost:%s", s.grpcPort)

	// Register service handlers
	if err := s.registerServices(ctx, grpcEndpoint, opts); err != nil {
		return fmt.Errorf("failed to register services: %w", err)
	}

	// Setup CORS
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"https://nynus.edu.vn",
		},
		AllowedMethods: []string{
			"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH",
		},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			"X-Requested-With",
			"X-User-Agent",
			"X-Grpc-Web",
			"Grpc-Timeout",
		},
		ExposedHeaders: []string{
			"Content-Length",
			"Content-Type",
			"Grpc-Status",
			"Grpc-Message",
		},
		AllowCredentials: true,
		MaxAge:           86400, // 24 hours
	})

	// Create HTTP handler with CORS for gRPC-Gateway
	grpcHandler := corsHandler.Handler(s.mux)

	// Wrap gRPC handler with gRPC-Web support
	grpcWebHandler := wrapGrpcWeb(grpcHandler)

	// Start HTTP server
	addr := fmt.Sprintf(":%s", s.httpPort)
	fmt.Printf("🌐 Starting HTTP/gRPC-Gateway server on %s\n", addr)

	// Create a simple handler that routes requests
	return http.ListenAndServe(addr, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("DEBUG: *** MAIN HANDLER CALLED *** - URL: %s, Method: %s\n", r.URL.Path, r.Method)

		// Handle health check endpoint
		if r.URL.Path == "/health" {
			fmt.Printf("DEBUG: *** HEALTH CHECK ENDPOINT MATCHED *** - URL: %s, Method: %s\n", r.URL.Path, r.Method)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"status":"healthy","service":"exam-bank-backend","timestamp":"` +
				fmt.Sprintf("%d", time.Now().Unix()) + `"}`))
			return
		}

		// Handle all other requests with gRPC-Gateway
		fmt.Printf("DEBUG: *** FORWARDING TO GRPC-GATEWAY *** - URL: %s, Method: %s\n", r.URL.Path, r.Method)
		grpcWebHandler.ServeHTTP(w, r)
	}))
}

// Stop stops the HTTP server
func (s *HTTPServer) Stop(ctx context.Context) error {
	// In production, you would want to use http.Server with Shutdown()
	// For now, this is a placeholder
	return nil
}

// addHealthCheck adds a health check endpoint
func (s *HTTPServer) addHealthCheck(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Debug logging
		fmt.Printf("DEBUG: Health check - URL: %s, Method: %s\n", r.URL.Path, r.Method)

		if r.URL.Path == "/health" {
			fmt.Printf("DEBUG: Serving health check endpoint\n")
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"status":"healthy","service":"exam-bank-backend","timestamp":"` +
				fmt.Sprintf("%d", time.Now().Unix()) + `"}`))
			return
		}
		handler.ServeHTTP(w, r)
	})
}

// registerServices registers all gRPC services with the gateway
func (s *HTTPServer) registerServices(ctx context.Context, endpoint string, opts []grpc.DialOption) error {
	// Register UserService
	if err := v1.RegisterUserServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
		return fmt.Errorf("failed to register UserService: %w", err)
	}

	// Register ProfileService
	if err := v1.RegisterProfileServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
		return fmt.Errorf("failed to register ProfileService: %w", err)
	}

	// Register AdminService
	if err := v1.RegisterAdminServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
		return fmt.Errorf("failed to register AdminService: %w", err)
	}

	// Register QuestionService
	if err := v1.RegisterQuestionServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
		return fmt.Errorf("failed to register QuestionService: %w", err)
	}

	// Register QuestionFilterService
	if err := v1.RegisterQuestionFilterServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
		return fmt.Errorf("failed to register QuestionFilterService: %w", err)
	}

	// Register ContactService
	if err := v1.RegisterContactServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
		return fmt.Errorf("failed to register ContactService: %w", err)
	}

	// Register NewsletterService
	if err := v1.RegisterNewsletterServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
		return fmt.Errorf("failed to register NewsletterService: %w", err)
	}

	// Register MapCodeService
	// TODO: MapCodeService registration disabled - service not available yet
	// if err := v1.RegisterMapCodeServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
	//     return fmt.Errorf("failed to register MapCodeService: %w", err)
	// }

	// Register ExamService (when available)
	// if err := v1.RegisterExamServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
	//     return fmt.Errorf("failed to register ExamService: %w", err)
	// }

	return nil
}

// wrapGrpcWeb wraps the handler to support gRPC-Web
func wrapGrpcWeb(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Debug logging
		fmt.Printf("DEBUG: Request URL: %s\n", r.URL.Path)
		fmt.Printf("DEBUG: Request Method: %s\n", r.Method)
		fmt.Printf("DEBUG: Content-Type: %s\n", r.Header.Get("Content-Type"))
		fmt.Printf("DEBUG: X-Grpc-Web: %s\n", r.Header.Get("X-Grpc-Web"))

		// Check if this is a gRPC-Web request
		if isGrpcWebRequest(r) {
			fmt.Printf("DEBUG: Detected gRPC-Web request\n")

			// Set CORS headers first
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Grpc-Web, X-User-Agent")
			w.Header().Set("Access-Control-Expose-Headers", "Grpc-Status, Grpc-Message")

			// Handle preflight OPTIONS request
			if r.Method == "OPTIONS" {
				fmt.Printf("DEBUG: Handling OPTIONS preflight request\n")
				w.WriteHeader(http.StatusOK)
				return
			}

			// Convert gRPC-Web content-type to application/json for gRPC Gateway
			originalContentType := r.Header.Get("Content-Type")
			if strings.HasPrefix(originalContentType, "application/grpc-web") {
				fmt.Printf("DEBUG: Converting gRPC-Web content-type to application/json\n")
				r.Header.Set("Content-Type", "application/json")
			}

			// Set response content-type for gRPC-Web
			w.Header().Set("Content-Type", "application/grpc-web+proto")
		} else {
			fmt.Printf("DEBUG: Not a gRPC-Web request\n")
		}

		// Serve the request
		h.ServeHTTP(w, r)
	})
}

// isGrpcWebRequest checks if the request is a gRPC-Web request
func isGrpcWebRequest(r *http.Request) bool {
	contentType := r.Header.Get("Content-Type")

	// Check for gRPC-Web content types
	if strings.HasPrefix(contentType, "application/grpc-web") {
		return true
	}

	// Check for X-Grpc-Web header
	if r.Header.Get("X-Grpc-Web") == "1" {
		return true
	}

	// Check for other gRPC-Web indicators
	if strings.Contains(contentType, "grpc") {
		return true
	}

	return false
}
