# NyNus Production Deployment Guide

## Overview
This guide covers the complete deployment process for the NyNus Exam Bank System, including Go environment setup, performance optimizations, and monitoring configuration.

## Prerequisites

### System Requirements
- **Operating System**: Ubuntu 20.04+ or CentOS 8+
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: Minimum 100GB SSD
- **CPU**: Minimum 4 cores (8 cores recommended)
- **Network**: Stable internet connection with 1Gbps bandwidth

### Software Requirements
- **Go**: Version 1.23.0 (exact version required)
- **Node.js**: Version 18+ 
- **PostgreSQL**: Version 15+
- **Docker**: Version 24+
- **Docker Compose**: Version 2.20+

## Go Environment Setup

### 1. Install Go 1.23.0
```bash
# Remove existing Go installation
sudo rm -rf /usr/local/go

# Download and install Go 1.23.0
wget https://go.dev/dl/go1.23.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz

# Add to PATH
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Verify installation
go version  # Should output: go version go1.23.0 linux/amd64
```

### 2. Configure Go Environment
```bash
# Set Go environment variables
export GOROOT=/usr/local/go
export GOPATH=$HOME/go
export GOTOOLCHAIN=auto
export GOPROXY=https://proxy.golang.org,direct
export GOSUMDB=sum.golang.org

# Add to ~/.bashrc for persistence
echo 'export GOROOT=/usr/local/go' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export GOTOOLCHAIN=auto' >> ~/.bashrc
echo 'export GOPROXY=https://proxy.golang.org,direct' >> ~/.bashrc
echo 'export GOSUMDB=sum.golang.org' >> ~/.bashrc
```

### 3. Verify Go Environment
```bash
# Check Go environment
go env GOROOT GOPATH GOTOOLCHAIN GOPROXY

# Test build capability
cd /path/to/exam-bank-system/apps/backend
go mod tidy
go build -o bin/backend ./cmd/main.go
```

## Database Setup

### 1. PostgreSQL Installation
```bash
# Install PostgreSQL 15
sudo apt update
sudo apt install postgresql-15 postgresql-contrib-15

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Database Configuration
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE exam_bank_db;
CREATE USER exam_bank_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE exam_bank_db TO exam_bank_user;
\q
```

### 3. Performance Optimization
```sql
-- Edit /etc/postgresql/15/main/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 100
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

-- Enable query monitoring
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
```

## Application Deployment

### 1. Environment Configuration
```bash
# Create production environment file
cat > .env.production << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exam_bank_db
DB_USER=exam_bank_user
DB_PASSWORD=your_secure_password

# Server Configuration
GRPC_PORT=50051
HTTP_PORT=8080
ENV=production

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Performance Configuration
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=10
DB_CONN_MAX_LIFETIME=300
DB_CONN_MAX_IDLE_TIME=60

# Monitoring Configuration
ENABLE_METRICS=true
METRICS_PORT=9090
LOG_LEVEL=info
EOF
```

### 2. Build Applications
```bash
# Build backend
cd apps/backend
go mod tidy
go build -o bin/backend ./cmd/main.go

# Build frontend
cd ../frontend
npm install
npm run build
```

### 3. Database Migrations
```bash
# Run database migrations
cd apps/backend
./bin/backend migrate up

# Verify migrations
psql -h localhost -U exam_bank_user -d exam_bank_db -c "\dt"
```

## Docker Deployment

### 1. Docker Compose Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: exam_bank_db
      POSTGRES_USER: exam_bank_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    command: >
      postgres
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c work_mem=4MB
      -c maintenance_work_mem=64MB
      -c max_connections=100

  backend:
    build:
      context: .
      dockerfile: docker/backend.prod.Dockerfile
    environment:
      - DB_HOST=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "50051:50051"
      - "8080:8080"
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: docker/frontend.prod.Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8080
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### 2. Deploy with Docker
```bash
# Set environment variables
export DB_PASSWORD=your_secure_password
export JWT_SECRET=your_super_secure_jwt_secret

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
```

## Performance Optimization

### 1. Database Performance
```bash
# Apply performance indexes
psql -h localhost -U exam_bank_user -d exam_bank_db -f apps/backend/internal/database/migrations/000009_performance_optimization_indexes.up.sql

# Verify index usage
psql -h localhost -U exam_bank_user -d exam_bank_db -c "SELECT * FROM index_usage ORDER BY idx_scan DESC LIMIT 10;"
```

