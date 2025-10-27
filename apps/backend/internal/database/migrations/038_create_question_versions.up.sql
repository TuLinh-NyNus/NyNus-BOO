-- Migration: Create question_versions table for version control
-- Created: 2025-01-26
-- Purpose: Track all changes to questions for audit trail and rollback

-- Create question_versions table
CREATE TABLE IF NOT EXISTS question_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  
  -- Question data snapshot
  content TEXT NOT NULL,
  raw_content TEXT,
  structured_answers JSONB,
  json_answers JSONB,
  structured_correct JSONB,
  json_correct_answer JSONB,
  solution TEXT,
  tag TEXT[],
  difficulty VARCHAR(20),
  status VARCHAR(20),
  question_type VARCHAR(50),
  source TEXT,
  
  -- Version metadata
  changed_by TEXT NOT NULL,
  change_reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Full snapshot for safety
  full_snapshot JSONB NOT NULL,
  
  -- Constraints
  CONSTRAINT fk_question_versions_question 
    FOREIGN KEY (question_id) 
    REFERENCES question(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_question_versions_user 
    FOREIGN KEY (changed_by) 
    REFERENCES users(id) 
    ON DELETE SET NULL,
  CONSTRAINT unique_question_version 
    UNIQUE(question_id, version_number),
  CONSTRAINT positive_version_number 
    CHECK (version_number > 0)
);

-- Create indexes for performance
CREATE INDEX idx_question_versions_question_id 
  ON question_versions(question_id);

CREATE INDEX idx_question_versions_changed_at 
  ON question_versions(changed_at DESC);

CREATE INDEX idx_question_versions_changed_by 
  ON question_versions(changed_by);

-- Create function to automatically create version on update
CREATE OR REPLACE FUNCTION create_question_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version_number INTEGER;
  current_user_id UUID;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version_number
  FROM question_versions
  WHERE question_id = OLD.id;
  
  -- Get current user ID from updated_by field or use a default
  current_user_id := OLD.updated_by;
  
  -- If no user specified, skip version creation
  IF current_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Insert version record
  INSERT INTO question_versions (
    question_id,
    version_number,
    content,
    raw_content,
    structured_answers,
    json_answers,
    structured_correct,
    json_correct_answer,
    solution,
    tag,
    difficulty,
    status,
    question_type,
    source,
    changed_by,
    change_reason,
    changed_at,
    full_snapshot
  ) VALUES (
    OLD.id,
    next_version_number,
    OLD.content,
    OLD.raw_content,
    OLD.structured_answers,
    OLD.json_answers,
    OLD.structured_correct,
    OLD.json_correct_answer,
    OLD.solution,
    OLD.tag,
    OLD.difficulty,
    OLD.status,
    OLD.type,
    OLD.source,
    current_user_id,
    'Automatic version created on update',
    OLD.updated_at,
    to_jsonb(OLD.*)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create versions
CREATE TRIGGER question_version_trigger
  BEFORE UPDATE ON question
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION create_question_version();

-- Add comment for documentation
COMMENT ON TABLE question_versions IS 'Stores historical versions of questions for audit trail and rollback';
COMMENT ON COLUMN question_versions.version_number IS 'Sequential version number starting from 1';
COMMENT ON COLUMN question_versions.full_snapshot IS 'Complete question data as JSONB for guaranteed restoration';
COMMENT ON COLUMN question_versions.change_reason IS 'Optional reason for the change, required for manual reverts';

