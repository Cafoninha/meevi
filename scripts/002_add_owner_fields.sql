-- Add age and gender columns to owners table
ALTER TABLE owners
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('masculino', 'feminino'));
