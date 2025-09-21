package server

import (
	"context"
	"fmt"
	"net/http"
	"strings"

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

	// Create HTTP handler with CORS
	handler := corsHandler.Handler(s.mux)

	// Add gRPC-Web wrapper
	wrappedHandler := wrapGrpcWeb(handler)

	// Start HTTP server
	addr := fmt.Sprintf(":%s", s.httpPort)
	fmt.Printf("🌐 Starting HTTP/gRPC-Gateway server on %s\n", addr)

	return http.ListenAndServe(addr, wrappedHandler)
}

// Stop stops the HTTP server
func (s *HTTPServer) Stop(ctx context.Context) error {
	// In production, you would want to use http.Server with Shutdown()
	// For now, this is a placeholder
	return nil
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

	// Register ExamService (when available)
	// if err := v1.RegisterExamServiceHandlerFromEndpoint(ctx, s.mux, endpoint, opts); err != nil {
	//     return fmt.Errorf("failed to register ExamService: %w", err)
	// }

	return nil
}

// wrapGrpcWeb wraps the handler to support gRPC-Web
func wrapGrpcWeb(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if this is a gRPC-Web request
		if isGrpcWebRequest(r) {
			// Add gRPC-Web specific headers
			w.Header().Set("Content-Type", "application/grpc-web+proto")
		}

		// Serve the request
		h.ServeHTTP(w, r)
	})
}

// isGrpcWebRequest checks if the request is a gRPC-Web request
func isGrpcWebRequest(r *http.Request) bool {
	contentType := r.Header.Get("Content-Type")
	return strings.HasPrefix(contentType, "application/grpc-web") ||
		r.Header.Get("X-Grpc-Web") == "1"
}
