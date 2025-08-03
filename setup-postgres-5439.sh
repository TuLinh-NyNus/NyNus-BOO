#!/bin/bash

# Setup PostgreSQL on port 5439 for Exam Bank System
echo "🔧 Setting up PostgreSQL on port 5439..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first."
    exit 1
fi

# Stop PostgreSQL service
echo "⏹️  Stopping PostgreSQL service..."
sudo systemctl stop postgresql

# Backup original configuration
echo "💾 Backing up original postgresql.conf..."
sudo cp /etc/postgresql/14/main/postgresql.conf /etc/postgresql/14/main/postgresql.conf.backup

# Update port in postgresql.conf
echo "🔧 Updating PostgreSQL port to 5439..."
sudo sed -i "s/^port = 5432/port = 5439/" /etc/postgresql/14/main/postgresql.conf

# Verify the change
echo "✅ Verifying port configuration..."
grep "^port" /etc/postgresql/14/main/postgresql.conf

# Start PostgreSQL service
echo "🚀 Starting PostgreSQL service..."
sudo systemctl start postgresql

# Wait a moment for service to start
sleep 3

# Check if PostgreSQL is running on port 5439
echo "🔍 Checking if PostgreSQL is running on port 5439..."
if pg_isready -h localhost -p 5439; then
    echo "✅ PostgreSQL is successfully running on port 5439!"
else
    echo "❌ PostgreSQL failed to start on port 5439. Checking logs..."
    sudo journalctl -u postgresql -n 10 --no-pager
    
    # Restore original configuration
    echo "🔄 Restoring original configuration..."
    sudo cp /etc/postgresql/14/main/postgresql.conf.backup /etc/postgresql/14/main/postgresql.conf
    sudo systemctl restart postgresql
    echo "❌ Setup failed. Original configuration restored."
    exit 1
fi

# Create database and user if they don't exist
echo "🗄️  Setting up database and user..."
sudo -u postgres psql -p 5439 -c "CREATE USER exam_bank_user WITH PASSWORD 'exam_bank_password';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -p 5439 -c "CREATE DATABASE exam_bank_db OWNER exam_bank_user;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -p 5439 -c "GRANT ALL PRIVILEGES ON DATABASE exam_bank_db TO exam_bank_user;" 2>/dev/null

# Test connection
echo "🧪 Testing database connection..."
if PGPASSWORD=exam_bank_password psql -h localhost -p 5439 -U exam_bank_user -d exam_bank_db -c "SELECT 1;" &>/dev/null; then
    echo "✅ Database connection successful!"
    echo ""
    echo "🎉 PostgreSQL setup complete!"
    echo "📋 Configuration:"
    echo "   Host: localhost"
    echo "   Port: 5439"
    echo "   Database: exam_bank_db"
    echo "   User: exam_bank_user"
    echo "   Password: exam_bank_password"
    echo ""
    echo "🚀 You can now start your backend server!"
else
    echo "❌ Database connection failed!"
    exit 1
fi
