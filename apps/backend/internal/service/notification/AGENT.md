# Notification Service Agent Guide
*Handles user/system notifications*

## File
- `notification.go` — Service responsible for queuing and delivering notifications.

## Features
- Supports multi-channel delivery (email, in-app) through integrations.
- Works with repository layer to persist preferences and audit.

## Maintenance
- Extend with batching or throttling when notification volume rises.
- Sync message templates with frontend/email tooling.

