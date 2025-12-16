-- Add photo field to dogs table
ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS photo TEXT;