### 2. Application Performance
```bash
# Configure connection pooling
export DB_MAX_OPEN_CONNS=25
export DB_MAX_IDLE_CONNS=10
export DB_CONN_MAX_LIFETIME=300

# Enable performance monitoring
export ENABLE_METRICS=true
export METRICS_PORT=9090
```

### 3. Frontend Performance
```bash
# Build optimized frontend
cd apps/frontend
npm run build

# Verify build optimization
npm run analyze
```

## Monitoring and Logging

### 1. Application Monitoring
```bash
# Install Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvfz prometheus-2.40.0.linux-amd64.tar.gz
sudo mv prometheus-2.40.0.linux-amd64 /opt/prometheus

# Configure Prometheus
cat > /opt/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nynus-backend'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
EOF
```

### 2. Log Management
```bash
# Configure log rotation
sudo cat > /etc/logrotate.d/nynus << EOF
/var/log/nynus/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nynus nynus
    postrotate
        systemctl reload nynus-backend
    endscript
}
EOF
```

## Security Configuration

### 1. Firewall Setup
```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8080/tcp  # Backend HTTP
sudo ufw allow 50051/tcp # Backend gRPC
```

### 2. SSL/TLS Configuration
```bash
# Install Certbot
sudo apt install certbot

# Generate SSL certificates
sudo certbot certonly --standalone -d your-domain.com

# Configure Nginx reverse proxy
sudo apt install nginx
```

## Health Checks and Monitoring

### 1. Health Check Endpoints
```bash
# Backend health check
curl http://localhost:8080/health

# Database health check
psql -h localhost -U exam_bank_user -d exam_bank_db -c "SELECT 1;"

# Frontend health check
curl http://localhost:3000/api/health
```

### 2. Performance Monitoring
```bash
# Monitor memory usage
free -h

# Monitor CPU usage
top

# Monitor disk usage
df -h

# Monitor database performance
psql -h localhost -U exam_bank_user -d exam_bank_db -c "SELECT * FROM slow_queries LIMIT 5;"
```

## Backup and Recovery

### 1. Database Backup
```bash
# Create backup script
cat > /opt/scripts/backup-db.sh << EOF
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U exam_bank_user exam_bank_db > $BACKUP_DIR/exam_bank_db_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF

chmod +x /opt/scripts/backup-db.sh

# Schedule daily backups
echo "0 2 * * * /opt/scripts/backup-db.sh" | crontab -
```

### 2. Application Backup
```bash
# Backup application files
tar -czf /opt/backups/nynus-app-$(date +%Y%m%d).tar.gz /opt/nynus

# Backup configuration
cp -r /opt/nynus/config /opt/backups/config-$(date +%Y%m%d)
```

## Troubleshooting

### Common Issues

1. **Go Build Failures**
   ```bash
   # Check Go version
   go version
   
   # Clean module cache
   go clean -modcache
   go mod tidy
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test connection
   psql -h localhost -U exam_bank_user -d exam_bank_db
   ```

3. **Performance Issues**
   ```bash
   # Check slow queries
   psql -h localhost -U exam_bank_user -d exam_bank_db -c "SELECT * FROM slow_queries;"
   
   # Monitor memory usage
   free -h && ps aux --sort=-%mem | head
   ```

### Emergency Procedures

1. **Service Restart**
   ```bash
   docker-compose -f docker-compose.prod.yml restart
   ```

2. **Database Recovery**
   ```bash
   psql -h localhost -U exam_bank_user -d exam_bank_db < /opt/backups/latest_backup.sql
   ```

3. **Rollback Deployment**
   ```bash
   git checkout previous-stable-tag
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## Maintenance Schedule

### Daily Tasks
- Monitor system health
- Check application logs
- Verify backup completion

### Weekly Tasks
- Review performance metrics
- Update security patches
- Clean up old logs

### Monthly Tasks
- Database maintenance (VACUUM, ANALYZE)
- Security audit
- Capacity planning review

## Support Contacts

- **Technical Lead**: [contact-info]
- **DevOps Team**: [contact-info]
- **Database Admin**: [contact-info]
- **Emergency Hotline**: [contact-info]
