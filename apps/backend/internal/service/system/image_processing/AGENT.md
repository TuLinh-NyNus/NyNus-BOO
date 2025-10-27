# Image Processing Service Agent Guide
*Processes question images and uploads*

## Files
- `image_processing.go` — Core pipeline logic.
- `worker_pool.go` — Concurrency management for processing jobs.
- `google_drive_uploader.go` — Upload integration with Google Drive.

## Responsibilities
- Resize, optimise, and upload images used in questions/exams.
- Manage worker pools for throughput.

## Maintenance
- Monitor external API quotas (e.g., Google Drive).
- Extend with new storage targets when needed.

