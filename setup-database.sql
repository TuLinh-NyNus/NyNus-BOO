-- Setup script for Exam Bank Database
-- Run this with: psql -U postgres -f setup-database.sql

-- Create user
CREATE USER exam_bank_user WITH PASSWORD 'exam_bank_password';

-- Create database
CREATE DATABASE exam_bank_db OWNER exam_bank_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE exam_bank_db TO exam_bank_user;

-- Connect to the new database
\c exam_bank_db

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO exam_bank_user;

-- Create a test table to verify setup
CREATE TABLE health_check (
    id SERIAL PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant table privileges
GRANT ALL PRIVILEGES ON TABLE health_check TO exam_bank_user;
GRANT USAGE, SELECT ON SEQUENCE health_check_id_seq TO exam_bank_user;

-- Insert test data
INSERT INTO health_check (status) VALUES ('Database setup completed successfully');

-- Display success message
SELECT 'Database setup completed successfully!' as message;
