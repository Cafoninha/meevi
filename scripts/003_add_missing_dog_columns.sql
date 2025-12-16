-- Add missing columns to dogs table
ALTER TABLE dogs 
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Não especificado',
ADD COLUMN IF NOT EXISTS weight TEXT DEFAULT '0';

-- Update RLS policies to include new columns (already covered by existing policies)
COMMENT ON COLUMN dogs.gender IS 'Gênero do cachorro (Macho, Fêmea, Não especificado)';
COMMENT ON COLUMN dogs.weight IS 'Peso do cachorro em kg';
