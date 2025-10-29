package grpc

import (
	"context"
	"fmt"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/service/content/newsletter"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// NewsletterServiceServer implements the NewsletterService gRPC service
type NewsletterServiceServer struct {
	v1.UnimplementedNewsletterServiceServer
	newsletterMgmt *newsletter.NewsletterMgmt
}

// NewNewsletterServiceServer creates a new NewsletterService server
func NewNewsletterServiceServer(newsletterMgmt *newsletter.NewsletterMgmt) *NewsletterServiceServer {
	return &NewsletterServiceServer{
		newsletterMgmt: newsletterMgmt,
	}
}

// Subscribe handles newsletter subscription (public endpoint)
func (s *NewsletterServiceServer) Subscribe(ctx context.Context, req *v1.NewsletterSubscribeRequest) (*v1.NewsletterSubscribeResponse, error) {
	// Extract metadata for IP address
	md, _ := metadata.FromIncomingContext(ctx)

	// Create request for management service
	mgmtRequest := &newsletter.SubscribeRequest{
		Email:    req.Email,
		Tags:     req.Tags,
		Metadata: make(map[string]interface{}),
	}

	// Convert metadata map
	if req.Metadata != nil {
		for k, v := range req.Metadata {
			mgmtRequest.Metadata[k] = v
		}
	}

	// Extract IP address from metadata
	if forwardedFor := md.Get("x-forwarded-for"); len(forwardedFor) > 0 {
		mgmtRequest.IPAddress = forwardedFor[0]
	} else if realIP := md.Get("x-real-ip"); len(realIP) > 0 {
		mgmtRequest.IPAddress = realIP[0]
	}

	// Subscribe via management service
	subscription, err := s.newsletterMgmt.Subscribe(mgmtRequest)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "failed to subscribe: %v", err)
	}

	// Convert to proto response
	response := &v1.NewsletterSubscribeResponse{
		Response: &common.Response{
			Success: true,
			Message: "Successfully subscribed to newsletter! Please check your email for confirmation.",
		},
		Subscription: s.entityToProto(subscription),
	}

	return response, nil
}

// Unsubscribe handles newsletter unsubscription (public endpoint)
func (s *NewsletterServiceServer) Unsubscribe(ctx context.Context, req *v1.NewsletterUnsubscribeRequest) (*v1.NewsletterUnsubscribeResponse, error) {
	// Unsubscribe via management service
	if err := s.newsletterMgmt.Unsubscribe(req.Email, req.Reason); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "failed to unsubscribe: %v", err)
	}

	response := &v1.NewsletterUnsubscribeResponse{
		Response: &common.Response{
			Success: true,
			Message: "Successfully unsubscribed from newsletter. We're sorry to see you go!",
		},
	}

	return response, nil
}

// ListSubscriptions retrieves newsletter subscriptions (admin only)
func (s *NewsletterServiceServer) ListSubscriptions(ctx context.Context, req *v1.ListSubscriptionsRequest) (*v1.ListSubscriptionsResponse, error) {
	// Parse pagination
	page := int32(1)
	pageSize := int32(20)
	if req.Pagination != nil {
		if req.Pagination.Page > 0 {
			page = req.Pagination.Page
		}
		if req.Pagination.Limit > 0 && req.Pagination.Limit <= 100 {
			pageSize = req.Pagination.Limit
		}
	}

	// Get subscriptions from management service
	subscriptions, totalCount, err := s.newsletterMgmt.ListSubscriptions(
		req.Status,
		req.Search,
		req.Tags,
		int(page),
		int(pageSize),
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list subscriptions: %v", err)
	}

	// Get statistics
	stats, err := s.newsletterMgmt.GetStats()
	if err != nil {
		// Don't fail the request if stats fail
		stats = &newsletter.SubscriptionStats{}
	}

	// Convert to proto
	protoSubscriptions := make([]*v1.NewsletterSubscription, len(subscriptions))
	for i, subscription := range subscriptions {
		protoSubscriptions[i] = s.entityToProto(subscription)
	}

	// Calculate total pages
	totalPages := (totalCount + int(pageSize) - 1) / int(pageSize)

	response := &v1.ListSubscriptionsResponse{
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Found %d subscriptions", totalCount),
		},
		Subscriptions: protoSubscriptions,
		Pagination: &common.PaginationResponse{
			Page:       page,
			Limit:      pageSize,
			TotalCount: int32(totalCount),
			TotalPages: int32(totalPages),
		},
		Stats: &v1.SubscriptionStats{
			TotalActive:       int32(stats.TotalActive),
			TotalUnsubscribed: int32(stats.TotalUnsubscribed),
			TotalBounced:      int32(stats.TotalBounced),
			TotalPending:      int32(stats.TotalPending),
			NewThisWeek:       int32(stats.NewThisWeek),
			NewThisMonth:      int32(stats.NewThisMonth),
		},
	}

	return response, nil
}

