package grpc

import (
	"context"
	"fmt"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/service/content/contact"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// ContactServiceServer implements the ContactService gRPC service
type ContactServiceServer struct {
	v1.UnimplementedContactServiceServer
	contactMgmt *contact.ContactMgmt
}

// NewContactServiceServer creates a new ContactService server
func NewContactServiceServer(contactMgmt *contact.ContactMgmt) *ContactServiceServer {
	return &ContactServiceServer{
		contactMgmt: contactMgmt,
	}
}

// SubmitContactForm handles contact form submissions (public endpoint)
func (s *ContactServiceServer) SubmitContactForm(ctx context.Context, req *v1.ContactFormRequest) (*v1.ContactFormResponse, error) {
	// Extract metadata for IP address and user agent
	md, _ := metadata.FromIncomingContext(ctx)

	// Create request for management service
	mgmtRequest := &contact.ContactFormRequest{
		Name:    req.Name,
		Email:   req.Email,
		Subject: req.Subject,
		Message: req.Message,
	}

	// Add phone if provided
	if req.Phone != "" {
		mgmtRequest.Phone = &req.Phone
	}

	// Extract IP address from metadata
	if forwardedFor := md.Get("x-forwarded-for"); len(forwardedFor) > 0 {
		mgmtRequest.IPAddress = forwardedFor[0]
	} else if realIP := md.Get("x-real-ip"); len(realIP) > 0 {
		mgmtRequest.IPAddress = realIP[0]
	}

	// Extract user agent from metadata
	if userAgent := md.Get("user-agent"); len(userAgent) > 0 {
		mgmtRequest.UserAgent = userAgent[0]
	}

	// Submit contact form
	submission, err := s.contactMgmt.SubmitContactForm(mgmtRequest)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "failed to submit contact form: %v", err)
	}

	// Convert to proto response
	response := &v1.ContactFormResponse{
		Response: &common.Response{
			Success: true,
			Message: "Contact form submitted successfully. We will respond as soon as possible.",
		},
		Submission: s.entityToProto(submission),
	}

	return response, nil
}

// ListContacts retrieves contact submissions (admin only)
func (s *ContactServiceServer) ListContacts(ctx context.Context, req *v1.ListContactsRequest) (*v1.ListContactsResponse, error) {
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

	// Get contacts from management service
	submissions, totalCount, err := s.contactMgmt.ListContacts(
		req.Status,
		req.Search,
		int(page),
		int(pageSize),
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list contacts: %v", err)
	}

	// Get unread count
	unreadCount, _ := s.contactMgmt.GetUnreadCount()

	// Convert to proto
	protoSubmissions := make([]*v1.ContactSubmission, len(submissions))
	for i, submission := range submissions {
		protoSubmissions[i] = s.entityToProto(submission)
	}

	// Calculate total pages
	totalPages := (totalCount + int(pageSize) - 1) / int(pageSize)

	response := &v1.ListContactsResponse{
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Found %d contacts", totalCount),
		},
		Submissions: protoSubmissions,
		Pagination: &common.PaginationResponse{
			Page:       page,
			Limit:      pageSize,
			TotalCount: int32(totalCount),
			TotalPages: int32(totalPages),
		},
		TotalUnread: int32(unreadCount),
	}

	return response, nil
}

// GetContact retrieves a specific contact submission (admin only)
func (s *ContactServiceServer) GetContact(ctx context.Context, req *v1.GetContactRequest) (*v1.GetContactResponse, error) {
	// Get contact from management service
	submission, err := s.contactMgmt.GetContact(req.Id)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "contact not found: %v", err)
	}

	response := &v1.GetContactResponse{
		Response: &common.Response{
			Success: true,
			Message: "Contact retrieved successfully",
		},
		Submission: s.entityToProto(submission),
	}

	return response, nil
}

// UpdateContactStatus updates the status of a contact submission (admin only)
func (s *ContactServiceServer) UpdateContactStatus(ctx context.Context, req *v1.UpdateContactStatusRequest) (*v1.UpdateContactStatusResponse, error) {
	// Update status
	if err := s.contactMgmt.UpdateContactStatus(req.Id, req.Status); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "failed to update status: %v", err)
	}

	// Get updated contact
	submission, err := s.contactMgmt.GetContact(req.Id)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to retrieve updated contact: %v", err)
	}

	response := &v1.UpdateContactStatusResponse{
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Contact status updated to %s", req.Status),
		},
		Submission: s.entityToProto(submission),
	}

	return response, nil
}

// DeleteContact removes a contact submission (admin only)
func (s *ContactServiceServer) DeleteContact(ctx context.Context, req *v1.DeleteContactRequest) (*v1.DeleteContactResponse, error) {
	// Delete contact
	if err := s.contactMgmt.DeleteContact(req.Id); err != nil {
		return nil, status.Errorf(codes.NotFound, "failed to delete contact: %v", err)
	}

	response := &v1.DeleteContactResponse{
		Response: &common.Response{
			Success: true,
			Message: "Contact deleted successfully",
		},
	}

	return response, nil
}

// Helper function to convert entity to proto
func (s *ContactServiceServer) entityToProto(e *entity.ContactSubmission) *v1.ContactSubmission {
	proto := &v1.ContactSubmission{
		Id:           e.ID.String(),
		Name:         e.Name,
		Email:        e.Email,
		Subject:      e.Subject,
		Message:      e.Message,
		Status:       string(e.Status),
		SubmissionId: e.SubmissionID,
		CreatedAt:    timestamppb.New(e.CreatedAt),
		UpdatedAt:    timestamppb.New(e.UpdatedAt),
	}

	// Add optional fields
	if e.Phone != nil {
		proto.Phone = *e.Phone
	}

	return proto
}

