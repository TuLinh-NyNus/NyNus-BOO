package grpc

import "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"

func convertStatusToProto(status string) common.UserStatus {
	return ConvertStatusToProto(status)
}
