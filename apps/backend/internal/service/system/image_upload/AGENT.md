# Image Upload Service Agent Guide
*Coordinates image upload lifecycle*

## File
- `image_upload_mgmt.go` — Validates and stores uploaded images, tying into processing pipeline.

## Maintenance
- Ensure security checks (file type, size) stay aligned with frontend validation.
- Add virus scanning integration if required.

