package server

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/rs/cors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"

	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
)

// HTTPServer wraps the gRPC-Gateway server
type HTTPServer struct {
	httpPort   string
	grpcPort   string
	mux        *runtime.ServeMux
	grpcServer *grpc.Server
}

// NewHTTPServer creates a new HTTP server with gRPC-Gateway
func NewHTTPServer(httpPort, grpcPort string, grpcServer *grpc.Server) *HTTPServer {
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
		httpPort:   httpPort,
		grpcPort:   grpcPort,
		mux:        mux,
		grpcServer: grpcServer,
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

	// Create gRPC-Web wrapper for the gRPC server
	// This allows frontend gRPC-Web clients to communicate with the backend
	grpcWebWrapper := grpcweb.WrapServer(s.grpcServer,
		grpcweb.WithOriginFunc(func(origin string) bool {
			// Allow requests from frontend origins
			allowedOrigins := []string{
				"http://localhost:3000",
				"http://localhost:3001",
				"https://nynus.edu.vn",
			}
			for _, allowed := range allowedOrigins {
				if origin == allowed {
					return true
				}
			}
			return false
		}),
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
	)

	// Create HTTP handler with CORS for gRPC-Gateway
	grpcGatewayHandler := corsHandler.Handler(s.mux)

	// Create health check handler
	healthHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("DEBUG: *** HEALTH CHECK ENDPOINT MATCHED *** - URL: %s, Method: %s\n", r.URL.Path, r.Method)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","service":"exam-bank-backend","timestamp":"` +
			fmt.Sprintf("%d", time.Now().Unix()) + `"}`))
	})

	// Wrap health handler with CORS
	healthHandlerWithCORS := corsHandler.Handler(healthHandler)

	// Create a multiplexer that routes requests to either gRPC-Web or gRPC-Gateway
	// gRPC-Web requests go to grpcWebWrapper
	// Other requests go to gRPC-Gateway
	combinedHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if this is a gRPC-Web request
		if isGrpcWebRequest(r) {
			fmt.Printf("DEBUG: Routing to gRPC-Web wrapper - URL: %s\n", r.URL.Path)
			grpcWebWrapper.ServeHTTP(w, r)
		} else {
			fmt.Printf("DEBUG: Routing to gRPC-Gateway - URL: %s\n", r.URL.Path)
			grpcGatewayHandler.ServeHTTP(w, r)
		}
	})

	// Start HTTP server
	addr := fmt.Sprintf(":%s", s.httpPort)
	fmt.Printf("🌐 Starting HTTP/gRPC-Gateway + gRPC-Web server on %s\n", addr)

	// Create a simple handler that routes requests
	return http.ListenAndServe(addr, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("DEBUG: *** MAIN HANDLER CALLED *** - URL: %s, Method: %s\n", r.URL.Path, r.Method)

		// Handle health check endpoint with CORS
		if r.URL.Path == "/health" {
			healthHandlerWithCORS.ServeHTTP(w, r)
			return
		}

		// Handle all other requests with combined handler (gRPC-Web + gRPC-Gateway)
		fmt.Printf("DEBUG: *** FORWARDING TO COMBINED HANDLER *** - URL: %s, Method: %s\n", r.URL.Path, r.Method)
		combinedHandler.ServeHTTP(w, r)
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
