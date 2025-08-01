package middleware

import (
	"context"
	"strings"

	"exam-bank-system/backend/internal/service/auth"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type AuthInterceptor struct {
	authService   auth.ServiceInterface
	publicMethods map[string]bool
}

func NewAuthInterceptor(authService auth.ServiceInterface) *AuthInterceptor {
	// Define public methods that don't require authentication
	publicMethods := map[string]bool{
		"/v1.UserService/Login":    true,
		"/v1.UserService/Register": true,
	}

	return &AuthInterceptor{
		authService:   authService,
		publicMethods: publicMethods,
	}
}

func (interceptor *AuthInterceptor) Unary() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		// Check if method is public
		if interceptor.publicMethods[info.FullMethod] {
			return handler(ctx, req)
		}

		// Extract token from metadata
		token, err := interceptor.extractToken(ctx)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, "missing or invalid token: %v", err)
		}

		// Validate token
		claims, err := interceptor.authService.ValidateToken(token)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, "invalid token: %v", err)
		}

		// Add user info to context
		ctx = context.WithValue(ctx, "user_id", claims.UserID)
		ctx = context.WithValue(ctx, "user_email", claims.Email)
		ctx = context.WithValue(ctx, "user_role", claims.Role)

		return handler(ctx, req)
	}
}

func (interceptor *AuthInterceptor) extractToken(ctx context.Context) (string, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return "", status.Errorf(codes.Unauthenticated, "missing metadata")
	}

	authHeader := md.Get("authorization")
	if len(authHeader) == 0 {
		return "", status.Errorf(codes.Unauthenticated, "missing authorization header")
	}

	// Expected format: "Bearer <token>"
	parts := strings.SplitN(authHeader[0], " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return "", status.Errorf(codes.Unauthenticated, "invalid authorization header format")
	}

	return parts[1], nil
}

// Helper functions to extract user info from context
func GetUserIDFromContext(ctx context.Context) (string, error) {
	userID, ok := ctx.Value("user_id").(string)
	if !ok {
		return "", status.Errorf(codes.Internal, "user ID not found in context")
	}
	return userID, nil
}

func GetUserRoleFromContext(ctx context.Context) (string, error) {
	role, ok := ctx.Value("user_role").(string)
	if !ok {
		return "", status.Errorf(codes.Internal, "user role not found in context")
	}
	return role, nil
}
