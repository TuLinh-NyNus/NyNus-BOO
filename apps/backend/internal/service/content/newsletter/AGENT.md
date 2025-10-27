# Newsletter Service Agent Guide
*Manages newsletter subscriptions and messaging*

## File
- `newsletter_mgmt.go` — Handles opt-in/out flows, subscription validation, and notification triggers.

## Responsibilities
- Coordinate with `repository.NewsletterRepository`.
- Integrate with email service for confirmation and broadcast emails.

## Maintenance
- Ensure compliance with unsubscribe/consent requirements.
- Add rate limiting or verification as subscriber base grows.