// GetSubscription retrieves a specific subscription (admin only)
func (s *NewsletterServiceServer) GetSubscription(ctx context.Context, req *v1.GetSubscriptionRequest) (*v1.GetSubscriptionResponse, error) {
	// Get subscription from management service
	subscription, err := s.newsletterMgmt.GetSubscription(req.Email)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "subscription not found: %v", err)
	}

	response := &v1.GetSubscriptionResponse{
		Response: &common.Response{
			Success: true,
			Message: "Subscription retrieved successfully",
		},
		Subscription: s.entityToProto(subscription),
	}

	return response, nil
}

// UpdateSubscriptionTags updates tags for a subscription (admin only)
func (s *NewsletterServiceServer) UpdateSubscriptionTags(ctx context.Context, req *v1.UpdateSubscriptionTagsRequest) (*v1.UpdateSubscriptionTagsResponse, error) {
	// Update tags via management service
	subscription, err := s.newsletterMgmt.UpdateTags(req.Email, req.Tags)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "failed to update tags: %v", err)
	}

	response := &v1.UpdateSubscriptionTagsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Tags updated successfully",
		},
		Subscription: s.entityToProto(subscription),
	}

	return response, nil
}

// DeleteSubscription removes a subscription completely (admin only)
func (s *NewsletterServiceServer) DeleteSubscription(ctx context.Context, req *v1.DeleteSubscriptionRequest) (*v1.DeleteSubscriptionResponse, error) {
	// Delete subscription via management service
	if err := s.newsletterMgmt.DeleteSubscription(req.Id); err != nil {
		return nil, status.Errorf(codes.NotFound, "failed to delete subscription: %v", err)
	}

	response := &v1.DeleteSubscriptionResponse{
		Response: &common.Response{
			Success: true,
			Message: "Subscription deleted successfully",
		},
	}

	return response, nil
}

// Helper function to convert entity to proto
func (s *NewsletterServiceServer) entityToProto(e *entity.NewsletterSubscription) *v1.NewsletterSubscription {
	proto := &v1.NewsletterSubscription{
		Id:             e.ID.String(),
		Email:          e.Email,
		Status:         string(e.Status),
		SubscriptionId: e.SubscriptionID,
		Source:         e.Source,
		Tags:           e.Tags,
		Metadata:       make(map[string]string),
		CreatedAt:      timestamppb.New(e.CreatedAt),
		UpdatedAt:      timestamppb.New(e.UpdatedAt),
	}

	// Convert optional fields
	if e.ConfirmedAt != nil {
		proto.ConfirmedAt = timestamppb.New(*e.ConfirmedAt)
	}
	if e.UnsubscribedAt != nil {
		proto.UnsubscribedAt = timestamppb.New(*e.UnsubscribedAt)
	}
	if e.UnsubscribeReason != nil {
		proto.UnsubscribeReason = *e.UnsubscribeReason
	}

	// Convert metadata map
	if e.Metadata != nil {
		for k, v := range e.Metadata {
			proto.Metadata[k] = fmt.Sprintf("%v", v)
		}
	}

	return proto
}

