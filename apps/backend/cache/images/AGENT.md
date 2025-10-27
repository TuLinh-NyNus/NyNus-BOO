# Cached Images Agent Guide
*Runtime-generated image assets for backend processing*

## Overview
- Contains resized, optimised, or temporary question images used by services.
- Populated by `internal/service/system/image_processing` jobs and import routines.

## Handling
- Safe to delete when troubleshooting; backend regenerates as needed.
- Avoid committing contents; add troubleshooting artefacts elsewhere.
- Large volume indicates data import; monitor disk usage if exceeded.
