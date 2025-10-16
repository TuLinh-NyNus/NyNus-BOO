#!/bin/bash
# Initialize pg_hba.conf for development environment
# This script runs during PostgreSQL container initialization

set -e

# Copy custom pg_hba.conf to data directory
echo "Copying custom pg_hba.conf..."
cat > /var/lib/postgresql/data/pg_hba.conf << 'EOF'
# PostgreSQL Client Authentication Configuration File
# NyNus Exam Bank System - Development Configuration
#
# This configuration allows connections from host machine for development
# Uses md5 authentication for compatibility

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     md5

# IPv4 local connections - MD5 for localhost
host    all             all             127.0.0.1/32            md5

# IPv6 local connections
host    all             all             ::1/128                 md5

# Allow replication connections from localhost
local   replication     all                                     md5
host    replication     all             127.0.0.1/32            md5
host    replication     all             ::1/128                 md5

# Allow connections from Docker network (172.x.x.x) - DEVELOPMENT ONLY
host    all             all             172.16.0.0/12           md5

# Allow connections from host machine (all IPs) - DEVELOPMENT ONLY
host    all             all             0.0.0.0/0               md5
EOF

echo "pg_hba.conf configured successfully"

