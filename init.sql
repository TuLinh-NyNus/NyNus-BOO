-- Initialize Exam Bank Database
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant additional privileges to the user
GRANT ALL PRIVILEGES ON DATABASE exam_bank_db TO exam_bank_user;

-- Create a simple test table to verify setup
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a test record
INSERT INTO health_check (status) VALUES ('Database initialized successfully');

-- Grant permissions on the test table
GRANT ALL PRIVILEGES ON TABLE health_check TO exam_bank_user;
GRANT USAGE, SELECT ON SEQUENCE health_check_id_seq TO exam_bank_user;
